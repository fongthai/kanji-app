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
  const estimatedMaxChars = Math.floor((maxWidth / 1.33) / 4.5);
  
  // Build Line 1: KANJI | HAN-VIET | ON: ONYOMI | KUN: KUNYOMI | ⚠ LOOKALIKES ⚠
  const line1Parts: string[] = [
    kanji.kanji,
    kanji.hanViet,
    `ON: ${kanji.onyomi.join(', ')}`,
    `KUN: ${kanji.kunyomi.join(', ')}`,
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
  
  // Layout logic: Line 1 has priority and never truncates
  let actualLine1: string;
  let actualLine2: string;
  
  if (line1FullText.length <= estimatedMaxChars) {
    // Line 1 fits completely
    actualLine1 = line1FullText;
    // Line 2 shows meanings (truncate if needed)
    actualLine2 = truncate(meaningText, estimatedMaxChars);
  } else {
    // Line 1 overflows - find last safe split point (after " | ")
    let splitPos = estimatedMaxChars;
    const lastSeparator = line1FullText.lastIndexOf(' | ', estimatedMaxChars);
    
    // If we found a separator before the limit, split there
    // Otherwise, split at the limit but ensure we don't break emojis
    if (lastSeparator > 0 && lastSeparator > estimatedMaxChars * 0.7) {
      // Use separator if it's not too far back (within 30% of limit)
      splitPos = lastSeparator + 3; // +3 to include " | "
    }
    
    actualLine1 = line1FullText.substring(0, splitPos).trimEnd();
    const line1Overflow = line1FullText.substring(splitPos).trimStart();
    
    // Line 2: overflow + separator + meanings
    const line2Combined = meaningText ? `${line1Overflow} | ${meaningText}` : line1Overflow;
    actualLine2 = truncate(line2Combined, estimatedMaxChars);
  }
  
  return (
    <View style={[styles.container, { maxWidth }]}>
      {/* Line 1 */}
      <Text style={styles.line1}>{actualLine1}</Text>
      
      {/* Line 2 - Always show if line 1 overflows OR if lineCount >= 2 */}
      {(line1FullText.length > estimatedMaxChars || (lineCount >= 2 && actualLine2)) && (
        <Text style={styles.line2}>{actualLine2}</Text>
      )}
      
      {/* Line 3 */}
      {lineCount >= 3 && line3 && <Text style={styles.line3}>{line3}</Text>}
    </View>
  );
}
