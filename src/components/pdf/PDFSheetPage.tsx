import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFKanjiOuterTable } from './PDFKanjiOuterTable';
import { BOARD_HEADER_HEIGHT, BOARD_FOOTER_HEIGHT } from '../../constants/boardDimensions';

// Use same constants as Board mode
const PADDING = 48;
const A4_WIDTH_PT = 595;

const styles = StyleSheet.create({
  page: {
    width: '210mm',
    height: '297mm',
    padding: PADDING,
    backgroundColor: '#ffffff',
    fontFamily: 'NotoSansJP-Regular',
  },
  header: {
    height: BOARD_HEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '2px solid #e5e7eb',
  },
  headerText: {
    fontSize: 18,
    color: '#1f2937',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  footer: {
    height: BOARD_FOOTER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #e5e7eb',
    fontSize: 10,
    color: '#6b7280',
  },
});

interface PDFSheetPageProps {
  kanjis: KanjiData[];
  sheetColumnCount: number;
  kanjiFont: string;
  kanjiFontSizeMultiplier: number;
  showHeader: boolean;
  showFooter: boolean;
  headerText: string;
  headerFont: string;
  hanVietFont: string;
  hanVietFontSizeRatio: number;
  hanVietOrientation: 'horizontal' | 'vertical';
  indicatorFontSizeRatio: number;
  showHanViet: boolean;
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  currentPage: number;
  totalPages: number;
  sheetGuideOpacity: number[];
  sheetTracingOpacity: number[];
  explanationLineCount?: 1 | 2 | 3;
}

export function PDFSheetPage({
  kanjis,
  sheetColumnCount,
  kanjiFont,
  kanjiFontSizeMultiplier,
  showHeader,
  showFooter,
  headerText,
  headerFont,
  hanVietFont,
  hanVietFontSizeRatio,
  hanVietOrientation,
  indicatorFontSizeRatio,
  showHanViet,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  currentPage,
  totalPages,
  sheetGuideOpacity,
  sheetTracingOpacity,
  explanationLineCount = 3,
}: PDFSheetPageProps) {
  // Calculate available width using same approach as Board mode
  // Page padding is 48pt on each side (same as Board mode)
  const availableWidth = A4_WIDTH_PT - (PADDING * 2); // 595 - 96 = 499pt
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.headerText, { fontFamily: headerFont === 'Helvetica' ? 'NotoSansJP-Regular' : headerFont }]}>
            {headerText}
          </Text>
        </View>
      )}
      
      {/* Content Area */}
      <View style={styles.content}>
        {kanjis.map((kanji, index) => (
          <PDFKanjiOuterTable
            key={`${kanji.kanji}-${index}`}
            kanji={kanji}
            availableWidth={availableWidth}
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
            explanationLineCount={explanationLineCount}
          />
        ))}
      </View>
      
      {/* Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Text>Page {currentPage} of {totalPages}</Text>
        </View>
      )}
    </Page>
  );
}
