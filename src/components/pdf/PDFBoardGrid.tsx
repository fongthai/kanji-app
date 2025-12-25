import { View, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFKanjiCard } from './PDFKanjiCard';

interface PDFBoardGridProps {
  kanjis: KanjiData[];
  columnCount: number;
  cellSize: number;
  gap: number;
  kanjiFont: string;
  kanjiFontSize: number;
  hanVietFont: string;
  hanVietFontSize: number;
  hanVietOrientation: 'horizontal' | 'vertical';
  indicatorFontSize: number;
  showHanViet: boolean;
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  showEmptyCells: boolean;
  centerCards: boolean;
  availableHeight: number; // Add this to calculate centering
}

export const PDFBoardGrid: React.FC<PDFBoardGridProps> = ({ 
  kanjis, 
  columnCount,
  cellSize, 
  gap, 
  kanjiFont,
  kanjiFontSize, 
  hanVietFont,
  hanVietFontSize,
  hanVietOrientation,
  indicatorFontSize,
  showHanViet,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  showEmptyCells,
  availableHeight,
  // centerCards - not used, grid is conditionally centered based on space
}) => {
  // Calculate actual row count based on kanji count
  const actualRowCount = showEmptyCells 
    ? Math.ceil(kanjis.length / columnCount) 
    : Math.ceil(kanjis.length / columnCount);
  
  const totalCells = showEmptyCells 
    ? actualRowCount * columnCount 
    : kanjis.length;
  
  // Create cells array (kanji or null for empty)
  let cells: (KanjiData | null)[] = [...kanjis];
  
  if (showEmptyCells) {
    const emptyCellsCount = totalCells - kanjis.length;
    cells = [...kanjis, ...Array(emptyCellsCount).fill(null)];
  }
  
  // Calculate grid height and remaining space
  const gridHeight = actualRowCount * cellSize + (actualRowCount - 1) * gap;
  const remainingSpace = availableHeight - gridHeight;
  
  // Only center if remaining space is less than 50px
  const shouldCenter = remainingSpace < 70;
  const topPadding = shouldCenter ? Math.floor(remainingSpace / 2) : 0;
  
  // Calculate exact grid width to ensure proper column wrapping
  const gridWidth = columnCount * cellSize + (columnCount - 1) * gap;
  
  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gap,
      paddingTop: topPadding,
      width: gridWidth,
    },
    emptyCell: {
      width: cellSize,
      height: cellSize,
      border: '1pt dashed #ccc',
    },
  });
  
  return (
    <View style={styles.grid}>
      {cells.map((kanji, index) => {
        if (!kanji) {
          return <View key={`empty-${index}`} style={styles.emptyCell} />;
        }
        
        return (
          <PDFKanjiCard
            key={kanji.id || `${kanji.kanji}-${index}`}
            kanji={kanji}
            cellSize={cellSize}
            kanjiFont={kanjiFont}
            kanjiFontSize={kanjiFontSize}
            hanVietFont={hanVietFont}
            hanVietFontSize={hanVietFontSize}
            hanVietOrientation={hanVietOrientation}
            indicatorFontSize={indicatorFontSize}
            showHanViet={showHanViet}
            showJlptIndicator={showJlptIndicator}
            showGradeIndicator={showGradeIndicator}
            showFrequencyIndicator={showFrequencyIndicator}
          />
        );
      })}
    </View>
  );
};
