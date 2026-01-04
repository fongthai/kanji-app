import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFKanjiOuterTable } from './PDFKanjiOuterTable';
import { PDFWatermark } from './PDFWatermark';
import { getFooterText } from '../../constants/appText';
import { shouldShowWatermark } from '../../utils/featureControl';
import { WATERMARK_OPACITY_SHEET } from '../../constants/watermark';
import {
  A4_WIDTH_PT,
  PDF_MARGIN_TOP,
  PDF_MARGIN_RIGHT,
  PDF_MARGIN_BOTTOM,
  PDF_MARGIN_LEFT,
  PDF_HEADER_HEIGHT,
  PDF_FOOTER_HEIGHT,
  PDF_OUTER_TABLE_SPACING,
  PDF_HEADER_TO_CONTENT_SPACING,
  PDF_CONTENT_TO_FOOTER_SPACING,
} from '../../constants/pdfDimensions';

const styles = StyleSheet.create({
  page: {
    width: '210mm',
    height: '297mm',
    paddingTop: PDF_MARGIN_TOP,
    paddingRight: PDF_MARGIN_RIGHT,
    paddingBottom: PDF_MARGIN_BOTTOM,
    paddingLeft: PDF_MARGIN_LEFT,
    backgroundColor: '#ffffff',
    fontFamily: 'NotoSansJP-Regular',
  },
  header: {
    height: PDF_HEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '2px solid #e5e7eb',
  },
  headerBox: {
    border: '2px solid #333333',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  headerText: {
    fontSize: 18,
    color: '#000000',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: PDF_HEADER_TO_CONTENT_SPACING,
    paddingBottom: PDF_CONTENT_TO_FOOTER_SPACING,
    gap: PDF_OUTER_TABLE_SPACING,
    flex: 1, // Take up remaining space to push footer to bottom
  },
  footer: {
    height: PDF_FOOTER_HEIGHT,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #e5e7eb',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 9,
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
  grayscaleMode: boolean;
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
  grayscaleMode,
}: PDFSheetPageProps) {
  // Calculate available dimensions using defined margins
  const availableWidth = A4_WIDTH_PT - (PDF_MARGIN_LEFT + PDF_MARGIN_RIGHT); // 595 - 60 = 535pt
  
  console.log(`[PDFSheetPage] Page ${currentPage}/${totalPages}:`, {
    kanjiCount: kanjis.length,
    kanjis: kanjis.map(k => k.kanji).join(''),
  });
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <View style={[
            styles.headerBox,
            !grayscaleMode ? {
              backgroundColor: '#667eea',
              borderColor: '#5a67d8',
              borderWidth: 2,
            } : {}
          ]}>
            <Text style={[
              styles.headerText,
              { fontFamily: headerFont === 'Helvetica' ? 'NotoSansJP-Regular' : headerFont },
              !grayscaleMode ? { color: '#ffffff' } : {}
            ]}>
              {headerText}
            </Text>
          </View>
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
            grayscaleMode={grayscaleMode}
          />
        ))}
      </View>
      
      {/* Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Text>{getFooterText()}</Text>
          <Text>Page {currentPage} of {totalPages}</Text>
        </View>
      )}
      
      {/* Watermark */}
      {shouldShowWatermark() && <PDFWatermark grayscaleMode={grayscaleMode} opacity={WATERMARK_OPACITY_SHEET} />}
    </Page>
  );
}
