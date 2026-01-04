import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import type { KanjiData } from '../features/kanji/kanjiSlice';
import { PDFBoardDocument } from '../components/pdf/PDFBoardDocument';
import {
  calculateBoardCellSize,
  calculateRowCount,
  calculateBoardCardsPerPage,
  calculateFontSizes,
} from './layoutCalculations';
import { GRID_GAP } from '../constants/boardDimensions';
import {
  A4_WIDTH_PT,
  A4_HEIGHT_PT,
  PDF_MARGIN_TOP,
  PDF_MARGIN_RIGHT,
  PDF_MARGIN_BOTTOM,
  PDF_MARGIN_LEFT,
  PDF_HEADER_HEIGHT,
  PDF_FOOTER_HEIGHT,
  PDF_CARD_BORDER_TOTAL,
} from '../constants/pdfDimensions';
import { FOOTER_TEXT } from '../constants/appText';

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// 300 DPI dimensions for PNG (kept for reference, not currently used)
const PNG_DPI = 300;

// PDF/PNG indicator and text size ratios (as % of cell size)
const PDF_INDICATOR_RATIO = 0.15;  // 15% of cell size for PDF exports
const PNG_INDICATOR_RATIO = 0.18;  // 18% of cell size for PNG exports
const BASE_HANVIET_RATIO = 0.15;   // 15% of cell size base (scaled by user's hanVietSize %)

// PDF Board mode scale factor (for gap calculations)
const PDF_SCALE_FACTOR = 0.8524;  // Approximate ratio for gap scaling

export interface ExportProgress {
  currentPage: number;
  totalPages: number;
  status: 'preparing' | 'exporting' | 'completed' | 'error' | 'cancelled';
  message: string;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;
export type CancelCheck = () => boolean;

/**
 * Wait for all fonts to be loaded before export
 */
async function waitForFonts(): Promise<boolean> {
  try {
    if (!document.fonts) {
      console.warn('Font Loading API not supported');
      return true;
    }
    
    await document.fonts.ready;
    return true;
  } catch (error) {
    console.error('Error waiting for fonts:', error);
    return false;
  }
}

/**
 * Generate metadata for PDF
 */
function generateMetadata(
  chosenKanjis: KanjiData[],
  mode: string,
  columnCount: number
): {
  title: string;
  subject: string;
  keywords: string;
  custom: Record<string, string>;
} {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate JLPT breakdown
  const jlptBreakdown: Record<string, number> = {};
  chosenKanjis.forEach((kanji) => {
    if (kanji.jlptLevel) {
      const level = kanji.jlptLevel.startsWith('N') ? kanji.jlptLevel : `N${kanji.jlptLevel}`;
      jlptBreakdown[level] = (jlptBreakdown[level] || 0) + 1;
    }
  });

  const jlptSummary = Object.entries(jlptBreakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([level, count]) => `${level}: ${count}`)
    .join(', ');

  return {
    title: `${FOOTER_TEXT} - ${date}`,
    subject: 'JLPT Study Material',
    keywords: 'kanji, japanese, Hán Việt',
    custom: {
      'Total Kanjis': chosenKanjis.length.toString(),
      'JLPT Breakdown': jlptSummary || 'N/A',
      Mode: mode === 'sheet' ? 'Sheet Mode' : 'Board Mode',
      'Column Count': columnCount.toString(),
      'Generated Date': new Date().toISOString(),
    },
  };
}

/**
 * Generate filename with timestamp
 */
function generateFilename(mode: string, extension: 'pdf' | 'png' | 'zip', pageNumber?: number): string {
  const now = new Date();
  // Format: YYMMDD
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Format: HHMMSS
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const timeStr = `${hours}${minutes}${seconds}`;

  const base = `ft-kanji-${mode}-${dateStr}-${timeStr}`;
  
  if (pageNumber !== undefined) {
    const pageNum = pageNumber.toString().padStart(2, '0');
    return `${base}-page${pageNum}.${extension}`;
  }
  
  return `${base}.${extension}`;
}

/**
 * Capture a single page as canvas
 */
async function capturePage(
  element: HTMLElement,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  return await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
}

/**
 * Export all pages as PDF
 */
export async function exportToPDF(
  getTotalPages: () => number,
  navigateToPage: (page: number) => void,
  getA4Element: () => HTMLElement | null,
  getCurrentMode: () => string,
  getColumnCount: () => number,
  getChosenKanjis: () => KanjiData[],
  onProgress: ExportProgressCallback,
  isCancelled: CancelCheck
): Promise<void> {
  try {
    // Check fonts first
    onProgress({
      currentPage: 0,
      totalPages: 0,
      status: 'preparing',
      message: 'Preparing export...',
    });

    const fontsReady = await waitForFonts();
    if (!fontsReady) {
      throw new Error('Failed to load fonts. Export may have incorrect rendering.');
    }

    const totalPages = getTotalPages();
    const mode = getCurrentMode();
    const columnCount = getColumnCount();
    const chosenKanjis = getChosenKanjis();

    // Show confirmation for large exports
    if (totalPages > 20) {
      const confirmed = window.confirm(
        `You're about to export ${totalPages} pages. This may take ${Math.ceil(totalPages / 10)} - ${Math.ceil(totalPages / 5)} minutes. Continue?`
      );
      if (!confirmed) {
        onProgress({
          currentPage: 0,
          totalPages,
          status: 'cancelled',
          message: 'Export cancelled',
        });
        return;
      }
    }

    // Initialize PDF (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add metadata
    const metadata = generateMetadata(chosenKanjis, mode, columnCount);
    pdf.setProperties({
      title: metadata.title,
      subject: metadata.subject,
      keywords: metadata.keywords,
      creator: 'Fong Thai Kanji Tool',
    });

    // Export each page
    for (let page = 1; page <= totalPages; page++) {
      if (isCancelled()) {
        onProgress({
          currentPage: page - 1,
          totalPages,
          status: 'cancelled',
          message: 'Export cancelled',
        });
        return;
      }

      onProgress({
        currentPage: page,
        totalPages,
        status: 'exporting',
        message: `Exporting page ${page} of ${totalPages}...`,
      });

      // Navigate to page
      navigateToPage(page);

      // Wait for render (important!)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get A4 element
      const a4Element = getA4Element();
      if (!a4Element) {
        throw new Error(`Failed to find A4 element for page ${page}`);
      }

      // Capture page
      const canvas = await capturePage(a4Element, 2);

      // Add page to PDF (if not first page)
      if (page > 1) {
        pdf.addPage();
      }

      // Add image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

      // Clear canvas to free memory
      canvas.width = 0;
      canvas.height = 0;
    }

    // Save PDF
    const filename = generateFilename(mode, 'pdf');
    pdf.save(filename);

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'completed',
      message: 'PDF export completed!',
    });
  } catch (error) {
    console.error('PDF export error:', error);
    onProgress({
      currentPage: 0,
      totalPages: 0,
      status: 'error',
      message: error instanceof Error ? error.message : 'Export failed',
    });
    throw error;
  }
}

