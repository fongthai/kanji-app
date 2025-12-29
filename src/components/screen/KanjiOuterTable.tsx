import React from 'react';
import { type KanjiData } from '../../features/kanji/kanjiSlice';
import { ExplanationText } from './ExplanationText';
import { WritingTable } from './WritingTable';

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
 * ┌─────────────────────────────────────┐ OUTER-TABLE
 * │ EXPLANATION-TEXT (max 3 lines)      │
 * │ Line 1: KANJI | JLPT | HAN-VIET | ONY | KUN | COMP
 * │ Line 2: ENGLISH-MEANING | VIETNAMESE-MEANING
 * │ Line 3: VIET-MNEMONICS
 * ├──────────┬─────┬─────┬─────┬─────┬─┤ WRITING-TABLE
 * │          │ P1  │ P2  │ P3  │ P4  │ │
 * │  MASTER  ├─────┼─────┼─────┼─────┤ │
 * │  (2×2)   │ P5  │ P6  │ P7  │ P8  │ │
 * └──────────┴─────┴─────┴─────┴─────┴─┘
 * 
 * Features:
 * - Self-contained practice unit per kanji
 * - Explanation text above writing table
 * - Proper padding and spacing
 * - Does not overflow available width
 */
export const KanjiOuterTable: React.FC<KanjiOuterTableProps> = ({
  kanji,
  availableWidth,
  className = '',
  explanationLineCount = 3,
}) => {
  const outerPadding = 16; // 16px padding inside OUTER-TABLE
  const explanationBottomMargin = 12; // Space between explanation and writing table
  
  // Calculate available width for inner components
  const innerWidth = availableWidth - (outerPadding * 2);
  
  return (
    <div
      className={`kanji-outer-table border-2 border-gray-300 bg-gray-50 ${className}`}
      style={{
        width: `${availableWidth}px`,
        padding: `${outerPadding}px`,
      }}
    >
      {/* EXPLANATION-TEXT */}
      <div style={{ marginBottom: `${explanationBottomMargin}px` }}>
        <ExplanationText
          kanji={kanji}
          maxWidth={innerWidth}
          lineCount={explanationLineCount}
        />
      </div>
      
      {/* WRITING-TABLE */}
      <WritingTable
        kanji={kanji}
        availableWidth={innerWidth}
      />
    </div>
  );
};
