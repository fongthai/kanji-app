import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFBoardGrid } from './PDFBoardGrid';
import { PDFWatermark } from './PDFWatermark';
import { getFooterText } from '../../constants/appText';
import { shouldShowWatermark } from '../../utils/featureControl';
import { WATERMARK_OPACITY_BOARD } from '../../constants/watermark';
import {
  A4_HEIGHT_PT,
  PDF_MARGIN_TOP,
  PDF_MARGIN_RIGHT,
  PDF_MARGIN_BOTTOM,
  PDF_MARGIN_LEFT,
  PDF_HEADER_HEIGHT,
  PDF_FOOTER_HEIGHT,
  PDF_HEADER_TO_CONTENT_SPACING,
  PDF_CONTENT_TO_FOOTER_SPACING,
} from '../../constants/pdfDimensions';

interface PDFBoardPageProps {
  kanjis: KanjiData[];
  pageNumber: number;
  totalPages: number;
  totalKanjis: number;
  columnCount: number;
  cellSize: number;
  gap: number;
  kanjiFont: string;
  kanjiFontSize: number;
  hanVietFont: string;
  hanVietFontSize: number;
  hanVietOrientation: 'horizontal' | 'vertical';
  indicatorFontSize: number;
  showHanViet: boolean;
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  showEmptyCells: boolean;
  centerCards: boolean;
  showHeader: boolean;
  showFooter: boolean;
  headerText: string;
  headerFont: string; // Font family for header text
  availableWidth: number;
  grayscaleMode: boolean;
}

const styles = StyleSheet.create({
  page: {
    width: '210mm',
    height: '297mm',
    paddingTop: PDF_MARGIN_TOP,
    paddingRight: PDF_MARGIN_RIGHT,
    paddingBottom: PDF_MARGIN_BOTTOM,
    paddingLeft: PDF_MARGIN_LEFT,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  header: {
    height: PDF_HEADER_HEIGHT,
    marginBottom: PDF_HEADER_TO_CONTENT_SPACING,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerBox: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 4,
    paddingBottom: 4,
    border: '2px solid #333333',
  },
  headerText: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center', // Center grid horizontally
    justifyContent: 'flex-start', // Align to top
  },
  footer: {
    height: PDF_FOOTER_HEIGHT,
    marginTop: PDF_CONTENT_TO_FOOTER_SPACING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1pt solid #9CA3AF',
    paddingTop: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
  footerText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#4B5563',
  },
});

export const PDFBoardPage: React.FC<PDFBoardPageProps> = ({ 
  kanjis,
  pageNumber,
  totalPages,
  // totalKanjis - not used in render
  columnCount,
  cellSize,
  gap,
  kanjiFont,
  kanjiFontSize,
  hanVietFont,
  hanVietFontSize,
  hanVietOrientation,
  indicatorFontSize,
  showHanViet,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  showEmptyCells,
  centerCards,
  showHeader,
  showFooter,
  headerText,
  headerFont,
  availableWidth,
  grayscaleMode,
}) => {
  // Calculate available height for grid (A4 height minus margins, header, footer)
  // Note: Header/footer spacing is handled by CSS margins, not subtracted from available height
  let availableHeight = A4_HEIGHT_PT - PDF_MARGIN_TOP - PDF_MARGIN_BOTTOM;
  
  if (showHeader) {
    availableHeight -= PDF_HEADER_HEIGHT;
  }
  
  if (showFooter) {
    availableHeight -= PDF_FOOTER_HEIGHT;
  }
  
  return (
    <View style={styles.page}>
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
      
      {/* Grid */}
      <View style={styles.gridContainer}>
        <PDFBoardGrid
          kanjis={kanjis}
          columnCount={columnCount}
          grayscaleMode={grayscaleMode}
          cellSize={cellSize}
          gap={gap}
          kanjiFont={kanjiFont}
          kanjiFontSize={kanjiFontSize}
          hanVietFont={hanVietFont}
          hanVietFontSize={hanVietFontSize}
          hanVietOrientation={hanVietOrientation}
          indicatorFontSize={indicatorFontSize}
          showHanViet={showHanViet}
          showJlptIndicator={showJlptIndicator}
          showGradeIndicator={showGradeIndicator}
          showFrequencyIndicator={showFrequencyIndicator}
          showEmptyCells={showEmptyCells}
          centerCards={centerCards}
          availableHeight={availableHeight}
          availableWidth={availableWidth}
        />
      </View>
      
      {/* Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{getFooterText()}</Text>
          <Text style={styles.footerText}>Page {pageNumber} of {totalPages}</Text>
        </View>
      )}
      
      {/* Watermark */}
      {shouldShowWatermark() && <PDFWatermark grayscaleMode={grayscaleMode} opacity={WATERMARK_OPACITY_BOARD} />}
    </View>
  );
};
