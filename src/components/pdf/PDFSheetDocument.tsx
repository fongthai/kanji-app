import { Document, Font } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFSheetPage } from './PDFSheetPage';
import { PDF_MARGIN_TOP, PDF_MARGIN_RIGHT, PDF_MARGIN_BOTTOM, PDF_MARGIN_LEFT } from '../../constants/pdfDimensions';
import { calculateTablesPerPagePDF } from '../screen/SheetGrid';

// Get base URL for asset paths
const BASE_URL = import.meta.env.BASE_URL;

// Register fonts (same as PDFBoardDocument)
Font.register({
  family: 'KanjiStrokeOrders',
  src: `${BASE_URL}fonts/KanjiStrokeOrders.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'YujiBoku-Regular',
  src: `${BASE_URL}fonts/YujiBoku-Regular.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'KleeOne-Regular',
  src: `${BASE_URL}fonts/KleeOne-Regular.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'NotoSansJP-Regular',
  src: `${BASE_URL}fonts/NotoSansJP-Regular.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'ZenOldMincho-Regular',
  src: `${BASE_URL}fonts/ZenOldMincho-Regular.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'mitimasu',
  src: `${BASE_URL}fonts/mitimasu.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: '02UtsukushiMincho',
  src: `${BASE_URL}fonts/02UtsukushiMincho.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'A-OTF Outai Kaisho Std Light',
  src: `${BASE_URL}fonts/A-OTF Outai Kaisho Std Light.otf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'HGMaruGothicMPRO',
  src: `${BASE_URL}fonts/HGMaruGothicMPRO.TTF`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'KosugiMaru-Regular',
  src: `${BASE_URL}fonts/KosugiMaru-Regular.woff2`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'MPLUSRounded1c-Regular',
  src: `${BASE_URL}fonts/MPLUSRounded1c-Regular.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'Bangers-Regular',
  src: `${BASE_URL}fonts/Bangers-Regular.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'Vollkorn-ExtraBold',
  src: `${BASE_URL}fonts/Vollkorn-ExtraBold.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: '02UtsukushiMincho',
  src: `${BASE_URL}fonts/02UtsukushiMincho.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'A-OTF Outai Kaisho Std Light',
  src: `${BASE_URL}fonts/A-OTF Outai Kaisho Std Light.otf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'HGMaruGothicMPRO',
  src: `${BASE_URL}fonts/HGMaruGothicMPRO.TTF`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

// Register hyphenation callback
Font.registerHyphenationCallback(word => [word]);

/**
 * Register kanji font if not already registered
 * Returns the font family name to use in PDF (fallback to NotoSansJP if registration fails)
 */
export function registerKanjiFont(fontFamily: string): string {
  // System font or already registered
  if (fontFamily === 'system-ui') {
    return 'NotoSansJP-Regular';
  }
  
  // Already in the registered list
  const registeredFonts = [
    'KanjiStrokeOrders',
    'YujiBoku-Regular',
    'KleeOne-Regular',
    'NotoSansJP-Regular',
    'ZenOldMincho-Regular',
    'mitimasu',
    '02UtsukushiMincho',
    'A-OTF Outai Kaisho Std Light',
    'HGMaruGothicMPRO',
    'KosugiMaru-Regular',
  ];
  
  if (registeredFonts.includes(fontFamily)) {
    return fontFamily;
  }
  
  // Font not registered, use fallback
  console.warn(`Font ${fontFamily} not registered, using NotoSansJP-Regular`);
  return 'NotoSansJP-Regular';
}

interface PDFSheetDocumentProps {
  kanjis: KanjiData[];
  sheetColumnCount: number;
  kanjiFont: string;
  kanjiFontSizeMultiplier: number; // User's size percentage as multiplier (0.7-1.1)
  showHeader: boolean;
  showFooter: boolean;
  headerText: string;
  headerFont: string;
  hanVietFont: string;
  hanVietFontSizeRatio: number; // Ratio to cell size for han-viet
  hanVietOrientation: 'horizontal' | 'vertical';
  indicatorFontSizeRatio: number; // Ratio to cell size for indicators
  showHanViet: boolean;
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  sheetGuideOpacity: number[];
  sheetTracingOpacity: number[];
  explanationLineCount?: 1 | 2 | 3;
  grayscaleMode: boolean;
}

export function PDFSheetDocument({
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
  sheetGuideOpacity,
  sheetTracingOpacity,
  explanationLineCount = 3,
  grayscaleMode,
}: PDFSheetDocumentProps) {
  // Use imported margins from PDFSheetPage to ensure consistency
  // Calculate how many tables fit per page using PDF-specific dimensions
  const tablesPerPage = calculateTablesPerPagePDF(
    sheetColumnCount,
    showHeader,
    showFooter,
    explanationLineCount,
    PDF_MARGIN_TOP,
    PDF_MARGIN_BOTTOM,
    PDF_MARGIN_LEFT,
    PDF_MARGIN_RIGHT
  );
  
  // Split kanjis into pages
  const totalPages = Math.max(1, Math.ceil(kanjis.length / tablesPerPage));
  const pages: KanjiData[][] = [];
  
  for (let i = 0; i < totalPages; i++) {
    const start = i * tablesPerPage;
    const end = start + tablesPerPage;
    pages.push(kanjis.slice(start, end));
  }
  
  return (
    <Document>
      {pages.map((pageKanjis, pageIndex) => (
        <PDFSheetPage
          key={pageIndex}
          kanjis={pageKanjis}
          sheetColumnCount={sheetColumnCount}
          kanjiFont={kanjiFont}
          kanjiFontSizeMultiplier={kanjiFontSizeMultiplier}
          showHeader={showHeader}
          showFooter={showFooter}
          headerText={headerText}
          headerFont={headerFont}
          hanVietFont={hanVietFont}
          hanVietFontSizeRatio={hanVietFontSizeRatio}
          hanVietOrientation={hanVietOrientation}
          indicatorFontSizeRatio={indicatorFontSizeRatio}
          showHanViet={showHanViet}
          showJlptIndicator={showJlptIndicator}
          showGradeIndicator={showGradeIndicator}
          showFrequencyIndicator={showFrequencyIndicator}
          currentPage={pageIndex + 1}
          totalPages={totalPages}
          sheetGuideOpacity={sheetGuideOpacity}
          sheetTracingOpacity={sheetTracingOpacity}
          explanationLineCount={explanationLineCount}
          grayscaleMode={grayscaleMode}
        />
      ))}
    </Document>
  );
}