/**
 * Export all pages as PNG images in ZIP
 */
export async function exportToPNG(
  getTotalPages: () => number,
  navigateToPage: (page: number) => void,
  getA4Element: () => HTMLElement | null,
  getCurrentMode: () => string,
  onProgress: ExportProgressCallback,
  isCancelled: CancelCheck
): Promise<void> {
  try {
    // Check fonts first
    onProgress({
      currentPage: 0,
      totalPages: 0,
      status: 'preparing',
      message: 'Preparing export...',
    });

    const fontsReady = await waitForFonts();
    if (!fontsReady) {
      throw new Error('Failed to load fonts. Export may have incorrect rendering.');
    }

    const totalPages = getTotalPages();
    const mode = getCurrentMode();

    // Show confirmation for large exports
    if (totalPages > 20) {
      const confirmed = window.confirm(
        `You're about to export ${totalPages} PNG images. This may take ${Math.ceil(totalPages / 10)} - ${Math.ceil(totalPages / 5)} minutes. Continue?`
      );
      if (!confirmed) {
        onProgress({
          currentPage: 0,
          totalPages,
          status: 'cancelled',
          message: 'Export cancelled',
        });
        return;
      }
    }

    // Initialize ZIP
    const zip = new JSZip();

    // Export each page
    for (let page = 1; page <= totalPages; page++) {
      if (isCancelled()) {
        onProgress({
          currentPage: page - 1,
          totalPages,
          status: 'cancelled',
          message: 'Export cancelled',
        });
        return;
      }

      onProgress({
        currentPage: page,
        totalPages,
        status: 'exporting',
        message: `Exporting page ${page} of ${totalPages}...`,
      });

      // Navigate to page
      navigateToPage(page);

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get A4 element
      const a4Element = getA4Element();
      if (!a4Element) {
        throw new Error(`Failed to find A4 element for page ${page}`);
      }

      // Capture at 300 DPI (scale calculation: 300dpi / 96dpi = 3.125)
      const scale = PNG_DPI / 96;
      const canvas = await capturePage(a4Element, scale);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          'image/png',
          1.0
        );
      });

      // Add to ZIP
      const filename = generateFilename(mode, 'png', page);
      zip.file(filename, blob);

      // Clear canvas to free memory
      canvas.width = 0;
      canvas.height = 0;
    }

    // Generate and save ZIP
    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'exporting',
      message: 'Creating ZIP file...',
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFilename = generateFilename(mode, 'zip');
    saveAs(zipBlob, zipFilename);

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'completed',
      message: 'PNG export completed!',
    });
  } catch (error) {
    console.error('PNG Export error:', error);
    const totalPages = getTotalPages();
    onProgress({
      currentPage: 0,
      totalPages,
      status: 'error',
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Export board mode as PDF using React-PDF (vector-based)
 */
export async function exportBoardToPDFVector(
  kanjis: KanjiData[],
  columnCount: number,
  showHeader: boolean,
  showFooter: boolean,
  showEmptyCells: boolean,
  centerCards: boolean,
  kanjiFont: string,
  kanjiFontSize: number,  // 60-120 percentage
  hanVietFont: string,
  hanVietFontSize: number, // 60-120 percentage
  hanVietOrientation: 'horizontal' | 'vertical',
  showHanViet: boolean,
  showJlptIndicator: boolean,
  showGradeIndicator: boolean,
  showFrequencyIndicator: boolean,
  headerText: string,
  headerFontFamily: string,
  headerFontFilename: string,
  grayscaleMode: boolean,
  onProgress: ExportProgressCallback
): Promise<boolean> {
  try {
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'preparing',
      message: 'Preparing PDF document...',
    });

    // Calculate layout dimensions using shared PDF constants
    // Note: Header/footer spacing is handled by CSS margins in PDFBoardPage, not part of height calculation
    const headerHeightPt = showHeader ? PDF_HEADER_HEIGHT : 0;
    const footerHeightPt = showFooter ? PDF_FOOTER_HEIGHT : 0;
    const gapPt = GRID_GAP * PDF_SCALE_FACTOR;

    const availableWidth = A4_WIDTH_PT - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT;
    const availableHeight = A4_HEIGHT_PT - PDF_MARGIN_TOP - PDF_MARGIN_BOTTOM - headerHeightPt - footerHeightPt;

    const cellSize = calculateBoardCellSize(availableWidth, columnCount, gapPt);
    const rowCount = calculateRowCount(availableHeight, cellSize, gapPt);
    const cardsPerPage = calculateBoardCardsPerPage(columnCount, rowCount);

    // Calculate actual card size (accounting for 2pt border on each side)
    const actualCardSize = cellSize - PDF_CARD_BORDER_TOTAL;

    console.log('=== PDF BOARD EXPORT DEBUG ===');
    console.log('availableWidth:', availableWidth);
    console.log('columnCount:', columnCount);
    console.log('gapPt:', gapPt);
    console.log('cellSize (calculated):', cellSize);
    console.log('actualCardSize (cellSize - 4):', actualCardSize);
    console.log('PDF_CARD_BORDER_TOTAL:', PDF_CARD_BORDER_TOTAL);

    // Calculate font sizes based on actual card content area, not total cell size
    const { kanjiFontSize: kanjiFontSizePt, indicatorFontSize, hanVietFontSize: hanVietFontSizePt } = calculateFontSizes(
      actualCardSize,
      kanjiFontSize,
      hanVietFontSize
    );

    console.log('kanjiFontSize input %:', kanjiFontSize);
    console.log('hanVietFontSize input %:', hanVietFontSize);
    console.log('kanjiFontSizePt (output):', kanjiFontSizePt);
    console.log('hanVietFontSizePt (output):', hanVietFontSizePt);
    console.log('indicatorFontSize:', indicatorFontSize);
    console.log('============================');

    const totalPages = Math.ceil(kanjis.length / cardsPerPage);

    // Replace system-ui with NotoSansJP for PDF (React-PDF doesn't support system-ui)
    // NotoSansJP has excellent Unicode support including Vietnamese diacritics
    const pdfKanjiFont = kanjiFont === 'system-ui' ? 'NotoSansJP-Regular' : kanjiFont;
    const pdfHanVietFont = hanVietFont === 'system-ui' ? 'NotoSansJP-Regular' : hanVietFont;

    onProgress({
      currentPage: 0,
      totalPages,
      status: 'exporting',
      message: `Generating ${totalPages} page${totalPages > 1 ? 's' : ''}...`,
    });

    // Create React-PDF document
    const document = PDFBoardDocument({
      kanjis,
      columnCount,
      cellSize,
      rowCount,
      gap: gapPt,
      kanjiFont: pdfKanjiFont,
      kanjiFontSize: kanjiFontSizePt,
      hanVietFont: pdfHanVietFont,
      hanVietFontSize: hanVietFontSizePt,
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
      totalKanjis: kanjis.length,
      headerText,
      headerFontFamily: headerFontFamily === 'system-ui' ? 'Helvetica' : headerFontFamily,
      headerFontFilename,
      availableWidth,
      grayscaleMode,
    });

    // Generate PDF blob
    const blob = await pdf(document as any).toBlob();

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'exporting',
      message: 'Saving PDF file...',
    });

    // Save file
    const filename = generateFilename('board', 'pdf');
    saveAs(blob, filename);

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'completed',
      message: 'PDF export completed!',
    });

    return true;
  } catch (error) {
    console.error('PDF Export error:', error);
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'error',
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return false;
  }
}

