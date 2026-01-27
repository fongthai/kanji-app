/**
 * useVocabularyPagination Hook
 *
 * Measures actual vocabulary row heights and calculates intelligent pagination
 * Returns page breaks based on real content heights to prevent overflow
 */

import { useState, useEffect, useMemo } from 'react';
import type { VocabularyData } from '../types/vocabulary';
import { A4_HEIGHT, BOARD_HEADER_HEIGHT, BOARD_FOOTER_HEIGHT } from '../constants/boardDimensions';

interface VocabularyPaginationSettings {
  showHanViet: boolean;
  showVietnameseMeaning: boolean;
  showEnglishMeaning: boolean;
  showExampleSentence: boolean;
  showExampleTranslation: boolean;
  practiceCellSize: number;
}

interface VocabularyPaginationResult {
  pageBreaks: number[]; // Array of start indices for each page [0, 5, 10, 15, ...]
  totalPages: number;
  rowHeights: number[];
  isMeasuring: boolean;
  getStartIndexForPage: (page: number) => number;
  getPageForIndex: (index: number) => number;
}

export function useVocabularyPagination(
  vocabularies: VocabularyData[],
  showHeader: boolean,
  showFooter: boolean,
  settings: VocabularyPaginationSettings
): VocabularyPaginationResult {
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(true);

  // Calculate available height per page
  const availableHeight = useMemo(() => {
    const verticalMargin = 40;
    let height = A4_HEIGHT - verticalMargin;
    if (showHeader) height -= BOARD_HEADER_HEIGHT;
    if (showFooter) height -= BOARD_FOOTER_HEIGHT;
    return height;
  }, [showHeader, showFooter]);

  // Trigger re-measurement when vocabularies or settings change
  useEffect(() => {
    if (vocabularies.length === 0) {
      setRowHeights([]);
      setIsMeasuring(false);
      return;
    }

    // Mark as measuring
    setIsMeasuring(true);

    // Heights will be measured by VocabularySheetGrid component
    // This hook will receive them via setRowHeights
  }, [
    vocabularies,
    settings.practiceCellSize,
    settings.showHanViet,
    settings.showVietnameseMeaning,
    settings.showEnglishMeaning,
    settings.showExampleSentence,
    settings.showExampleTranslation,
  ]);

  // Calculate page breaks based on measured heights
  const pageBreaks = useMemo(() => {
    if (rowHeights.length === 0 || vocabularies.length === 0) {
      return [0]; // Default to single page starting at 0
    }

    const breaks: number[] = [0]; // First page always starts at 0
    let currentHeight = 0;

    for (let i = 0; i < vocabularies.length && i < rowHeights.length; i++) {
      const rowHeight = rowHeights[i];

      // Check if adding this row would exceed available height
      if (currentHeight + rowHeight > availableHeight && i > breaks[breaks.length - 1]) {
        // Start a new page at this index
        breaks.push(i);
        currentHeight = rowHeight; // Start new page with this row's height
      } else {
        currentHeight += rowHeight;
      }
    }

    return breaks;
  }, [rowHeights, vocabularies.length, availableHeight]);

  // Calculate total pages
  const totalPages = pageBreaks.length;

  // Helper function to get start index for a given page (1-indexed)
  const getStartIndexForPage = (page: number): number => {
    if (page < 1) return 0;
    if (page > totalPages) return vocabularies.length;
    return pageBreaks[page - 1];
  };

  // Helper function to get which page an index belongs to
  const getPageForIndex = (index: number): number => {
    for (let i = pageBreaks.length - 1; i >= 0; i--) {
      if (index >= pageBreaks[i]) {
        return i + 1; // Convert to 1-indexed page number
      }
    }
    return 1;
  };

  return {
    pageBreaks,
    totalPages,
    rowHeights,
    isMeasuring,
    getStartIndexForPage,
    getPageForIndex,
  };
}
