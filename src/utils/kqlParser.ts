/**
 * Kanji Query Language (KQL) Parser
 * 
 * Syntax:
 * - Prefixes: char:/kanji:, hanviet:/hv:, en:/english:, vn:/vietnamese:, 
 *             on:/onyomi:, kun:/kunyomi:, com:/component:, jlpt:, freq:/frequency:
 * - Operators: AND/&, OR/|, NOT/!, parentheses ()
 * - Comparison: <, >, <=, >=, ranges (e.g., freq:100-500)
 * - Quotes: "exact match"
 * - Default: searches all text fields if no prefix
 */

import type { KanjiData } from '../features/kanji/kanjiSlice';

// Token types for lexical analysis
export type TokenType =
  // Literals
  | 'TEXT'
  | 'QUOTED_STRING'
  | 'NUMBER'
  // Prefixes (map to KanjiData fields)
  | 'CHAR_PREFIX'       // char:/kanji: → kanji
  | 'HANVIET_PREFIX'    // hanviet:/hv: → hanViet
  | 'EN_PREFIX'         // en:/english: → meaning
  | 'VN_PREFIX'         // vn:/vietnamese: → vietnameseMeaning
  | 'ON_PREFIX'         // on:/onyomi: → onyomi[]
  | 'KUN_PREFIX'        // kun:/kunyomi: → kunyomi[]
  | 'COM_PREFIX'        // com:/component: → components
  | 'JLPT_PREFIX'       // jlpt: → jlptLevel
  | 'FREQ_PREFIX'       // freq:/frequency: → frequency
  // Operators
  | 'AND'              // AND or &
  | 'OR'               // OR or |
  | 'NOT'              // NOT or !
  // Comparison
  | 'LT'               // <
  | 'GT'               // >
  | 'LTE'              // <=
  | 'GTE'              // >=
  | 'RANGE'            // -
  // Grouping
  | 'LPAREN'           // (
  | 'RPAREN'           // )
  // Special
  | 'EOF'
  | 'ERROR';


export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export interface ParseError {
  message: string;
  position: number;
  token?: Token;
}

// Abstract Syntax Tree nodes
export type ASTNode = 
  | { type: 'AND', left: ASTNode, right: ASTNode }
  | { type: 'OR', left: ASTNode, right: ASTNode }
  | { type: 'NOT', operand: ASTNode }
  | { type: 'COMPARISON', operator: '<' | '>' | '<=' | '>=', field: string, value: number }
  | { type: 'RANGE', field: string, min: number, max: number }
  | { type: 'FIELD_SEARCH', field: keyof KanjiData | 'default', value: string, exact: boolean }
  | { type: 'GROUP', node: ASTNode };

// Prefix mappings to KanjiData fields
const PREFIX_TO_FIELD: Record<string, keyof KanjiData> = {
  'char': 'kanji',
  'kanji': 'kanji',
  'hanviet': 'hanViet',
  'hv': 'hanViet',
  'en': 'meaning',
  'english': 'meaning',
  'vn': 'vietnameseMeaning',
  'vietnamese': 'vietnameseMeaning',
  'on': 'onyomi',
  'onyomi': 'onyomi',
  'kun': 'kunyomi',
  'kunyomi': 'kunyomi',
  'com': 'components',
  'component': 'components',
  'jlpt': 'jlptLevel',
  'freq': 'frequency',
  'frequency': 'frequency',
};

// Helper function to convert JLPT level to numeric value for comparisons
// N5 (easiest) = 5, N4 = 4, N3 = 3, N2 = 2, N1 (hardest) = 1
function jlptToNumber(level: string): number | null {
  const match = level.toUpperCase().match(/N(\d)/);
  if (!match) return null;
  const num = parseInt(match[1]);
  return (num >= 1 && num <= 5) ? num : null;
}

// Tokenizer: converts query string to tokens
export class KQLTokenizer {
  private input: string;
  private position: number;
  private tokens: Token[];
  
  constructor(query: string) {
    this.input = query;
    this.position = 0;
    this.tokens = [];
  }
  
  tokenize(): Token[] {
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.position >= this.input.length) break;
      
      const char = this.input[this.position];
      
      // Handle quoted strings
      if (char === '"') {
        this.tokenizeQuotedString();
        continue;
      }
      
      // Handle operators and special characters
      if (char === '(') {
        this.tokens.push({ type: 'LPAREN', value: '(', position: this.position });
        this.position++;
        continue;
      }
      
