/**
 * KQL Syntax Highlighter
 * Provides color-coded highlighting for Kanji Query Language syntax
 */

export interface HighlightedSegment {
  text: string;
  color: string;
  type: 'prefix' | 'operator' | 'value' | 'quoted' | 'number' | 'error' | 'default';
}

const PREFIXES = ['char:', 'kanji:', 'hanviet:', 'hv:', 'en:', 'english:', 'vn:', 'vietnamese:', 'on:', 'onyomi:', 'kun:', 'kunyomi:', 'com:', 'component:', 'jlpt:', 'freq:', 'frequency:'];
const COMPARISON_OPS = ['<=', '>=', '<', '>'];

/**
 * Highlights KQL syntax with color coding
 * Returns array of segments with their colors and types
 */
export function highlightKQLSyntax(query: string): HighlightedSegment[] {
  if (!query) return [];

  const segments: HighlightedSegment[] = [];
  let i = 0;

  while (i < query.length) {
    const remaining = query.slice(i);

    // Skip whitespace
    if (remaining[0] === ' ') {
      segments.push({ text: ' ', color: 'text-gray-400', type: 'default' });
      i++;
      continue;
    }

    // Handle quoted strings
    if (remaining[0] === '"') {
      const endQuoteIndex = remaining.indexOf('"', 1);
      if (endQuoteIndex !== -1) {
        const quotedText = remaining.slice(0, endQuoteIndex + 1);
        segments.push({ text: quotedText, color: 'text-green-400', type: 'quoted' });
        i += quotedText.length;
        continue;
      } else {
        // Unclosed quote - error
        segments.push({ text: remaining, color: 'text-red-400', type: 'error' });
        break;
      }
    }

    // Handle comparison operators (must check before single character operators)
    let matchedOp = false;
    for (const op of COMPARISON_OPS) {
      if (remaining.startsWith(op)) {
        segments.push({ text: op, color: 'text-orange-400', type: 'operator' });
        i += op.length;
        matchedOp = true;
        break;
      }
    }
    if (matchedOp) continue;

    // Handle single character operators
    if (['&', '|', '!', '(', ')', '<', '>'].includes(remaining[0])) {
      segments.push({ text: remaining[0], color: 'text-orange-400', type: 'operator' });
      i++;
      continue;
    }

    // Handle prefixes
    let matchedPrefix = false;
    for (const prefix of PREFIXES) {
      if (remaining.toLowerCase().startsWith(prefix.toLowerCase())) {
        segments.push({ text: remaining.slice(0, prefix.length), color: 'text-blue-400 font-semibold', type: 'prefix' });
        i += prefix.length;
        matchedPrefix = true;
        break;
      }
    }
    if (matchedPrefix) continue;

    // Handle operators (AND, OR, NOT)
    let matchedWord = false;
    for (const op of ['AND', 'OR', 'NOT']) {
      const pattern = new RegExp(`^${op}(?=\\s|$)`, 'i');
      if (pattern.test(remaining)) {
        segments.push({ text: remaining.slice(0, op.length), color: 'text-orange-400 font-semibold', type: 'operator' });
        i += op.length;
        matchedWord = true;
        break;
      }
    }
    if (matchedWord) continue;

    // Handle numbers
    const numberMatch = remaining.match(/^\d+/);
    if (numberMatch) {
      segments.push({ text: numberMatch[0], color: 'text-purple-400', type: 'number' });
      i += numberMatch[0].length;
      continue;
    }

    // Handle ranges (e.g., 100-500)
    const rangeMatch = remaining.match(/^\d+-\d+/);
    if (rangeMatch) {
      segments.push({ text: rangeMatch[0], color: 'text-purple-400', type: 'number' });
      i += rangeMatch[0].length;
      continue;
    }

    // Handle regular values/text
    const valueMatch = remaining.match(/^[^\s&|!()<>"]+/);
    if (valueMatch) {
      segments.push({ text: valueMatch[0], color: 'text-gray-200', type: 'value' });
      i += valueMatch[0].length;
      continue;
    }

    // Fallback - single character
    segments.push({ text: remaining[0], color: 'text-gray-200', type: 'default' });
    i++;
  }

  return segments;
}

/**
 * Converts highlighted segments to HTML string
 * For use in contentEditable or innerHTML
 */
export function segmentsToHTML(segments: HighlightedSegment[]): string {
  return segments
    .map(seg => `<span class="${seg.color}">${escapeHTML(seg.text)}</span>`)
    .join('');
}

/**
 * Escapes HTML special characters
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
