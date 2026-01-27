/**
 * VocabularySheetGrid Component
 *
 * Renders vocabulary rows for a single A4 page
 * Measures actual row heights and reports them back to parent
 */

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import type { VocabularyData } from '../../types/vocabulary';
import { VocabularyRow } from './VocabularyRow';
import { A4_WIDTH, A4_HEIGHT, BOARD_HEADER_HEIGHT, BOARD_FOOTER_HEIGHT } from '../../constants/boardDimensions';
import { useAppSelector } from '../../app/hooks';

/**
 * Component to track actual rendered heights
 */
function VisibleVocabularyList({
  pageVocabularies,
  startIndex,
  availableWidth,
  availableHeight,
}: {
  pageVocabularies: VocabularyData[];
  startIndex: number;
  availableWidth: number;
  availableHeight: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    // Measurement logic for debugging purposes (currently disabled)
  }, [pageVocabularies, availableHeight, startIndex]);

  return (
    <div ref={containerRef} className="flex flex-col">
      {pageVocabularies.map((vocab, index) => (
        <div key={vocab.id} ref={(el) => { rowRefs.current[index] = el; }}>
          <VocabularyRow
            vocabulary={vocab}
            rowNumber={startIndex + index + 1}
            availableWidth={availableWidth}
          />
        </div>
      ))}
    </div>
  );
}

interface VocabularySheetGridProps {
  vocabularies: VocabularyData[];
  pageVocabularies: VocabularyData[]; // The vocabularies to render on this page
  showHeader: boolean;
  showFooter: boolean;
  onHeightsMeasured?: (heights: number[]) => void;
  onAvailableHeightMeasured?: (height: number) => void;
}

/**
 * VocabularySheetGrid - Renders vocabulary rows for display
 */
export function VocabularySheetGrid({
  vocabularies,
  pageVocabularies,
  showHeader,
  showFooter,
  onHeightsMeasured,
  onAvailableHeightMeasured,
}: VocabularySheetGridProps) {
  const vocabSettings = useAppSelector(state => state.displaySettings.vocabularySheet);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hasMeasured, setHasMeasured] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [actualAvailableHeight, setActualAvailableHeight] = useState<number>(0);

  // Calculate dimensions
  const horizontalMargin = 58; // 38px left (row numbers space) + 20px right padding
  const availableWidth = A4_WIDTH - horizontalMargin;

  // Measure actual available height from parent (accounts for A4Paper scaling)
  useEffect(() => {
    if (containerRef.current && containerRef.current.parentElement) {
      const parentHeight = containerRef.current.parentElement.getBoundingClientRect().height;
      const containerPadding = 40; // 20px top + 20px bottom padding
      const available = parentHeight - containerPadding;
      setActualAvailableHeight(available);
      if (onAvailableHeightMeasured) {
        onAvailableHeightMeasured(available);
      }
    }
  }, [pageVocabularies.length, showHeader, showFooter, onAvailableHeightMeasured]);

  const availableHeight = actualAvailableHeight || 400; // Fallback while measuring

  // Measure heights once and report back
  useEffect(() => {
    if (!onHeightsMeasured || vocabularies.length === 0) return;
    if (hasMeasured) return; // Only measure once per settings change

    const timer = setTimeout(() => {
      const heights: number[] = [];
      measureRefs.current.forEach((ref) => {
        if (ref) {
          const height = ref.getBoundingClientRect().height;
          heights.push(height);
        }
      });

      if (heights.length > 0) {
        onHeightsMeasured(heights);
        setHasMeasured(true);
      }
    }, 300); // Increased timeout to ensure all styles are applied

    return () => clearTimeout(timer);
  }, [vocabularies.length, onHeightsMeasured, hasMeasured]);

  // Reset measurement flag when settings change
  useEffect(() => {
    setHasMeasured(false);
  }, [
    vocabSettings.practiceCellSize,
    vocabSettings.showHanViet,
    vocabSettings.showVietnameseMeaning,
    vocabSettings.showEnglishMeaning,
    vocabSettings.showExampleSentence,
    vocabSettings.showExampleTranslation,
  ]);

  // Find start index of first vocabulary in pageVocabularies
  const startIndex = pageVocabularies.length > 0
    ? vocabularies.findIndex(v => v.id === pageVocabularies[0].id)
    : 0;

  return (
    <>
      {/* Hidden measurement layer - renders ALL vocabularies to measure heights */}
      {onHeightsMeasured && !hasMeasured && (
        <div
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            width: `${A4_WIDTH}px`,
            left: '-9999px',
          }}
        >
          <div
            style={{
              width: `${A4_WIDTH}px`,
              paddingTop: '20px',
              paddingBottom: '20px',
              paddingLeft: '38px', // Extra space for row numbers outside boxes (18px + 20px margin)
              paddingRight: '20px',
            }}
          >
            <div className="flex flex-col">
              {vocabularies.map((vocab, index) => (
                <div
                  key={`measure-${vocab.id}`}
                  ref={(el) => { measureRefs.current[index] = el; }}
                >
                  <VocabularyRow
                    vocabulary={vocab}
                    rowNumber={index + 1}
                    availableWidth={availableWidth}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visible layer - renders only page vocabularies */}
      <div
        ref={containerRef}
        className="vocabulary-sheet-grid"
        style={{
          width: `${A4_WIDTH}px`,
          minHeight: actualAvailableHeight > 0 ? `${actualAvailableHeight}px` : undefined,
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '38px', // Extra space for row numbers outside boxes (18px + 20px margin)
          paddingRight: '20px',
        }}
      >
        {pageVocabularies.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No vocabularies to display on this page
          </div>
        ) : (
          <VisibleVocabularyList
            pageVocabularies={pageVocabularies}
            startIndex={startIndex}
            availableWidth={availableWidth}
            availableHeight={availableHeight}
          />
        )}
      </div>
    </>
  );
}

/**
 * Calculate page breaks based on measured heights
 */
export function calculatePageBreaks(
  rowHeights: number[],
  availableHeight: number
): number[] {
  if (rowHeights.length === 0) return [0];

  const breaks: number[] = [0];
  let currentHeight = 0;
  const safetyMargin = 5; // 5px safety margin to account for rendering differences

  for (let i = 0; i < rowHeights.length; i++) {
    const rowHeight = rowHeights[i];

    // Check if adding this row would exceed available height (with safety margin)
    if (currentHeight + rowHeight > availableHeight - safetyMargin && i > breaks[breaks.length - 1]) {
      // Start new page
      breaks.push(i);
      currentHeight = rowHeight;
    } else {
      currentHeight += rowHeight;
    }
  }

  return breaks;
}

/**
 * Conservative estimate for initial pagination (before measurement)
 */
export function estimateVocabRowsPerPage(
  showHeader: boolean,
  showFooter: boolean,
  practiceCellSize: number,
  hasExampleSentences?: boolean
): number {
  const verticalMargin = 40;
  const practiceAreaHeight = practiceCellSize * 2 + 4;
  let estimatedRowHeight = practiceAreaHeight + 16;

  if (hasExampleSentences) {
    estimatedRowHeight += 60;
  } else {
    estimatedRowHeight += 20;
  }

  let availableHeight = A4_HEIGHT - verticalMargin;
  if (showHeader) availableHeight -= BOARD_HEADER_HEIGHT;
  if (showFooter) availableHeight -= BOARD_FOOTER_HEIGHT;

  const count = Math.floor(availableHeight / estimatedRowHeight);
  return Math.max(1, Math.min(count, 10));
}