      if (char === ')') {
        this.tokens.push({ type: 'RPAREN', value: ')', position: this.position });
        this.position++;
        continue;
      }
      
      if (char === '&') {
        this.tokens.push({ type: 'AND', value: '&', position: this.position });
        this.position++;
        continue;
      }
      
      if (char === '|') {
        this.tokens.push({ type: 'OR', value: '|', position: this.position });
        this.position++;
        continue;
      }
      
      if (char === '!') {
        this.tokens.push({ type: 'NOT', value: '!', position: this.position });
        this.position++;
        continue;
      }
      
      // Handle comparison operators
      if (char === '<') {
        if (this.peek() === '=') {
          this.tokens.push({ type: 'LTE', value: '<=', position: this.position });
          this.position += 2;
        } else {
          this.tokens.push({ type: 'LT', value: '<', position: this.position });
          this.position++;
        }
        continue;
      }
      
      if (char === '>') {
        if (this.peek() === '=') {
          this.tokens.push({ type: 'GTE', value: '>=', position: this.position });
          this.position += 2;
        } else {
          this.tokens.push({ type: 'GT', value: '>', position: this.position });
          this.position++;
        }
        continue;
      }
      
      // Handle text (including prefixes, keywords, numbers)
      this.tokenizeText();
    }
    
    this.tokens.push({ type: 'EOF', value: '', position: this.position });
    return this.tokens;
  }
  
  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }
  
  private peek(): string {
    return this.input[this.position + 1] || '';
  }
  
  private tokenizeQuotedString(): void {
    const start = this.position;
    this.position++; // Skip opening quote
    
    let value = '';
    while (this.position < this.input.length && this.input[this.position] !== '"') {
      if (this.input[this.position] === '\\' && this.peek() === '"') {
        value += '"';
        this.position += 2;
      } else {
        value += this.input[this.position];
        this.position++;
      }
    }
    
    if (this.position >= this.input.length) {
      this.tokens.push({ type: 'ERROR', value: 'Unclosed quote', position: start });
      return;
    }
    
    this.position++; // Skip closing quote
    this.tokens.push({ type: 'QUOTED_STRING', value, position: start });
  }
  
  private tokenizeText(): void {
    const start = this.position;
    let value = '';
    
    // Read until whitespace, special character, or colon
    while (
      this.position < this.input.length &&
      !/[\s()|&!<>":]/.test(this.input[this.position])
    ) {
      value += this.input[this.position];
      this.position++;
    }
    
    // Check if next character is a colon (prefix indicator)
    if (this.position < this.input.length && this.input[this.position] === ':') {
      const prefix = value.toLowerCase();
      const tokenType = this.getPrefixTokenType(prefix);
      this.tokens.push({ type: tokenType, value: prefix, position: start });
      this.position++; // Skip the colon
      return;
    }
    
    // Check if it's a keyword (AND, OR, NOT)
    const upper = value.toUpperCase();
    if (upper === 'AND') {
      this.tokens.push({ type: 'AND', value: upper, position: start });
      return;
    }
    if (upper === 'OR') {
      this.tokens.push({ type: 'OR', value: upper, position: start });
      return;
    }
    if (upper === 'NOT') {
      this.tokens.push({ type: 'NOT', value: upper, position: start });
      return;
    }
    
    // Check if it's a number or range (e.g., 100-500)
    if (/^\d+-\d+$/.test(value)) {
      this.tokens.push({ type: 'RANGE', value, position: start });
      return;
    }
    
    if (/^\d+$/.test(value)) {
      this.tokens.push({ type: 'NUMBER', value, position: start });
      return;
    }
    
    // Default: text
    this.tokens.push({ type: 'TEXT', value, position: start });
  }
  
  private getPrefixTokenType(prefix: string): TokenType {
    switch (prefix) {
      case 'char':
      case 'kanji':
        return 'CHAR_PREFIX';
      case 'hanviet':
      case 'hv':
        return 'HANVIET_PREFIX';
      case 'en':
      case 'english':
        return 'EN_PREFIX';
      case 'vn':
      case 'vietnamese':
        return 'VN_PREFIX';
      case 'on':
      case 'onyomi':
        return 'ON_PREFIX';
      case 'kun':
      case 'kunyomi':
        return 'KUN_PREFIX';
      case 'com':
      case 'component':
        return 'COM_PREFIX';
      case 'jlpt':
        return 'JLPT_PREFIX';
      case 'freq':
      case 'frequency':
        return 'FREQ_PREFIX';
      default:
        return 'TEXT';
    }
  }
}

