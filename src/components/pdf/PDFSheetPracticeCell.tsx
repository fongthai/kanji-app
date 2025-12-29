import { View, Text, Svg, Line, Rect, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  cell: {
    border: '1px solid #9ca3af',
    backgroundColor: '#ffffff',
    position: 'relative',
    // overflow: 'hidden' removed to allow guiding kanji to be visible even when scaled to 110%
  },
});

interface PDFSheetPracticeCellProps {
  cellSize: number;
  guidingKanji?: string;
  guidingFontSize: number; // Font size for guiding kanji (calculated from user's settings)
  tracingOpacity: number;
  guideOpacity: number[];
  kanjiFont: string;
}

export function PDFSheetPracticeCell({
  cellSize,
  guidingKanji,
  guidingFontSize,
  tracingOpacity,
  guideOpacity,
  kanjiFont,
}: PDFSheetPracticeCellProps) {
  // Calculate centered position manually (font baseline is different from top)
  // Center kanji: subtract 18% of font size from top to account for font baseline
  const kanjiTop = (cellSize - guidingFontSize) / 2 - guidingFontSize * 0.18;
  const kanjiLeft = (cellSize - guidingFontSize) / 2;
  
  // Guide line settings
  const guideColor = '#cccccc';
  const guideStrokeWidth = 1;
  const guideDashArray = '2 2';
  const avgGuideOpacity = guideOpacity.reduce((a, b) => a + b, 0) / guideOpacity.length / 100;
  
  return (
    <View style={[styles.cell, { width: cellSize, height: cellSize }]}>
      {/* Guide lines */}
      <Svg
        width={cellSize}
        height={cellSize}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Vertical center line */}
        <Line
          x1={cellSize / 2}
          y1={0}
          x2={cellSize / 2}
          y2={cellSize}
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={avgGuideOpacity}
        />
        
        {/* Horizontal center line */}
        <Line
          x1={0}
          y1={cellSize / 2}
          x2={cellSize}
          y2={cellSize / 2}
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={avgGuideOpacity}
        />
        
        {/* Center square (1/2 cell size) */}
        <Rect
          x={cellSize * 0.25}
          y={cellSize * 0.25}
          width={cellSize * 0.5}
          height={cellSize * 0.5}
          fill="none"
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={avgGuideOpacity}
        />
      </Svg>
      
      {/* Guiding kanji (if any) - centered manually without transform */}
      {guidingKanji && (
        <Text
          style={{
            position: 'absolute',
            top: kanjiTop,
            left: kanjiLeft,
            fontSize: guidingFontSize,
            fontFamily: kanjiFont,
            opacity: tracingOpacity / 100,
            color: '#000000',
            textAlign: 'center',
            width: guidingFontSize,
          }}
        >
          {guidingKanji}
        </Text>
      )}
    </View>
  );
}
