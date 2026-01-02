import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFBoardGrid } from './PDFBoardGrid';
import { getFooterText } from '../../constants/appText';

const PADDING = 48;
const HEADER_HEIGHT = 50;
const FOOTER_HEIGHT = 40;

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
  grayscaleMode: boolean;
}

const styles = StyleSheet.create({
  page: {
    width: '210mm',
    height: '297mm',
    padding: PADDING,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  header: {
    height: HEADER_HEIGHT,
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
  },
  footer: {
    position: 'absolute',
    bottom: PADDING,
    left: PADDING,
    right: PADDING,
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed from 'center'
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
  grayscaleMode,
}) => {
  // Calculate available height for grid (A4 height minus padding, header, footer)
  const A4_HEIGHT_PX = 842; // 297mm at 72dpi
  let availableHeight = A4_HEIGHT_PX - (PADDING * 2); // Subtract top and bottom padding
  
  if (showHeader) {
    availableHeight -= HEADER_HEIGHT;
  }
  
  if (showFooter) {
    availableHeight -= FOOTER_HEIGHT;
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
        />
      </View>
      
      {/* Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{getFooterText()}</Text>
          <Text style={styles.footerText}>Page {pageNumber} of {totalPages}</Text>
        </View>
      )}
    </View>
  );
};
