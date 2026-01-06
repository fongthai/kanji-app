import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';

const styles = StyleSheet.create({
  container: {
    fontSize: 9,
    color: '#374151',
    fontFamily: 'NotoSansJP-Regular', // Supports Vietnamese + Japanese + Unicode symbols
  },
  line1: {
    marginBottom: 2,
  },
  line2: {
    marginBottom: 2,
  },
  line3: {
    color: '#6b7280',
    marginBottom: 2,
    fontSize: 8,
  },
});

interface PDFExplanationTextProps {
  kanji: KanjiData;
  maxWidth: number;
  lineCount?: 1 | 2 | 3; // Number of lines to display (default: 3)
}

export function PDFExplanationText({ kanji, maxWidth, lineCount = 3 }: PDFExplanationTextProps) {
  // Helper function to truncate text
  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };
  
  // Estimate max characters based on width
  // Conservative estimate to prevent wrapping (adjusted to 4 for wider glyphs)
  const estimatedMaxChars = Math.floor((maxWidth / 1.33) / 3);
  
  // Helper to render text with bold labels (ON:, KUN:, ★ VN:, ★ EN:, ⚠)
  const renderWithBold = (text: string) => {
    const pattern = /(\bON:|\bKUN:|★ VN:|★ EN:|⚠)/g;
    const parts = text.split(pattern);
    
    return (
      <>
        {parts.map((part, i) => {
          const shouldBold = part === 'ON:' || part === 'KUN:' || part === '★ VN:' || part === '★ EN:' || part === '⚠';
          return shouldBold 
            ? <Text key={i} style={{ fontFamily: 'Vollkorn-ExtraBold' }}>{part}</Text>
            : <Text key={i}>{part}</Text>;
        })}
      </>
    );
  };
  
  // Build Line 1: KANJI | HAN-VIET | ON: ONYOMI | KUN: KUNYOMI | ⚠ LOOKALIKES ⚠
  const hasKunyomi = kanji.kunyomi.length > 0;
  const kunPart = hasKunyomi 
    ? `KUN: ${kanji.kunyomi.join(', ')}`
    : `KUN:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`; // Non-breaking spaces for manual writing
  
  const line1Parts: string[] = [
    kanji.kanji,
    kanji.hanViet,
    `ON: ${kanji.onyomi.join(', ')}`,
    kunPart,
  ];
  if (kanji.lookalikes) {
    const lookalikeText = Array.isArray(kanji.lookalikes) 
      ? kanji.lookalikes.join(', ') 
      : kanji.lookalikes;
    if (lookalikeText.trim()) {
      line1Parts.push(`⚠ ${lookalikeText} ⚠`);
    }
  }
  const line1FullText = line1Parts.filter(Boolean).join(' | ');
  
  // Build Line 2 content: ★ VN: VIETNAMESE-MEANING | ★ EN: ENGLISH-MEANING
  const line2Parts: string[] = [
    kanji.vietnameseMeaning ? `★ VN: ${kanji.vietnameseMeaning}` : '',
    kanji.meaning ? `★ EN: ${kanji.meaning}` : '',
  ];
  const meaningText = line2Parts.filter(Boolean).join(' | ');
  
  // Line 3: VIET-MNEMONICS
  const line3 = kanji.vietnameseMnemonic
    ? truncate(kanji.vietnameseMnemonic, estimatedMaxChars)
    : '';
  
  // Algorithm: Ensure lines 1+2 always take exactly 2 physical lines
  let line1A: string; // Physical line 1
  let line2: string;  // Physical line 2
  
  if (line1FullText.length <= estimatedMaxChars) {
    // Line 1 fits in one physical line
    line1A = line1FullText;
    // Line 2 is just meanings
    line2 = meaningText;
  } else {
    // Line 1 is too long - split it
    line1A = line1FullText.substring(0, estimatedMaxChars);
    const line1B = line1FullText.substring(estimatedMaxChars);
    
    // Line 2: Combine line1B + meaningLine
    line2 = meaningText 
      ? `${line1B} | ${meaningText}` 
      : line1B;
  }
  
  // Truncate line2 only if it exceeds estimatedMaxChars (same as line1A)
  // This ensures both lines can display the same number of characters
  const line2Final = line2.length > estimatedMaxChars 
    ? truncate(line2, estimatedMaxChars)
    : line2;
  
  return (
    <View style={[styles.container, { maxWidth }]}>
      {/* Physical Line 1: line1A */}
      <Text style={styles.line1}>{renderWithBold(line1A)}</Text>
      
      {/* Physical Line 2: line1B + meanings (or just meanings) */}
      {lineCount >= 2 && line2Final && (
        <Text style={styles.line2}>{renderWithBold(line2Final)}</Text>
      )}
      
      {/* Physical Line 3: Vietnamese mnemonics */}
      {lineCount >= 3 && line3 && (
        <Text style={styles.line3}>{line3}</Text>
      )}
    </View>
  );
}