// Parser: converts tokens to AST
export class KQLParser {
  private tokens: Token[];
  private position: number;
  private errors: ParseError[];
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
    this.errors = [];
  }
  
  parse(): { ast: ASTNode | null; errors: ParseError[] } {
    if (this.tokens.length === 0 || this.tokens[0].type === 'EOF') {
      return { ast: null, errors: [] };
    }
    
    const ast = this.parseExpression();
    return { ast, errors: this.errors };
  }
  
  private current(): Token {
    return this.tokens[this.position] || this.tokens[this.tokens.length - 1];
  }
  
  // Reserved for future use in parser optimization
  // @ts-expect-error - Helper method for lookahead parsing
  private peek(): Token {
    return this.tokens[this.position + 1] || this.tokens[this.tokens.length - 1];
  }
  
  private advance(): Token {
    const token = this.current();
    if (this.position < this.tokens.length - 1) {
      this.position++;
    }
    return token;
  }
  
  private parseExpression(): ASTNode | null {
    return this.parseOrExpression();
  }
  
  private parseOrExpression(): ASTNode | null {
    let left = this.parseAndExpression();
    if (!left) return null;
    
    while (this.current().type === 'OR') {
      this.advance(); // consume OR
      const right = this.parseAndExpression();
      if (!right) {
        this.errors.push({
          message: 'Expected expression after OR operator',
          position: this.current().position,
          token: this.current(),
        });
        return left;
      }
      left = { type: 'OR', left, right };
    }
    
    return left;
  }
  
  private parseAndExpression(): ASTNode | null {
    let left = this.parseNotExpression();
    if (!left) return null;
    
    while (this.current().type === 'AND') {
      this.advance(); // consume AND
      const right = this.parseNotExpression();
      if (!right) {
        this.errors.push({
          message: 'Expected expression after AND operator',
          position: this.current().position,
          token: this.current(),
        });
        return left;
      }
      left = { type: 'AND', left, right };
    }
    
    return left;
  }
  
  private parseNotExpression(): ASTNode | null {
    if (this.current().type === 'NOT') {
      this.advance(); // consume NOT
      const operand = this.parsePrimaryExpression();
      if (!operand) {
        this.errors.push({
          message: 'Expected expression after NOT operator',
          position: this.current().position,
          token: this.current(),
        });
        return null;
      }
      return { type: 'NOT', operand };
    }
    
    return this.parsePrimaryExpression();
  }
  
  private parsePrimaryExpression(): ASTNode | null {
    const token = this.current();
    
    // Handle parentheses
    if (token.type === 'LPAREN') {
      this.advance(); // consume (
      const node = this.parseExpression();
      if (this.current().type !== 'RPAREN') {
        this.errors.push({
          message: 'Expected closing parenthesis',
          position: this.current().position,
          token: this.current(),
        });
      } else {
        this.advance(); // consume )
      }
      return node ? { type: 'GROUP', node } : null;
    }
    
    // Handle prefix searches
    if (this.isPrefixToken(token.type)) {
      return this.parsePrefixSearch(token);
    }
    
    // Handle plain text/quoted string (default search)
    if (token.type === 'TEXT' || token.type === 'QUOTED_STRING') {
      const value = token.value;
      const exact = token.type === 'QUOTED_STRING';
      this.advance();
      return { type: 'FIELD_SEARCH', field: 'default', value, exact };
    }
    
    this.errors.push({
      message: `Unexpected token: ${token.value}`,
      position: token.position,
      token,
    });
    this.advance();
    return null;
  }
  
  private isPrefixToken(type: TokenType): boolean {
    return [
      'CHAR_PREFIX',
      'HANVIET_PREFIX',
      'EN_PREFIX',
      'VN_PREFIX',
      'ON_PREFIX',
      'KUN_PREFIX',
      'COM_PREFIX',
      'JLPT_PREFIX',
      'FREQ_PREFIX',
    ].includes(type);
  }
  
  private parsePrefixSearch(prefixToken: Token): ASTNode | null {
    const field = PREFIX_TO_FIELD[prefixToken.value];
    
    // Check if field mapping exists
    if (!field) {
      this.errors.push({
        message: `Unknown prefix: ${prefixToken.value}`,
        position: prefixToken.position,
        token: prefixToken,
      });
      return null;
    }
    
    this.advance(); // consume prefix
    
    const valueToken = this.current();
    
    // Handle frequency/number comparisons and ranges
    if (field === 'frequency') {
      // Check for comparison operators
      if (['LT', 'GT', 'LTE', 'GTE'].includes(valueToken.type)) {
        const operator = valueToken.value as '<' | '>' | '<=' | '>=';
        this.advance();
        const numToken = this.current();
        if (numToken.type !== 'NUMBER') {
          this.errors.push({
            message: 'Expected number after comparison operator',
            position: numToken.position,
            token: numToken,
          });
          return null;
        }
        this.advance();
        return { type: 'COMPARISON', operator, field, value: parseInt(numToken.value) };
      }
      
      // Check for range
      if (valueToken.type === 'RANGE') {
        const [min, max] = valueToken.value.split('-').map(Number);
        this.advance();
        return { type: 'RANGE', field, min, max };
      }
      
      // Direct number match
      if (valueToken.type === 'NUMBER') {
        this.advance();
        return { type: 'COMPARISON', operator: '==' as any, field, value: parseInt(valueToken.value) };
      }
    }
    
    // Handle JLPT level comparisons
    if (field === 'jlptLevel') {
      // Check for comparison operators
      if (['LT', 'GT', 'LTE', 'GTE'].includes(valueToken.type)) {
        const operator = valueToken.value as '<' | '>' | '<=' | '>=';
        this.advance();
        const levelToken = this.current();
        if (levelToken.type !== 'TEXT') {
          this.errors.push({
            message: 'Expected JLPT level (e.g., N3) after comparison operator',
            position: levelToken.position,
            token: levelToken,
          });
          return null;
        }
        const jlptNum = jlptToNumber(levelToken.value);
        if (jlptNum === null) {
          this.errors.push({
            message: `Invalid JLPT level: ${levelToken.value}. Use N1-N5`,
            position: levelToken.position,
            token: levelToken,
          });
          return null;
        }
        this.advance();
        return { type: 'COMPARISON', operator, field, value: jlptNum };
      }
    }
    
    // Handle text search for all other fields
    if (valueToken.type === 'TEXT' || valueToken.type === 'QUOTED_STRING') {
      const value = valueToken.value;
      const exact = valueToken.type === 'QUOTED_STRING';
      this.advance();
      
      return { type: 'FIELD_SEARCH', field, value, exact };
    }
    
    this.errors.push({
      message: `Expected value after ${prefixToken.value}:`,
      position: valueToken.position,
      token: valueToken,
    });
    return null;
  }
}

