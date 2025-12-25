/**
 * Layout calculation utilities for both screen and PDF rendering
 */

// A4 dimensions at 300 DPI (for reference, actual use is in constants)
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_WIDTH_PX = 794;  // For screen
export const A4_HEIGHT_PX = 1123;

/**
 * Convert rem to points for PDF (1rem = 16pt)
 */
export const remToPoints = (rem: number): number => rem * 16;

/**
 * Convert points to rem
 */
export const pointsToRem = (points: number): number => points / 16;

/**
 * Calculate board grid cell size
 */
export const calculateBoardCellSize = (
  contentWidth: number,
  columnCount: number,
  gap: number
): number => {
  return Math.floor((contentWidth - (columnCount - 1) * gap) / columnCount);
};

/**
 * Calculate how many rows fit in available height
 */
export const calculateRowCount = (
  availableHeight: number,
  cellSize: number,
  gap: number
): number => {
  return Math.floor((availableHeight + gap) / (cellSize + gap));
};

/**
 * Calculate cards per page for board mode
 */
export const calculateBoardCardsPerPage = (
  columnCount: number,
  rowCount: number
): number => {
  return rowCount * columnCount;
};

/**
 * Calculate font sizes for kanji and indicators
 * @param cellSize - Size of the cell in pixels/points
 * @param kanjiSizePercentage - User's kanji size setting (60-120)
 * @param hanVietSizePercentage - User's surround text size setting (60-120)
 */
export const calculateFontSizes = (
  cellSize: number,
  kanjiSizePercentage: number,
  hanVietSizePercentage: number
) => {
  // Base kanji: 75% of cell size
  const baseKanjiFontSize = cellSize * 0.75;
  
  // Apply user's percentage adjustment
  const kanjiFontSize = baseKanjiFontSize * (kanjiSizePercentage / 100);
  
  // Indicator and Han-viet: 20% of base kanji size
  const baseIndicatorSize = baseKanjiFontSize * 0.20;
  const indicatorFontSize = baseIndicatorSize * (hanVietSizePercentage / 100);
  
  return {
    kanjiFontSize,
    indicatorFontSize,
    hanVietFontSize: indicatorFontSize, // Same as indicator
  };
};

/**
 * Get JLPT level color
 */
export const getJLPTColor = (level: string): string => {
  const colors: Record<string, string> = {
    'N5': '#4CAF50', // Green
    'N4': '#8BC34A', // Light Green
    'N3': '#FFC107', // Amber
    'N2': '#FF9800', // Orange
    'N1': '#F44336', // Red
  };
  return colors[level] || '#999';
};

/**
 * Get section color for kanji
 */
export const getSectionColor = (sectionName: string): string => {
  const sectionColorMap: Record<string, string> = {
    'n1-A-org': '#ef4444', // red
    'n1-B-org': '#f97316', // orange
    'n1-C-org': '#eab308', // yellow
    'n1-D-org': '#22c55e', // green
    'n1-E-org': '#3b82f6', // blue
    'n1-F-org': '#a855f7', // purple
    'n1-G-org': '#ec4899', // pink
    'n2-A-org': '#dc2626', // darker red
    'n2-B-org': '#ea580c', // darker orange
    'n3-A-org': '#84cc16', // lime
    'n3-B-org': '#06b6d4', // cyan
    'n4-org': '#8b5cf6', // violet
    'n5-org': '#14b8a6', // teal
  };
  return sectionColorMap[sectionName] || '#000000';
};

/**
 * Calculate pagination details
 */
export const calculatePagination = (
  totalKanjis: number,
  cardsPerPage: number
) => {
  const totalPages = Math.ceil(totalKanjis / cardsPerPage);
  
  return {
    totalPages,
    cardsPerPage,
    getPageKanjis: (pageIndex: number, kanjis: any[]) => {
      const startIdx = pageIndex * cardsPerPage;
      return kanjis.slice(startIdx, startIdx + cardsPerPage);
    },
  };
};
