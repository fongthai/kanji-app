import { KanjiCard } from './KanjiCard';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { removeKanji } from '../../features/kanji/kanjiSlice';
import { A4_WIDTH, A4_HEIGHT, BOARD_HEADER_HEIGHT, BOARD_FOOTER_HEIGHT, GRID_GAP } from '../../constants/boardDimensions';
import { getKanjiColorByJlptLevel } from '../../constants/indicators';

interface BoardGridProps {
  kanjis: KanjiData[];
  startIndex: number;
  columnCount: number;
  emptyCellsMode: 'hide' | 'page' | 'row';
  grayscaleMode: boolean;
  showHeader: boolean;
  showFooter: boolean;
}

export function BoardGrid({ 
  kanjis, 
  startIndex, 
  columnCount,
  emptyCellsMode,
  grayscaleMode,
  showHeader,
  showFooter
}: BoardGridProps) {
  const dispatch = useAppDispatch();
  const mainDisplaySettings = useAppSelector((state) => state.displaySettings.mainPanel);
  
  // Section color mapping (must match sectionName format: "n1-A-org", "n5-org", etc.)
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
  
  // Calculate fixed dimensions based on unscaled A4 page
  // This ensures consistent kanji-per-page regardless of viewport/scaling
  const availableWidth = A4_WIDTH;
  
  // Base height is full A4 content area, minus header/footer
  let availableHeight = A4_HEIGHT;
  if (showHeader) availableHeight -= BOARD_HEADER_HEIGHT;
  if (showFooter) availableHeight -= BOARD_FOOTER_HEIGHT;
  
  // Account for container padding (pt-1 = 4px)
  availableHeight -= 4;
  
  // Calculate cell size based on available width and column count
  const cellSize = Math.floor((availableWidth - (columnCount - 1) * GRID_GAP) / columnCount);
  
  // Calculate how many rows fit in available height
  // Formula: We fit as many (cellSize + gap) units as possible, but the last row has no gap after it
  // So: rowCount * cellSize + (rowCount - 1) * gap <= availableHeight
  // Simplified: rowCount * (cellSize + gap) - gap <= availableHeight
  // Therefore: rowCount <= (availableHeight + gap) / (cellSize + gap)
  const rowCount = Math.floor((availableHeight + GRID_GAP) / (cellSize + GRID_GAP));

  // Calculate base kanji font size: 75% of cell size (in px)
  const baseKanjiFontSizePx = cellSize * 0.75;
  
  // Apply Main Panel slider as percentage (60% - 120%)
  const kanjiSizePercentage = Math.max(60, Math.min(120, mainDisplaySettings.kanjiSize)); // Clamp 60-120
  const kanjiFontSizePx = baseKanjiFontSizePx * (kanjiSizePercentage / 100);
  
  // Convert to rem for KanjiCard
  const kanjiFontSize = kanjiFontSizePx / 16;
  
  // Indicator and Han-viet: 20% of base kanji size
  // Both controlled by Surround-Text slider (60% - 120%)
  const baseIndicatorSizePx = baseKanjiFontSizePx * 0.20;
  const hanVietSizePercentage = Math.max(60, Math.min(120, mainDisplaySettings.hanVietSize)); // Clamp 60-120
  const indicatorFontSizePx = baseIndicatorSizePx * (hanVietSizePercentage / 100);
  const indicatorFontSize = indicatorFontSizePx / 16;
  
  // Han-viet uses same size as indicator
  const hanVietFontSize = indicatorFontSize;
  
  const cardsPerPage = rowCount * columnCount;
  
  // Get kanjis for this page
  const pageKanjis = kanjis.slice(startIndex, startIndex + cardsPerPage);
  
  // Calculate total cells based on empty cells mode
  let totalCells: number;
  if (emptyCellsMode === 'hide') {
    totalCells = pageKanjis.length; // Only show actual kanjis
  } else if (emptyCellsMode === 'page') {
    totalCells = cardsPerPage; // Fill entire page
  } else { // 'row'
    // Fill until the end of the row containing the last kanji
    const lastKanjiRow = Math.ceil(pageKanjis.length / columnCount);
    totalCells = lastKanjiRow * columnCount;
  }
  
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const kanji = pageKanjis[index];
    return kanji || null;
  });
  
  // Handle double-click to remove kanji from chosen list
  const handleRemoveKanji = (kanji: KanjiData) => {
    dispatch(removeKanji(kanji.kanji));
  };

  return (
    <div 
      className="grid h-full"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, ${cellSize}px)`,
        gap: `${GRID_GAP}px`,
        gridTemplateRows: `repeat(${rowCount}, ${cellSize}px)`,
        alignContent: 'start',
      }}
    >
      {cells.map((kanji, index) => {
        if (!kanji) {
          return (
            <div
              key={`empty-${index}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
              className="border-2 border-dashed border-gray-300 rounded"
            />
          );
        }
        
        // Get kanji text color from JLPT level (matches badge color)
        const kanjiTextColor = getKanjiColorByJlptLevel(kanji.jlptLevel);
        
        // In grayscale mode, use black, otherwise use JLPT badge color
        const finalTextColor = grayscaleMode ? '#000000' : kanjiTextColor;
        
        return (
          <div
            key={`${kanji.kanji}-${index}`}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
            }}
          >
            <KanjiCard
              variant="board"
              kanji={kanji}
              colors={{ 
                body: '#ffffff',
                border: '#000000',
                text: finalTextColor 
              }}
              kanjiFont={mainDisplaySettings.kanjiFont}
              kanjiSize={kanjiFontSize}
              hanVietFont={mainDisplaySettings.hanVietFont}
              hanVietSize={hanVietFontSize}
              onDoubleClick={() => handleRemoveKanji(kanji)}
            />
          </div>
        );
      })}
    </div>
  );
}
