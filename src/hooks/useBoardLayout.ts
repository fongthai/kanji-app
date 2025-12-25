import { useMemo } from 'react';
import {
  calculateBoardCellSize,
  calculateRowCount,
  calculateBoardCardsPerPage,
  calculateFontSizes,
} from '../utils/layoutCalculations';
import { A4_WIDTH, A4_HEIGHT, BOARD_HEADER_HEIGHT, BOARD_FOOTER_HEIGHT, GRID_GAP } from '../constants/boardDimensions';

interface UseBoardLayoutOptions {
  columnCount: number;
  showHeader: boolean;
  showFooter: boolean;
  kanjiSizePercentage: number;  // 60-120
  hanVietSizePercentage: number; // 60-120
}

export interface BoardLayout {
  cellSize: number;
  rowCount: number;
  cardsPerPage: number;
  availableWidth: number;
  availableHeight: number;
  kanjiFontSize: number;      // in pixels/points
  kanjiFontSizeRem: number;   // in rem for CSS
  indicatorFontSize: number;  // in pixels/points
  indicatorFontSizeRem: number; // in rem for CSS
  hanVietFontSize: number;    // in pixels/points
  hanVietFontSizeRem: number; // in rem for CSS
  gap: number;
}

/**
 * Hook to calculate board layout dimensions
 * Can be used by both screen components and PDF components
 */
export const useBoardLayout = ({
  columnCount,
  showHeader,
  showFooter,
  kanjiSizePercentage,
  hanVietSizePercentage,
}: UseBoardLayoutOptions): BoardLayout => {
  return useMemo(() => {
    // Calculate available dimensions
    const availableWidth = A4_WIDTH;
    let availableHeight = A4_HEIGHT;
    
    if (showHeader) availableHeight -= BOARD_HEADER_HEIGHT;
    if (showFooter) availableHeight -= BOARD_FOOTER_HEIGHT;
    
    // Calculate cell size
    const cellSize = calculateBoardCellSize(availableWidth, columnCount, GRID_GAP);
    
    // Calculate row count
    const rowCount = calculateRowCount(availableHeight, cellSize, GRID_GAP);
    
    // Calculate cards per page
    const cardsPerPage = calculateBoardCardsPerPage(columnCount, rowCount);
    
    // Calculate font sizes
    const { kanjiFontSize, indicatorFontSize, hanVietFontSize } = calculateFontSizes(
      cellSize,
      kanjiSizePercentage,
      hanVietSizePercentage
    );
    
    return {
      cellSize,
      rowCount,
      cardsPerPage,
      availableWidth,
      availableHeight,
      kanjiFontSize,
      kanjiFontSizeRem: kanjiFontSize / 16,
      indicatorFontSize,
      indicatorFontSizeRem: indicatorFontSize / 16,
      hanVietFontSize,
      hanVietFontSizeRem: hanVietFontSize / 16,
      gap: GRID_GAP,
    };
  }, [columnCount, showHeader, showFooter, kanjiSizePercentage, hanVietSizePercentage]);
};