// Query evaluator: executes AST against kanji data
export class KQLEvaluator {
  private ast: ASTNode;
  
  constructor(ast: ASTNode) {
    this.ast = ast;
  }
  
  evaluate(kanjis: KanjiData[]): KanjiData[] {
    return kanjis.filter(kanji => this.evaluateNode(this.ast, kanji));
  }
  
  private evaluateNode(node: ASTNode, kanji: KanjiData): boolean {
    switch (node.type) {
      case 'AND':
        return this.evaluateNode(node.left, kanji) && this.evaluateNode(node.right, kanji);
      
      case 'OR':
        return this.evaluateNode(node.left, kanji) || this.evaluateNode(node.right, kanji);
      
      case 'NOT':
        return !this.evaluateNode(node.operand, kanji);
      
      case 'GROUP':
        return this.evaluateNode(node.node, kanji);
      
      case 'COMPARISON':
        return this.evaluateComparison(node, kanji);
      
      case 'RANGE':
        return this.evaluateRange(node, kanji);
      
      case 'FIELD_SEARCH':
        return this.evaluateFieldSearch(node, kanji);
      
      default:
        return false;
    }
  }
  
  private evaluateComparison(node: { operator: '<' | '>' | '<=' | '>='; field: string; value: number }, kanji: KanjiData): boolean {
    const fieldValue = (kanji as any)[node.field];
    
    // Special handling for JLPT level comparisons
    // Note: Operators are reversed because N1=1 < N2=2 numerically, but N1 > N2 in difficulty
    if (node.field === 'jlptLevel') {
      if (typeof fieldValue !== 'string') return false;
      const jlptNum = jlptToNumber(fieldValue);
      if (jlptNum === null) return false;
      
      switch (node.operator) {
        case '<': return jlptNum > node.value;  // Reversed: easier levels have higher numbers
        case '>': return jlptNum < node.value;  // Reversed: harder levels have lower numbers
        case '<=': return jlptNum >= node.value; // Reversed
        case '>=': return jlptNum <= node.value; // Reversed
        default: return false;
      }
    }
    
    // Standard numeric field comparison
    if (typeof fieldValue !== 'number') return false;
    
    switch (node.operator) {
      case '<': return fieldValue < node.value;
      case '>': return fieldValue > node.value;
      case '<=': return fieldValue <= node.value;
      case '>=': return fieldValue >= node.value;
      default: return false;
    }
  }
  
