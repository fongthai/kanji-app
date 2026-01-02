import { View, Text, Svg, Line, Rect, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFJLPTIndicator } from './PDFJLPTIndicator';
import { PDFGradeIndicator } from './PDFGradeIndicator';
import { PDFFrequencyBadge } from './PDFFrequencyBadge';

const styles = StyleSheet.create({
  cell: {
    border: '1px solid #4b5563',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden', // Clip content that extends beyond cell boundaries
  },
});

interface PDFSheetMasterCellProps {
  kanji: KanjiData;
  cellSize: number; // Square cell
  kanjiFont: string;
  kanjiFontSize: number; // Font size in points from user settings
  hanVietFont: string;
  hanVietFontSize: number;
  hanVietOrientation: 'horizontal' | 'vertical';
  indicatorFontSize: number;
  showHanViet: boolean;
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  grayscaleMode: boolean;
}

export function PDFSheetMasterCell({
  kanji,
  cellSize,
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
  grayscaleMode,
}: PDFSheetMasterCellProps) {
  // Guide line settings
  const guideColor = '#cccccc';
  const guideStrokeWidth = 1;
  const guideDashArray = '2 2';
  const guideOpacity = 0.5;
  
  // Parse han-viet meanings (comma or slash separated)
  const hanVietMeanings = kanji.hanViet
    ? kanji.hanViet.split(/[,/]/).map(m => m.trim()).filter(m => m.length > 0)
    : [];

  // Determine layout: 1-2 meanings on sides, 3rd+ at bottom center
  const topMeanings = hanVietMeanings.slice(0, 2);
  const bottomMeanings = hanVietMeanings.slice(2); // All meanings from 3rd onward

  // Helper to render a single meaning vertically
  const renderVerticalMeaning = (meaning: string) => {
    const chars = meaning.split('');
    return chars.map((char, idx) => (
      <Text key={idx} style={{
        fontSize: hanVietFontSize,
        fontFamily: hanVietFont,
        color: grayscaleMode ? '#000000' : '#9ca3af',
        lineHeight: hanVietFontSize * 1.3,
        letterSpacing: hanVietFontSize * 0.05,
        textAlign: 'center',
      }}>
        {char}
      </Text>
    ));
  };
  
  return (
    <View style={[styles.cell, { width: cellSize, height: cellSize }]}>
      {/* JLPT Indicator */}
      {showJlptIndicator && kanji.jlptLevel && (
        <PDFJLPTIndicator level={kanji.jlptLevel} size={indicatorFontSize} grayscaleMode={grayscaleMode} />
      )}
      
      {/* Grade Indicator */}
      {showGradeIndicator && kanji.gradeLevel && (
        <PDFGradeIndicator gradeLevel={kanji.gradeLevel} size={indicatorFontSize} grayscaleMode={grayscaleMode} />
      )}
      
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
          opacity={guideOpacity}
        />
        
        {/* Horizontal center line */}
        <Line
          x1={0}
          y1={cellSize / 2 - 1}
          x2={cellSize}
          y2={cellSize / 2 - 1}
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={guideOpacity}
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
          opacity={guideOpacity}
        />
      </Svg>
      
      {/* Kanji character - centered using manual positioning without flexbox */}
      <Text
        style={{
          position: 'absolute',
          top: (cellSize - kanjiFontSize) / 2 - kanjiFontSize * 0.18,
          left: (cellSize - kanjiFontSize) / 2,
          fontSize: kanjiFontSize,
          fontFamily: kanjiFont,
          textAlign: 'center',
          width: kanjiFontSize,
        }}
      >
        {kanji.kanji}
      </Text>
      
      {/* Han-Viet Readings */}
      {showHanViet && hanVietOrientation === 'vertical' && (
        <>
          {/* First meaning - right side */}
          {topMeanings[0] && (
            <View style={{
              position: 'absolute',
              right: 3,
              top: cellSize * 0.25,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              maxHeight: cellSize * 0.5,
            }}>
              {renderVerticalMeaning(topMeanings[0])}
            </View>
          )}
          
          {/* Second meaning - left side */}
          {topMeanings[1] && (
            <View style={{
              position: 'absolute',
              left: 3,
              top: cellSize * 0.25,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              maxHeight: cellSize * 0.5,
            }}>
              {renderVerticalMeaning(topMeanings[1])}
            </View>
          )}
          
          {/* Third+ meanings - bottom center */}
          {bottomMeanings.length > 0 && (
            <View style={{
              position: 'absolute',
              bottom: 3,
              left: 0,
              right: 0,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              {renderVerticalMeaning(bottomMeanings.join(', '))}
            </View>
          )}
        </>
      )}
      
      {showHanViet && hanVietOrientation === 'horizontal' && hanVietMeanings.length > 0 && (
        // Horizontal mode: all meanings at center-bottom, comma-separated
        <View style={{
          position: 'absolute',
          bottom: 3,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: hanVietFontSize,
            fontFamily: hanVietFont,
            color: grayscaleMode ? '#000000' : '#9ca3af',
          }}>
            {hanVietMeanings.join(', ')}
          </Text>
        </View>
      )}
      
      {/* Frequency Badge */}
      {showFrequencyIndicator && kanji.frequency && (
        <PDFFrequencyBadge 
          frequency={kanji.frequency} 
          size={indicatorFontSize} 
          orientation={hanVietOrientation}
          grayscaleMode={grayscaleMode}
        />
      )}
    </View>
  );
}
