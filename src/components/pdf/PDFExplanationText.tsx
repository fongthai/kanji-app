import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';

const styles = StyleSheet.create({
  container: {
    fontSize: 9,
    color: '#374151',
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
    fontSize: 8, // Slightly smaller to distinguish from other lines
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
  
  // Estimate max characters based on width (approximate: 1pt ≈ 1.33px, avg char width ~4.5 points at 9pt font)
  // More generous estimation to use available space
  const estimatedMaxChars = Math.floor((maxWidth / 1.33) / 4.5);
  
  // Line 1: KANJI | JLPT-LEVEL | HAN-VIET | ONYOMI | KUNYOMI | COMPONENTS
  const line1Parts: string[] = [
    kanji.kanji,
    kanji.jlptLevel || '',
    kanji.hanViet,
    kanji.onyomi.join(', '),
    kanji.kunyomi.join(', '),
    kanji.components || '',
  ];
  const line1 = truncate(line1Parts.filter(Boolean).join(' | '), estimatedMaxChars);
  
  // Line 2: ENGLISH-MEANING | VIETNAMESE-MEANING
  const line2Parts: string[] = [
    kanji.meaning || '',
    kanji.vietnameseMeaning || '',
  ];
  const line2 = truncate(line2Parts.filter(Boolean).join(' | '), estimatedMaxChars);
  
  // Line 3: VIET-MNEMONICS
  const line3 = kanji.vietnameseMnemonic
    ? truncate(kanji.vietnameseMnemonic, estimatedMaxChars)
    : '';
  
  return (
    <View style={[styles.container, { maxWidth }]}>
      {/* Line 1 */}
      <Text style={styles.line1}>{line1}</Text>
      
      {/* Line 2 */}
      {lineCount >= 2 && line2 && <Text style={styles.line2}>{line2}</Text>}
      
      {/* Line 3 */}
      {lineCount >= 3 && line3 && <Text style={styles.line3}>{line3}</Text>}
    </View>
  );
}
