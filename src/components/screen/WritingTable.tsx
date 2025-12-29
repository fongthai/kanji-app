import React from 'react';
import { type KanjiData } from '../../features/kanji/kanjiSlice';
import { useAppSelector } from '../../app/hooks';
import { MasterCell } from './MasterCell';
import { PracticeCell } from './PracticeCell';

interface WritingTableProps {
  kanji: KanjiData;
  availableWidth: number; // Available width for the table (minus padding)
  className?: string;
}

/**
 * WritingTable - Grid layout for Sheet mode kanji practice
 * 
 * Layout:
 * ┌──────────┬─────┬─────┬─────┬─────┐
 * │          │ P1  │ P2  │ P3  │ P4  │  ← Row 1 (sheetColumnCount cells)
 * │  MASTER  ├─────┼─────┼─────┼─────┤
 * │  (2×2)   │ P5  │ P6  │ P7  │ P8  │  ← Row 2 (sheetColumnCount cells)
 * └──────────┴─────┴─────┴─────┴─────┘
 *    2 cols    sheetColumnCount (4-10)
 * 
 * Features:
 * - Master cell occupies first 2 columns × 2 rows
 * - Practice cells are square (width === height)
 * - First 3 practice cells (P1-P3) have guiding kanji with fading opacity
 * - Remaining cells have only guide lines
 * - Grid uses CSS Grid for precise layout
 */
export const WritingTable: React.FC<WritingTableProps> = ({
  kanji,
  availableWidth,
  className = '',
}) => {
  const sheetColumnCount = useAppSelector(state => state.worksheet.sheetColumnCount);
  const sheetGuideOpacity = useAppSelector(state => state.worksheet.sheetGuideOpacity);
  const sheetTracingOpacity = useAppSelector(state => state.worksheet.sheetTracingOpacity);
  const sheetPanel = useAppSelector(state => state.displaySettings.sheetPanel);
  
  // Calculate cell size (must be square)
  // Total columns: 2 (master) + sheetColumnCount (practice)
  // Account for borders (1px per cell)
  const totalColumns = 2 + sheetColumnCount;
  const borderWidth = 1; // pixels
  const totalBorderWidth = (totalColumns + 1) * borderWidth;
  const cellSize = (availableWidth - totalBorderWidth) / totalColumns;
  
  // Master cell dimensions (2× practice cell)
  const masterCellWidth = cellSize * 2 + borderWidth;
  const masterCellHeight = cellSize * 2 + borderWidth;
  
  // Calculate master kanji font size based on cell size
  // Use 80% of master cell width as base, then apply sheetPanel.kanjiSize percentage
  const masterKanjiFontSize = (masterCellWidth * 0.8) / 16; // Convert px to rem (assuming 16px = 1rem)
  
  // Generate practice cells array
  // Total: sheetColumnCount × 2 rows
  const totalPracticeCells = sheetColumnCount * 2;
  const practiceCells = Array.from({ length: totalPracticeCells }, (_, index) => {
    const cellNumber = index + 1;
    const isTracingCell = cellNumber <= 3; // P1, P2, P3
    const tracingOpacity = isTracingCell ? sheetTracingOpacity[cellNumber - 1] : 0;
    
    return {
      key: `practice-${cellNumber}`,
      guidingKanji: isTracingCell ? kanji.kanji : undefined,
      tracingOpacity,
    };
  });
  
  return (
    <div
      className={`writing-table inline-grid gap-0 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${totalColumns}, ${cellSize}px)`,
        gridTemplateRows: `repeat(2, ${cellSize}px)`,
      }}
    >
      {/* Master Cell (spans 2×2) */}
      <MasterCell
        kanji={kanji}
        cellWidth={masterCellWidth}
        cellHeight={masterCellHeight}
        kanjiFontSize={masterKanjiFontSize}
      />
      
      {/* Practice Cells */}
      {practiceCells.map(({ key, guidingKanji, tracingOpacity }) => (
        <PracticeCell
          key={key}
          cellSize={cellSize}
          guidingKanji={guidingKanji}
          tracingOpacity={tracingOpacity}
          guideOpacity={sheetGuideOpacity}
          kanjiFont={sheetPanel.kanjiFont}
          kanjiSize={sheetPanel.kanjiSize}
        />
      ))}
    </div>
  );
};