/**
 * Export Sheet mode as vector-based PDF
 */
export async function exportSheetToPDFVector(
  kanjis: KanjiData[],
  sheetColumnCount: number,
  showHeader: boolean,
  showFooter: boolean,
  kanjiFont: string,
  kanjiSize: number,
  headerText: string,
  headerFontFamily: string,
  hanVietFont: string,
  hanVietSize: number,
  hanVietOrientation: 'horizontal' | 'vertical',
  showHanViet: boolean,
  showJlptIndicator: boolean,
  showGradeIndicator: boolean,
  showFrequencyIndicator: boolean,
  sheetGuideOpacity: number[],
  sheetTracingOpacity: number[],
  explanationLineCount: 1 | 2 | 3,
  grayscaleMode: boolean,
  onProgress: ExportProgressCallback
): Promise<boolean> {
  try {
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'preparing',
      message: 'Preparing Sheet PDF document...',
    });

    // Import PDFSheetDocument dynamically to avoid circular dependencies
    const { PDFSheetDocument, registerKanjiFont } = await import('../components/pdf/PDFSheetDocument');
    const { calculateTablesPerPage } = await import('../components/screen/SheetGrid');

    // Calculate total pages
    const tablesPerPage = calculateTablesPerPage(
      sheetColumnCount,
      showHeader,
      showFooter,
      explanationLineCount
    );
    const totalPages = Math.max(1, Math.ceil(kanjis.length / tablesPerPage));

    // Register and get font names for PDF (with fallback to NotoSansJP)
    const pdfKanjiFont = registerKanjiFont(kanjiFont);
    const pdfHeaderFont = headerFontFamily === 'system-ui' ? 'Helvetica' : headerFontFamily;
    const pdfHanVietFont = registerKanjiFont(hanVietFont);

    // Calculate font size percentages (will be applied to actual cell size in PDF)
    // kanjiSize is user's percentage (70-110), pass it directly as a multiplier
    const kanjiFontSizeMultiplier = kanjiSize / 100; // e.g., 90 -> 0.9
    
    // For indicators and han-viet, use fixed ratios
    // These will be calculated in the PDF based on actual cell size
    const indicatorFontSizeRatio = PDF_INDICATOR_RATIO;
    const hanVietFontSizeRatio = BASE_HANVIET_RATIO * (hanVietSize / 100); // Base ratio scaled by user's percentage

    onProgress({
      currentPage: 0,
      totalPages,
      status: 'exporting',
      message: `Generating ${totalPages} page${totalPages > 1 ? 's' : ''}...`,
    });

    // Create PDF document
    const document = PDFSheetDocument({
      kanjis,
      sheetColumnCount,
      kanjiFont: pdfKanjiFont,
      kanjiFontSizeMultiplier,
      showHeader,
      showFooter,
      headerText,
      headerFont: pdfHeaderFont,
      hanVietFont: pdfHanVietFont,
      hanVietFontSizeRatio,
      hanVietOrientation,
      indicatorFontSizeRatio,
      showHanViet,
      showJlptIndicator,
      showGradeIndicator,
      showFrequencyIndicator,
      sheetGuideOpacity,
      sheetTracingOpacity,
      explanationLineCount,
      grayscaleMode,
    });

    // Generate PDF blob
    const blob = await pdf(document as any).toBlob();

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'exporting',
      message: 'Saving PDF file...',
    });

    // Save file
    const filename = generateFilename('sheet', 'pdf');
    saveAs(blob, filename);

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'completed',
      message: 'PDF export completed!',
    });

    return true;
  } catch (error) {
    console.error('Sheet PDF Export error:', error);
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'error',
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return false;
  }
}

