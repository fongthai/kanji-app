import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFBoardGrid } from './PDFBoardGrid';
import { FOOTER_TEXT } from '../../constants/appText';

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
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  headerBackground: {
    height: 42, // Animation rectangle equivalent
    backgroundColor: '#E0F2FE', // Light blue background
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGap1: {
    height: 4,
    backgroundColor: 'white',
  },
  headerLine: {
    height: 2,
    backgroundColor: '#9CA3AF',
  },
  headerGap2: {
    height: 2,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 20, // 2rem equivalent (~20pt)
    color: '#1F2937',
    textAlign: 'center',
    maxHeight: 38,
    lineHeight: 1.2,
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
}) => {
  return (
    <View style={styles.page}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          {/* Background Rectangle with Text */}
          <View style={styles.headerBackground}>
            <Text style={[styles.headerText, { fontFamily: headerFont }]}>
              {headerText}
            </Text>
          </View>
          {/* Gap 1 */}
          <View style={styles.headerGap1} />
          {/* Horizontal Line */}
          <View style={styles.headerLine} />
          {/* Gap 2 */}
          <View style={styles.headerGap2} />
        </View>
      )}
      
      {/* Grid */}
      <View style={styles.gridContainer}>
        <PDFBoardGrid
          kanjis={kanjis}
          columnCount={columnCount}
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
        />
      </View>
      
      {/* Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{FOOTER_TEXT}</Text>
          <Text style={styles.footerText}>Page {pageNumber} of {totalPages}</Text>
        </View>
      )}
    </View>
  );
};
