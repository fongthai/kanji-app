import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFJLPTIndicator } from './PDFJLPTIndicator';
import { PDFGradeIndicator } from './PDFGradeIndicator';
import { PDFFrequencyBadge } from './PDFFrequencyBadge';
import { getKanjiColorByJlptLevel } from '../../constants/indicators';

interface PDFKanjiCardProps {
  kanji: KanjiData;
  cellSize: number;
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
  grayscaleMode: boolean;
}

export const PDFKanjiCard: React.FC<PDFKanjiCardProps> = ({ 
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
}) => {
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
      <Text key={idx} style={styles.hanVietVerticalChar}>
        {char}
      </Text>
    ));
  };

  const styles = StyleSheet.create({
    card: {
      width: cellSize,
      height: cellSize,
      border: '2pt solid #333',
      borderRadius: 4,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden', // Clip content that extends beyond card boundaries
    },
    kanji: {
      fontSize: kanjiFontSize,
      fontFamily: kanjiFont,
      textAlign: 'center',
      color: grayscaleMode ? '#000000' : getKanjiColorByJlptLevel(kanji.jlptLevel),
    },
    // First meaning - right side
    hanVietRight: {
      position: 'absolute',
      right: 3, // Fixed distance from edge
      top: cellSize * 0.25,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Don't stretch - start from top
      maxHeight: cellSize * 0.5,
    },
    // Second meaning - left side
    hanVietLeft: {
      position: 'absolute',
      left: 3, // Fixed distance from edge
      top: cellSize * 0.25,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Don't stretch - start from top
      maxHeight: cellSize * 0.5,
    },
    // Third meaning - bottom center (vertical mode only)
    hanVietBottom: {
      position: 'absolute',
      bottom: 3, // Fixed distance from edge
      left: 0,
      right: 0,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Don't stretch - start from top
    },
    // All meanings - bottom center (horizontal mode)
    hanVietHorizontalContainer: {
      position: 'absolute',
      bottom: 3, // Fixed distance from edge
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    hanVietHorizontalText: {
      fontSize: hanVietFontSize,
      fontFamily: hanVietFont,
      color: grayscaleMode ? '#000000' : '#9ca3af',
    },
    hanVietVerticalChar: {
      fontSize: hanVietFontSize,
      fontFamily: hanVietFont,
      color: grayscaleMode ? '#000000' : '#9ca3af',
      lineHeight: hanVietFontSize * 1.3, // Match screen lineHeight 1.3
      letterSpacing: hanVietFontSize * 0.05, // Match screen letterSpacing 0.05em
      textAlign: 'center',
    },
  });
  
  return (
    <View style={styles.card}>
      {/* JLPT Indicator */}
      {showJlptIndicator && kanji.jlptLevel && (
        <PDFJLPTIndicator level={kanji.jlptLevel} size={indicatorFontSize} grayscaleMode={grayscaleMode} />
      )}
      
      {/* Grade Indicator */}
      {showGradeIndicator && kanji.gradeLevel && (
        <PDFGradeIndicator gradeLevel={kanji.gradeLevel} size={indicatorFontSize} grayscaleMode={grayscaleMode} />
      )}
      
      {/* Main Kanji */}
      <Text style={styles.kanji}>{kanji.kanji}</Text>
      
      {/* Han-Viet Readings */}
      {showHanViet && hanVietOrientation === 'vertical' && (
        <>
          {/* First meaning - right side */}
          {topMeanings[0] && (
            <View style={styles.hanVietRight}>
              {renderVerticalMeaning(topMeanings[0])}
            </View>
          )}
          
          {/* Second meaning - left side */}
          {topMeanings[1] && (
            <View style={styles.hanVietLeft}>
              {renderVerticalMeaning(topMeanings[1])}
            </View>
          )}
          
          {/* Third+ meanings - bottom center */}
          {bottomMeanings.length > 0 && (
            <View style={styles.hanVietBottom}>
              {renderVerticalMeaning(bottomMeanings.join(', '))}
            </View>
          )}
        </>
      )}
      
      {showHanViet && hanVietOrientation === 'horizontal' && hanVietMeanings.length > 0 && (
        // Horizontal mode: all meanings at center-bottom, comma-separated
        // Note: React-PDF/PDFKit applies text justification at font rendering level (known limitation)
        <View style={styles.hanVietHorizontalContainer}>
          <Text style={styles.hanVietHorizontalText}>
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
};