  private evaluateRange(node: { field: string; min: number; max: number }, kanji: KanjiData): boolean {
    const fieldValue = (kanji as any)[node.field];
    if (typeof fieldValue !== 'number') return false;
    return fieldValue >= node.min && fieldValue <= node.max;
  }
  
  private evaluateFieldSearch(node: { field: keyof KanjiData | 'default'; value: string; exact: boolean }, kanji: KanjiData): boolean {
    const searchValue = node.value.toLowerCase();
    
    // Default search: search all text fields
    if (node.field === 'default') {
      const textFields = [
        kanji.kanji,
        kanji.hanViet,
        kanji.meaning,
        kanji.vietnameseMeaning,
      ];
      
      return textFields.some(field => {
        if (!field) return false;
        const fieldValue = field.toLowerCase();
        return node.exact ? fieldValue === searchValue : fieldValue.includes(searchValue);
      });
    }
    
    // Field-specific search
    // Cast to any to avoid TypeScript issues with dynamic field access
    const fieldValue = (kanji as any)[node.field];
    
    if (fieldValue == null) {
      return false;
    }
    
    // Handle array fields (onyomi, kunyomi, category)
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(item => {
        const itemValue = String(item).toLowerCase();
        return node.exact ? itemValue === searchValue : itemValue.includes(searchValue);
      });
    }
    
    // Handle string fields
    if (typeof fieldValue === 'string') {
      const value = fieldValue.toLowerCase();
      return node.exact ? value === searchValue : value.includes(searchValue);
    }
    
    return false;
  }
}

// Main API: parse and execute KQL query
export function executeKQLQuery(query: string, kanjis: KanjiData[]): {
  results: KanjiData[];
  errors: ParseError[];
} {
  const tokenizer = new KQLTokenizer(query);
  const tokens = tokenizer.tokenize();
  
  const parser = new KQLParser(tokens);
  const { ast, errors } = parser.parse();
  
  if (!ast || errors.length > 0) {
    return { results: [], errors };
  }
  
  const evaluator = new KQLEvaluator(ast);
  const results = evaluator.evaluate(kanjis);
  
  // Limit to top 50 results
  return { results: results.slice(0, 50), errors: [] };
}

// Syntax validator (for real-time feedback without executing)
export function validateKQLSyntax(query: string): { valid: boolean; errors: ParseError[] } {
  const tokenizer = new KQLTokenizer(query);
  const tokens = tokenizer.tokenize();
  
  const parser = new KQLParser(tokens);
  const { ast, errors } = parser.parse();
  
  return { valid: errors.length === 0 && ast !== null, errors };
}

// Get suggestions for auto-complete
export function getKQLSuggestions(query: string, cursorPosition: number): string[] {
  const beforeCursor = query.slice(0, cursorPosition);
  const lastWord = beforeCursor.split(/\s+/).pop() || '';
  
  const suggestions: string[] = [];
  
  // Suggest prefixes
  if (!lastWord.includes(':')) {
    const prefixes = [
      'char:', 'kanji:', 'hanviet:', 'hv:', 'en:', 'english:', 
      'vn:', 'vietnamese:', 'on:', 'onyomi:', 'kun:', 'kunyomi:', 
      'com:', 'component:', 'jlpt:', 'freq:', 'frequency:'
    ];
    suggestions.push(...prefixes.filter(p => p.startsWith(lastWord.toLowerCase())));
  }
  
  // Suggest operators
  const operators = ['AND', 'OR', 'NOT'];
  suggestions.push(...operators.filter(op => op.startsWith(lastWord.toUpperCase())));
  
  return suggestions;
}
