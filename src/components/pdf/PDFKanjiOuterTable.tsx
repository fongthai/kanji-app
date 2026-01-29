import { View, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFExplanationText } from './PDFExplanationText';
import { PDFWritingTable } from './PDFWritingTable';
import { PDFKanjiVocabularySection } from './PDFKanjiVocabularySection';

const styles = StyleSheet.create({
  outerTable: {
    border: '2px solid #d1d5db',
    backgroundColor: '#f9fafb',
    padding: 10, // Compressed for tighter PDF layout
  },
  explanationSection: {
    marginBottom: 6, // Compressed for tighter PDF layout
  },
  splitContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12, // Slightly smaller gap for PDF
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
  grayscaleMode: boolean;
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
  grayscaleMode,
}: PDFKanjiOuterTableProps) {
  // Border and padding are inside availableWidth (like Board mode approach)
  // Don't set explicit width - let it take full available space
  const outerPadding = 12;
  const innerWidth = availableWidth - (outerPadding * 2);

  // Calculate 60/40 split widths with gap
  const gap = 12; // Slightly smaller gap for PDF
  const practiceWidth = Math.floor((innerWidth - gap) * 0.6);
  const vocabWidth = innerWidth - practiceWidth - gap;

  // Calculate WritingTable height for consistent sizing
  const totalColumns = 2 + sheetColumnCount;
  const borderWidth = 1;
  const totalBorderWidth = (totalColumns + 1) * borderWidth;
  const cellSize = (practiceWidth - totalBorderWidth) / totalColumns;
  const writingTableHeight = cellSize * 2 + borderWidth * 3;

  // Vocabulary section has its own border (1pt top + 1pt bottom = 2pt)
  // Subtract 2pt to match the WritingTable height exactly
  const vocabHeight = writingTableHeight - 2;

  console.log(`[PDFKanjiOuterTable] Rendering kanji: ${kanji.kanji}`);

  return (
    <View style={styles.outerTable} wrap={false}>
      {/* Explanation Text (full width) */}
      <View style={styles.explanationSection}>
        <PDFExplanationText kanji={kanji} maxWidth={innerWidth} lineCount={explanationLineCount} />
      </View>

      {/* 60/40 Split Layout */}
      <View style={styles.splitContainer}>
        {/* Practice section (60%) */}
        <View style={{ width: practiceWidth }}>
          <PDFWritingTable
            kanji={kanji}
            availableWidth={practiceWidth}
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
            grayscaleMode={grayscaleMode}
          />
        </View>

        {/* Vocabulary section (40%) */}
        <PDFKanjiVocabularySection
          kanji={kanji}
          availableWidth={vocabWidth}
          availableHeight={vocabHeight}
        />
      </View>
    </View>
  );
}