/**
 * Export Sheet mode as PNG (via PDF → PNG conversion)
 */
export async function exportSheetToPNG(
  kanjis: KanjiData[],
  sheetColumnCount: number,
  showHeader: boolean,
  showFooter: boolean,
  kanjiFont: string,
  kanjiSize: number,
  headerText: string,
  headerFontFamily: string,
  hanVietFont: string,
  hanVietSize: number,
  hanVietOrientation: 'horizontal' | 'vertical',
  showHanViet: boolean,
  showJlptIndicator: boolean,
  showGradeIndicator: boolean,
  showFrequencyIndicator: boolean,
  sheetGuideOpacity: number[],
  sheetTracingOpacity: number[],
  explanationLineCount: 1 | 2 | 3,
  grayscaleMode: boolean,
  pngQuality: 200 | 300 | 600,
  onProgress: ExportProgressCallback,
  checkCancelled: CancelCheck
): Promise<boolean> {
  try {
    // Step 1: Generate PDF first
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'preparing',
      message: 'Generating PDF for conversion...',
    });

    // Import PDFSheetDocument and calculate pages
    const { PDFSheetDocument, registerKanjiFont } = await import('../components/pdf/PDFSheetDocument');
    const { calculateTablesPerPage } = await import('../components/screen/SheetGrid');

    const tablesPerPage = calculateTablesPerPage(
      sheetColumnCount,
      showHeader,
      showFooter,
      explanationLineCount
    );
    const totalPages = Math.max(1, Math.ceil(kanjis.length / tablesPerPage));

    // Register fonts
    const pdfKanjiFont = registerKanjiFont(kanjiFont);
    const pdfHeaderFont = headerFontFamily === 'system-ui' ? 'Helvetica' : headerFontFamily;
    const pdfHanVietFont = registerKanjiFont(hanVietFont);

    const kanjiFontSizeMultiplier = kanjiSize / 100;
    const indicatorFontSizeRatio = PNG_INDICATOR_RATIO;
    const hanVietFontSizeRatio = BASE_HANVIET_RATIO * (hanVietSize / 100);

    // Create PDF document
    const document = PDFSheetDocument({
      kanjis,
      sheetColumnCount,
      kanjiFont: pdfKanjiFont,
      kanjiFontSizeMultiplier,
      showHeader,
      showFooter,
      headerText,
      headerFont: pdfHeaderFont,
      hanVietFont: pdfHanVietFont,
      hanVietFontSizeRatio,
      hanVietOrientation,
      indicatorFontSizeRatio,
      showHanViet,
      showJlptIndicator,
      showGradeIndicator,
      showFrequencyIndicator,
      sheetGuideOpacity,
      sheetTracingOpacity,
      explanationLineCount,
      grayscaleMode,
    });

    const pdfBlob = await pdf(document as any).toBlob();

    if (checkCancelled()) {
      onProgress({
        currentPage: 0,
        totalPages,
        status: 'cancelled',
        message: 'Export cancelled',
      });
      return false;
    }

    // Step 2: Convert PDF to PNG using pdf.js
    onProgress({
      currentPage: 0,
      totalPages,
      status: 'exporting',
      message: 'Converting PDF to PNG...',
    });

    const pdfjsLib = await import('pdfjs-dist');
    // Use the worker from the npm package instead of CDN
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const zip = new JSZip();
    const pngBlobs: Blob[] = [];
    const scale = pngQuality / 72;

    // Convert each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (checkCancelled()) {
        onProgress({
          currentPage: pageNum - 1,
          totalPages,
          status: 'cancelled',
          message: 'Export cancelled',
        });
        return false;
      }

      onProgress({
        currentPage: pageNum,
        totalPages,
        status: 'exporting',
        message: `Converting page ${pageNum} of ${totalPages} to PNG...`,
      });

      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Create canvas
      const canvas = globalThis.document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b: Blob | null) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create PNG blob'));
        }, 'image/png');
      });

      pngBlobs.push(blob);

      if (totalPages > 1) {
        const filename = `page-${pageNum.toString().padStart(2, '0')}.png`;
        zip.file(filename, blob);
      }

      canvas.width = 0;
      canvas.height = 0;
    }

    // Step 3: Save file(s)
    if (totalPages === 1) {
      onProgress({
        currentPage: totalPages,
        totalPages,
        status: 'exporting',
        message: 'Saving PNG file...',
      });

      const filename = generateFilename('sheet', 'png');
      saveAs(pngBlobs[0], filename);
    } else {
      onProgress({
        currentPage: totalPages,
        totalPages,
        status: 'exporting',
        message: 'Creating ZIP archive...',
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const filename = generateFilename('sheet', 'zip');
      saveAs(zipBlob, filename);
    }

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'completed',
      message: 'PNG export completed!',
    });

    return true;
  } catch (error) {
    console.error('Sheet PNG Export error:', error);
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'error',
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return false;
  }
}

