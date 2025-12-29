import { useMemo } from 'react';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { useAppSelector } from '../../app/hooks';
import { KanjiOuterTable } from './KanjiOuterTable';
import { A4_WIDTH, A4_HEIGHT, BOARD_HEADER_HEIGHT, BOARD_FOOTER_HEIGHT } from '../../constants/boardDimensions';

interface SheetGridProps {
  kanjis: KanjiData[];
  startIndex: number;
  showHeader: boolean;
  showFooter: boolean;
  explanationLineCount?: 1 | 2 | 3;
}

/**
 * SheetGrid - Layout manager for Sheet mode
 * 
 * Calculates how many OUTER-TABLEs fit per page
 * Renders only the kanjis for the current page
 * Accounts for header/footer/margins
 */
export function SheetGrid({ 
  kanjis, 
  startIndex,
  showHeader,
  showFooter,
  explanationLineCount = 3,
}: SheetGridProps) {
  const sheetColumnCount = useAppSelector(state => state.worksheet.sheetColumnCount);
  
  // Calculate dimensions (fixed, unscaled A4)
  const horizontalMargin = 40; // 20px on each side
  const verticalMargin = 40; // Top and bottom margins
  const outerTableSpacing = 16; // Space between OUTER-TABLEs
  const outerTablePadding = 16; // Padding inside OUTER-TABLE
  const explanationHeight = 20 * explanationLineCount; // Dynamic: 20px per line
  const explanationBottomMargin = 12;
  
  // Available width for OUTER-TABLEs
  const availableWidth = A4_WIDTH - horizontalMargin;
  
  // Available height (deduct header/footer)
  let availableHeight = A4_HEIGHT - verticalMargin;
  if (showHeader) availableHeight -= BOARD_HEADER_HEIGHT;
  if (showFooter) availableHeight -= BOARD_FOOTER_HEIGHT;
  
  // Calculate OUTER-TABLE height
  const outerTableHeight = useMemo(() => {
    // WritingTable dimensions
    const totalColumns = 2 + sheetColumnCount;
    const borderWidth = 1;
    const totalBorderWidth = (totalColumns + 1) * borderWidth;
    const innerWidth = availableWidth - (outerTablePadding * 2);
    const cellSize = (innerWidth - totalBorderWidth) / totalColumns;
    const writingTableHeight = cellSize * 2 + borderWidth * 3; // 2 rows + borders
    
    // Total OUTER-TABLE height
    return (
      outerTablePadding + // top padding
      explanationHeight +
      explanationBottomMargin +
      writingTableHeight +
      outerTablePadding // bottom padding
    );
  }, [sheetColumnCount, availableWidth, explanationLineCount, explanationHeight]);
  
  // Calculate how many OUTER-TABLEs fit per page
  const tablesPerPage = useMemo(() => {
    // Account for spacing between tables (but not after last one)
    const heightPerTable = outerTableHeight + outerTableSpacing;
    const count = Math.floor((availableHeight + outerTableSpacing) / heightPerTable);
    return Math.max(1, count); // At least 1 table per page
  }, [outerTableHeight, availableHeight]);
  
  // Get kanjis for current page
  const pageKanjis = useMemo(() => {
    return kanjis.slice(startIndex, startIndex + tablesPerPage);
  }, [kanjis, startIndex, tablesPerPage]);
  
  return (
    <div
      className="sheet-grid p-5"
      style={{
        width: `${A4_WIDTH}px`,
        minHeight: `${availableHeight}px`,
      }}
    >
      {pageKanjis.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No kanji to display on this page
        </div>
      ) : (
        <div 
          className="flex flex-col"
          style={{
            gap: `${outerTableSpacing}px`
          }}
        >
          {pageKanjis.map((kanji, index) => (
            <KanjiOuterTable
              key={`${kanji.kanji}-${startIndex + index}`}
              kanji={kanji}
              availableWidth={availableWidth}
              explanationLineCount={explanationLineCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Export calculation function for MainView to use
export function calculateTablesPerPage(
  sheetColumnCount: number,
  showHeader: boolean,
  showFooter: boolean,
  explanationLineCount: number
): number {
  // Match PDF layout dimensions
  const contentPadding = 20; // Horizontal padding on each side
  const verticalPadding = 10; // Vertical padding
  const outerTableSpacing = 16;
  const outerTablePadding = 16;
  const explanationHeight = 20 * explanationLineCount; // Dynamic: 20px per line
  const explanationBottomMargin = 12;
  
  const availableWidth = A4_WIDTH - (contentPadding * 2);
  
  let availableHeight = A4_HEIGHT - (verticalPadding * 2);
  if (showHeader) availableHeight -= BOARD_HEADER_HEIGHT;
  if (showFooter) availableHeight -= BOARD_FOOTER_HEIGHT;
  
  // Calculate OUTER-TABLE height
  const totalColumns = 2 + sheetColumnCount;
  const borderWidth = 1;
  const totalBorderWidth = (totalColumns + 1) * borderWidth;
  const innerWidth = availableWidth - (outerTablePadding * 2) - (2 * 2); // 2px outer table border on each side
  const cellSize = (innerWidth - totalBorderWidth) / totalColumns;
  const writingTableHeight = cellSize * 2 + borderWidth * 3;
  
  const outerTableHeight = (
    outerTablePadding +
    explanationHeight +
    explanationBottomMargin +
    writingTableHeight +
    outerTablePadding
  );
  
  const heightPerTable = outerTableHeight + outerTableSpacing;
  const count = Math.floor((availableHeight + outerTableSpacing) / heightPerTable);
  return Math.max(1, count);
}
