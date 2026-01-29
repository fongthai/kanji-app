import React, { useMemo } from 'react';
import { type KanjiData } from '../../features/kanji/kanjiSlice';
import { useAppSelector } from '../../app/hooks';
import { ExplanationText } from './ExplanationText';
import { WritingTable } from './WritingTable';
import { KanjiVocabularySection } from './KanjiVocabularySection';

interface KanjiOuterTableProps {
  kanji: KanjiData;
  availableWidth: number; // Available width (A4 width minus margins)
  className?: string;
  explanationLineCount?: 1 | 2 | 3;
}

/**
 * KanjiOuterTable - Wrapper for one kanji's complete practice section
 *
 * Structure:
 * ┌─────────────────────────────────────────────────┐ OUTER-TABLE
 * │ EXPLANATION-TEXT (full width, max 3 lines)      │
 * │ Line 1: KANJI | JLPT | HAN-VIET | ONY | KUN | COMP
 * │ Line 2: ENGLISH-MEANING | VIETNAMESE-MEANING
 * │ Line 3: VIET-MNEMONICS
 * ├────────────────────────────┬────────────────────┤
 * │ PRACTICE TABLE (60%)       │ VOCABULARY (40%)   │
 * │ ┌──────┬────┬────┐        │ [Component]        │
 * │ │      │ P1 │ P2 │        │                    │
 * │ │MASTER├────┼────┤        │ - Modular          │
 * │ │ 2×2  │ P3 │ P4 │        │ - Easy to expand   │
 * │ └──────┴────┴────┘        │                    │
 * └────────────────────────────┴────────────────────┘
 *
 * Features:
 * - Self-contained practice unit per kanji
 * - Explanation text above writing table (full width)
 * - 60/40 split: Practice table left, vocabulary placeholder right
 * - Proper padding and spacing
 * - Does not overflow available width
 */
export const KanjiOuterTable: React.FC<KanjiOuterTableProps> = ({
  kanji,
  availableWidth,
  className = '',
  explanationLineCount = 3,
}) => {
  const sheetColumnCount = useAppSelector(state => state.worksheet.sheetColumnCount);

  const outerPadding = 16; // 16px padding inside OUTER-TABLE
  const explanationBottomMargin = 12; // Space between explanation and writing table

  // Calculate available width for inner components
  const innerWidth = availableWidth - (outerPadding * 2);

  // Calculate 60/40 split widths with gap
  const { practiceWidth, vocabWidth, writingTableHeight, vocabHeight } = useMemo(() => {
    const gap = 16; // Gap between practice and vocabulary sections
    const practiceWidthCalc = Math.floor((innerWidth - gap) * 0.6);
    const vocabWidthCalc = innerWidth - practiceWidthCalc - gap;

    // Calculate WritingTable height for consistent sizing
    const totalColumns = 2 + sheetColumnCount;
    const borderWidth = 1;
    const totalBorderWidth = (totalColumns + 1) * borderWidth;
    const cellSize = (practiceWidthCalc - totalBorderWidth) / totalColumns;
    const heightCalc = cellSize * 2 + borderWidth * 3;

    // Vocabulary section has its own border (1px top + 1px bottom = 2px)
    // Subtract 2px to match the WritingTable height exactly
    const vocabHeightCalc = heightCalc - 2;

    return {
      practiceWidth: practiceWidthCalc,
      vocabWidth: vocabWidthCalc,
      writingTableHeight: heightCalc,
      vocabHeight: vocabHeightCalc,
    };
  }, [innerWidth, sheetColumnCount]);

  return (
    <div
      className={`kanji-outer-table border-2 border-gray-300 bg-gray-50 ${className}`}
      style={{
        width: `${availableWidth}px`,
        padding: `${outerPadding}px`,
      }}
    >
      {/* EXPLANATION-TEXT (full width) */}
      <div style={{ marginBottom: `${explanationBottomMargin}px` }}>
        <ExplanationText
          kanji={kanji}
          maxWidth={innerWidth}
          lineCount={explanationLineCount}
        />
      </div>

      {/* 60/40 SPLIT LAYOUT */}
      <div className="flex" style={{ gap: '16px' }}>
        {/* Practice section (60%) */}
        <div style={{ width: `${practiceWidth}px` }}>
          <WritingTable
            kanji={kanji}
            availableWidth={practiceWidth}
          />
        </div>

        {/* Vocabulary section (40%) */}
        <KanjiVocabularySection
          kanji={kanji}
          availableWidth={vocabWidth}
          availableHeight={vocabHeight}
        />
      </div>
    </div>
  );
};
