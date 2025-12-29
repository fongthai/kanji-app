import { View } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFSheetMasterCell } from './PDFSheetMasterCell';
import { PDFSheetPracticeCell } from './PDFSheetPracticeCell';

interface PDFWritingTableProps {
  kanji: KanjiData;
  availableWidth: number;
  sheetColumnCount: number;
  kanjiFont: string;
  kanjiFontSizeMultiplier: number; // User's size percentage as multiplier (0.7-1.1)
  hanVietFont: string;
  hanVietFontSizeRatio: number; // Ratio to cell size
  hanVietOrientation: 'horizontal' | 'vertical';
  indicatorFontSizeRatio: number; // Ratio to cell size
  showHanViet: boolean;
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  sheetGuideOpacity: number[];
  sheetTracingOpacity: number[];
}

export function PDFWritingTable({
  kanji,
  availableWidth,
  sheetColumnCount,
  kanjiFont,
  kanjiFontSizeMultiplier,
  hanVietFont,
  hanVietFontSizeRatio,
  hanVietOrientation,
  indicatorFontSizeRatio,
  showHanViet,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  sheetGuideOpacity,
  sheetTracingOpacity,
}: PDFWritingTableProps) {
  // Use Board mode approach: borders are INSIDE cell dimensions
  // Total columns = 2 (master takes 2 columns) + practice columns
  const totalColumns = 2 + sheetColumnCount;
  
  // Calculate cell size (borders will be inside)
  // No need to account for borders in width calculation - they're inside the cells
  const cellSize = Math.floor(availableWidth / totalColumns);
  
  // Master cell is 2×2 cells
  const masterCellSize = cellSize * 2;
  
  // Calculate practice cell size accounting for 2px gaps between columns
  // Available width for practice area = availableWidth - masterCellSize - 2 (right shift)
  // Need to fit: sheetColumnCount cells + (sheetColumnCount - 1) gaps
  const practiceAreaWidth = availableWidth - masterCellSize - 2;
  const totalGaps = (sheetColumnCount - 1) * 2; // 2px gap between each column
  const practiceCellSize = Math.floor((practiceAreaWidth - totalGaps) / sheetColumnCount);
  
  // Calculate actual font sizes based on master cell size
  // Base kanji size is 60% of master cell, then scaled by user's multiplier
  const baseKanjiFontSize = masterCellSize * 0.8;
  const kanjiFontSize = baseKanjiFontSize * kanjiFontSizeMultiplier;
  const indicatorFontSize = masterCellSize * indicatorFontSizeRatio;
  const hanVietFontSize = masterCellSize * hanVietFontSizeRatio;
  
  // Calculate guiding kanji font size for practice cells (70% of practice cell, scaled by user's multiplier)
  // Balanced ratio between size and overflow prevention (77% at 110%)
  const basePracticeKanjiFontSize = practiceCellSize * 0.8;
  const practiceKanjiFontSize = basePracticeKanjiFontSize * kanjiFontSizeMultiplier;
  

  // Generate practice cells (sheetColumnCount × 2 rows)
  const totalPracticeCells = sheetColumnCount * 2;
  const practiceCells = Array.from({ length: totalPracticeCells }, (_, index) => {
    const cellNumber = index + 1;
    const isTracingCell = cellNumber <= 3; // P1, P2, P3
    const tracingOpacity = isTracingCell ? sheetTracingOpacity[cellNumber - 1] : 0;
    
    return {
      key: `practice-${cellNumber}`,
      guidingKanji: isTracingCell ? kanji.kanji : undefined,
      tracingOpacity,
      row: Math.floor(index / sheetColumnCount),
      col: index % sheetColumnCount,
    };
  });
  
  // Layout structure: 2 rows, master cell spans both rows
  const row1PracticeCells = practiceCells.filter(cell => cell.row === 0);
  const row2PracticeCells = practiceCells.filter(cell => cell.row === 1);
  
  return (
    <View style={{ position: 'relative', height: masterCellSize }}>
      {/* Master Cell */}
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <PDFSheetMasterCell
          kanji={kanji}
          cellSize={masterCellSize}
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
      </View>
      
      {/* Row 1 - shifted right by 2px, starts at top, with 2px gaps between columns */}
      <View style={{ display: 'flex', flexDirection: 'row', position: 'absolute', top: 0, left: masterCellSize + 2, gap: 2 }}>
        {row1PracticeCells.map(({ key, guidingKanji, tracingOpacity }) => (
          <PDFSheetPracticeCell
            key={key}
            cellSize={practiceCellSize}
            guidingKanji={guidingKanji}
            guidingFontSize={practiceKanjiFontSize}
            tracingOpacity={tracingOpacity}
            guideOpacity={sheetGuideOpacity}
            kanjiFont={kanjiFont}
          />
        ))}
      </View>
      
      {/* Row 2 - shifted right by 2px, positioned at cellSize + 2, with 2px gaps between columns */}
      <View style={{ display: 'flex', flexDirection: 'row', position: 'absolute', top: cellSize + 2, left: masterCellSize + 2, gap: 2 }}>
        {row2PracticeCells.map(({ key, guidingKanji, tracingOpacity }) => (
          <PDFSheetPracticeCell
            key={key}
            cellSize={practiceCellSize}
            guidingKanji={guidingKanji}
            guidingFontSize={practiceKanjiFontSize}
            tracingOpacity={tracingOpacity}
            guideOpacity={sheetGuideOpacity}
            kanjiFont={kanjiFont}
          />
        ))}
      </View>
    </View>
  );
}
