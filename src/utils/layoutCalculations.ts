/**
 * Layout calculation utilities for both screen and PDF rendering
 */

import { getIndicatorColumnMultiplier } from '../constants/indicators';

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
 * Uses an improved calculation that accounts for rounding differences
 * by checking actual space needed per row
 * Adds a small tolerance (10pt) to account for layout rounding and CSS spacing
 */
export const calculateRowCount = (
  availableHeight: number,
  cellSize: number,
  gap: number
): number => {
  // Add a small tolerance to account for rounding and CSS layout quirks
  // This allows rows that are very close to fitting to actually fit
  const tolerance = 10;
  const effectiveHeight = availableHeight + tolerance;

  let rowCount = 0;
  // Keep adding rows until we run out of space
  // Space needed for N rows: N * cellSize + (N - 1) * gap
  while (true) {
    const nextRowCount = rowCount + 1;
    const spaceNeeded = nextRowCount * cellSize + (nextRowCount - 1) * gap;
    if (spaceNeeded <= effectiveHeight) {
      rowCount = nextRowCount;
    } else {
      break;
    }
  }
  return rowCount;
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
 * @param columnCount - Optional: Number of columns in the grid (4-15) for indicator multiplier
 */
export const calculateFontSizes = (
  cellSize: number,
  kanjiSizePercentage: number,
  hanVietSizePercentage: number,
  columnCount?: number
) => {
  // Base kanji: 65% of cell size (maximized for PDF glyph rendering)
  // At 110% default: 71.5% fill, At 115% tested max: 74.75% fill
  // Higher percentage causes PDFKit rendering failures. Use lineHeight: 1 to remove font leading.
  const baseKanjiFontSize = cellSize * 0.7;

  // Apply user's percentage adjustment
  const kanjiFontSize = baseKanjiFontSize * (kanjiSizePercentage / 100);

  // Indicator and Han-viet: 25% of base kanji size
  const baseIndicatorSize = baseKanjiFontSize * 0.25;

  // Apply column-based multiplier if columnCount provided
  const columnMultiplier = columnCount ? getIndicatorColumnMultiplier(columnCount) : 1.0;
  const indicatorFontSize = baseIndicatorSize * (hanVietSizePercentage / 100) * columnMultiplier;

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