/**
 * Export board mode as PNG images (one per page) in a ZIP file
 * Uses same settings as PDF export
 */
export async function exportBoardToPNG(
  chosenKanjis: KanjiData[],
  boardSettings: {
    boardColumnCount: number;
    showEmptyCells: boolean;
    centerCards: boolean;
    showHeader: boolean;
    showFooter: boolean;
  },
  displaySettings: {
    kanjiFont: string;
    hanVietFont: string;
    hanVietOrientation: 'horizontal' | 'vertical';
    showHanViet: boolean;
    showJlptIndicator: boolean;
    showGradeIndicator: boolean;
    showFrequencyIndicator: boolean;
    kanjiSize: number;
    hanVietSize: number;
  },
  pngQuality: 200 | 300 | 600, // DPI
  headerText: string,
  headerFontFamily: string,
  headerFontFilename: string,
  grayscaleMode: boolean,
  onProgress: ExportProgressCallback,
  checkCancelled: CancelCheck
): Promise<boolean> {
  try {
    // Step 1: Generate PDF first (same as PDF export)
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'preparing',
      message: 'Generating PDF for conversion...',
    });

    // Map system-ui to NotoSansJP for PDF generation
    const pdfKanjiFont = displaySettings.kanjiFont === 'system-ui' ? 'NotoSansJP-Regular' : displaySettings.kanjiFont;
    const pdfHanVietFont = displaySettings.hanVietFont === 'system-ui' ? 'NotoSansJP-Regular' : displaySettings.hanVietFont;

    // Calculate layout dimensions using shared PDF constants
    // Note: Header/footer spacing is handled by CSS margins in PDFBoardPage, not part of height calculation
    const headerHeightPt = boardSettings.showHeader ? PDF_HEADER_HEIGHT : 0;
    const footerHeightPt = boardSettings.showFooter ? PDF_FOOTER_HEIGHT : 0;
    const gapPt = GRID_GAP * PDF_SCALE_FACTOR;
    
    const availableWidth = A4_WIDTH_PT - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT;
    const availableHeight = A4_HEIGHT_PT - PDF_MARGIN_TOP - PDF_MARGIN_BOTTOM - headerHeightPt - footerHeightPt;
    
    const cellSize = Math.floor((availableWidth - (boardSettings.boardColumnCount - 1) * gapPt) / boardSettings.boardColumnCount);
    const rowCount = Math.floor((availableHeight + gapPt) / (cellSize + gapPt));
    const cardsPerPage = boardSettings.boardColumnCount * rowCount;
    const totalPages = Math.ceil(chosenKanjis.length / cardsPerPage);

    // Calculate actual card size (accounting for 2pt border on each side)
    const actualCardSize = cellSize - PDF_CARD_BORDER_TOTAL;

    // Calculate font sizes in points (PDF uses points, not rem)
    // Base sizes: Kanji 75% of actual card, Han-Viet 20% of kanji
    // Then apply user's percentage adjustments (60-120%)
    const baseKanjiFontSize = actualCardSize * 0.75;
    const kanjiSizePercentage = Math.max(60, Math.min(120, displaySettings.kanjiSize));
    const kanjiFontSize = baseKanjiFontSize * (kanjiSizePercentage / 100);
    
    const baseIndicatorSize = baseKanjiFontSize * 0.20;
    const hanVietSizePercentage = Math.max(60, Math.min(120, displaySettings.hanVietSize));
    const hanVietFontSize = baseIndicatorSize * (hanVietSizePercentage / 100);
    const indicatorFontSize = hanVietFontSize;

    // Generate PDF blob
    const document = PDFBoardDocument({
      kanjis: chosenKanjis,
      columnCount: boardSettings.boardColumnCount,
      cellSize,
      rowCount,
      gap: gapPt,
      kanjiFont: pdfKanjiFont,
      kanjiFontSize,
      hanVietFont: pdfHanVietFont,
      hanVietFontSize,
      hanVietOrientation: displaySettings.hanVietOrientation,
      indicatorFontSize,
      showHanViet: displaySettings.showHanViet,
      showJlptIndicator: displaySettings.showJlptIndicator,
      showGradeIndicator: displaySettings.showGradeIndicator,
      showFrequencyIndicator: displaySettings.showFrequencyIndicator,
      showEmptyCells: boardSettings.showEmptyCells,
      centerCards: false,
      showHeader: boardSettings.showHeader,
      showFooter: boardSettings.showFooter,
      totalKanjis: chosenKanjis.length,
      headerText,
      headerFontFamily,
      headerFontFilename,
      availableWidth,
      grayscaleMode,
    });

    const pdfBlob = await pdf(document as any).toBlob();

    if (checkCancelled()) {
      onProgress({ currentPage: 0, totalPages, status: 'cancelled', message: 'Export cancelled by user' });
      return false;
    }

    // Add delay to ensure PDF is fully rendered
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Convert PDF to PNG using pdfjs-dist
    onProgress({
      currentPage: 0,
      totalPages,
      status: 'exporting',
      message: 'Converting PDF to PNG images...',
    });

    const pdfjsLib = await import('pdfjs-dist');
    // Use the worker from the npm package instead of CDN
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

    const pdfData = await pdfBlob.arrayBuffer();
    const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;

    // Step 3: Render each page to PNG
    const zip = new JSZip();
    const scale = pngQuality / 72; // Convert DPI to scale (72 is PDF default DPI)
    const pngBlobs: Blob[] = []; // Store blobs for single page handling

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (checkCancelled()) {
        onProgress({ currentPage: pageNum - 1, totalPages, status: 'cancelled', message: 'Export cancelled by user' });
        return false;
      }

      onProgress({
        currentPage: pageNum,
        totalPages,
        status: 'exporting',
        message: `Converting page ${pageNum} of ${totalPages}...`,
      });

      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Create canvas
      const canvas = globalThis.document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page to canvas with proper background
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };
      
      await page.render(renderContext).promise;

      // Convert canvas to PNG blob
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert canvas to blob'));
        }, 'image/png');
      });

      pngBlobs.push(pngBlob);

      // Add to ZIP with padded filename (only if multiple pages)
      if (totalPages > 1) {
        const paddedPageNum = pageNum.toString().padStart(3, '0');
        zip.file(`kanji-page-${paddedPageNum}.png`, pngBlob);
      }
    }

    if (checkCancelled()) {
      onProgress({ currentPage: totalPages, totalPages, status: 'cancelled', message: 'Export cancelled by user' });
      return false;
    }

    // Step 4: Download - single PNG or ZIP
    
    if (totalPages === 1) {
      // Single page - download PNG directly
      onProgress({
        currentPage: totalPages,
        totalPages,
        status: 'exporting',
        message: 'Saving PNG file...',
      });
      
      const filename = generateFilename('board', 'png');
      saveAs(pngBlobs[0], filename);
    } else {
      // Multiple pages - create ZIP
      onProgress({
        currentPage: totalPages,
        totalPages,
        status: 'exporting',
        message: 'Creating ZIP archive...',
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const filename = generateFilename('board', 'zip');
      saveAs(zipBlob, filename);
    }

    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'completed',
      message: 'PNG export completed!',
    });

    return true;
  } catch (error) {
    console.error('PNG Export error:', error);
    onProgress({
      currentPage: 0,
      totalPages: 1,
      status: 'error',
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return false;
  }
}
