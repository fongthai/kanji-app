import { Document, Page, Font } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFBoardPage } from './PDFBoardPage';
import { calculatePagination } from '../../utils/layoutCalculations';

// Register all available fonts with explicit properties
Font.register({
  family: 'KanjiStrokeOrders',
  src: '/fonts/KanjiStrokeOrders.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'YujiMai-Regular',
  src: '/fonts/YujiMai-Regular.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'YujiBoku-Regular',
  src: '/fonts/YujiBoku-Regular.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'KleeOne-Regular',
  src: '/fonts/KleeOne-Regular.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'NotoSansJP-Regular',
  src: '/fonts/NotoSansJP-Regular.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'ZenOldMincho-Regular',
  src: '/fonts/ZenOldMincho-Regular.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'mitimasu',
  src: '/fonts/mitimasu.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

// Register hyphenation callback for better text handling
Font.registerHyphenationCallback(word => [word]);

/**
 * Register header font if not already registered
 * Returns the font family name to use in PDF (fallback to Helvetica if registration fails)
 */
export function registerHeaderFont(fontFamily: string, fontFilename: string): string {
  // System font or already registered
  if (fontFamily === 'system-ui' || fontFamily === 'Helvetica') {
    return 'Helvetica'; // Use built-in Helvetica for system fonts
  }
  
  try {
    // Check if already registered (avoid duplicate registration)
    const isRegistered = Font.getRegisteredFonts().includes(fontFamily);
    if (isRegistered) return fontFamily;
    
    // Register new font
    Font.register({
      family: fontFamily,
      src: fontFilename,
      fontStyle: 'normal',
      fontWeight: 'normal',
    });
    return fontFamily;
  } catch (error) {
    console.warn(`Failed to register header font ${fontFamily}:`, error);
    return 'Helvetica'; // Fallback to built-in font
  }
}

// Note: When user selects "system-ui", we map it to NotoSansJP-Regular for PDF export
// NotoSansJP has excellent Unicode support for Vietnamese, Japanese, and Latin scripts

interface PDFDocumentProps {
  kanjis: KanjiData[];
  columnCount: number;
  cellSize: number;
  rowCount: number;
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
  totalKanjis: number;
  headerText: string;
  headerFontFamily: string;
  headerFontFilename: string;
}

export const PDFBoardDocument: React.FC<PDFDocumentProps> = ({ 
  kanjis,
  columnCount,
  cellSize,
  rowCount,
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
  totalKanjis,
  headerText,
  headerFontFamily,
  headerFontFilename,
}) => {
  // Register header font if needed
  const headerFont = registerHeaderFont(headerFontFamily, headerFontFilename);
  
  const cardsPerPage = columnCount * rowCount;
  const { totalPages, getPageKanjis } = calculatePagination(kanjis.length, cardsPerPage);
  
  return (
    <Document>
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const pageKanjis = getPageKanjis(pageIndex, kanjis);
        
        return (
          <Page key={pageIndex} size="A4">
            <PDFBoardPage
              kanjis={pageKanjis}
              pageNumber={pageIndex + 1}
              totalPages={totalPages}
              totalKanjis={totalKanjis}
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
              showHeader={showHeader}
              showFooter={showFooter}
              headerText={headerText}
              headerFont={headerFont}
            />
          </Page>
        );
      })}
    </Document>
  );
};
