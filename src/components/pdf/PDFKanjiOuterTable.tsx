import { View, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFExplanationText } from './PDFExplanationText';
import { PDFWritingTable } from './PDFWritingTable';

const styles = StyleSheet.create({
  outerTable: {
    border: '1px solid #d1d5db',
    backgroundColor: '#f9fafb',
    padding: 12,
  },
  explanationSection: {
    marginBottom: 12,
  },
});

interface PDFKanjiOuterTableProps {
  kanji: KanjiData;
  availableWidth: number;
  sheetColumnCount: number;
  kanjiFont: string;
  kanjiFontSizeMultiplier: number;
  hanVietFont: string;
  hanVietFontSizeRatio: number;
  hanVietOrientation: 'horizontal' | 'vertical';
  indicatorFontSizeRatio: number;
  showHanViet: boolean;
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  sheetGuideOpacity: number[];
  sheetTracingOpacity: number[];
  explanationLineCount?: 1 | 2 | 3;
}

export function PDFKanjiOuterTable({
  kanji,
  availableWidth,
  sheetColumnCount,
  kanjiFont,
  kanjiFontSizeMultiplier,
  hanVietFont,
  hanVietFontSizeRatio,
  hanVietOrientation,
  indicatorFontSizeRatio,
  showHanViet,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  sheetGuideOpacity,
  sheetTracingOpacity,
  explanationLineCount = 3,
}: PDFKanjiOuterTableProps) {
  // Border and padding are inside availableWidth (like Board mode approach)
  // Don't set explicit width - let it take full available space
  const outerPadding = 12;
  const innerWidth = availableWidth - (outerPadding * 2);
  
  return (
    <View style={styles.outerTable}>
      {/* Explanation Text */}
      <View style={styles.explanationSection}>
        <PDFExplanationText kanji={kanji} maxWidth={innerWidth} lineCount={explanationLineCount} />
      </View>
      
      {/* Writing Table */}
      <PDFWritingTable
        kanji={kanji}
        availableWidth={innerWidth}
        sheetColumnCount={sheetColumnCount}
        kanjiFont={kanjiFont}
        kanjiFontSizeMultiplier={kanjiFontSizeMultiplier}
        hanVietFont={hanVietFont}
        hanVietFontSizeRatio={hanVietFontSizeRatio}
        hanVietOrientation={hanVietOrientation}
        indicatorFontSizeRatio={indicatorFontSizeRatio}
        showHanViet={showHanViet}
        showJlptIndicator={showJlptIndicator}
        showGradeIndicator={showGradeIndicator}
        showFrequencyIndicator={showFrequencyIndicator}
        sheetGuideOpacity={sheetGuideOpacity}
        sheetTracingOpacity={sheetTracingOpacity}
      />
    </View>
  );
}
