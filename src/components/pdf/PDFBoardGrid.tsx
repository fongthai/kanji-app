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
  centerCards,
}) => {
  // Calculate total cells
  const rowCount = Math.ceil(kanjis.length / columnCount);
  const totalCells = rowCount * columnCount;
  
  // Create cells array (kanji or null for empty)
  let cells: (KanjiData | null)[] = [...kanjis];
  
  if (showEmptyCells) {
    const emptyCellsCount = totalCells - kanjis.length;
    cells = [...kanjis, ...Array(emptyCellsCount).fill(null)];
  }
  
  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gap,
      justifyContent: centerCards && kanjis.length < totalCells ? 'center' : 'flex-start',
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
