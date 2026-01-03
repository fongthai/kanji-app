import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFJLPTIndicator } from './PDFJLPTIndicator';
import { PDFGradeIndicator } from './PDFGradeIndicator';
import { PDFFrequencyBadge } from './PDFFrequencyBadge';
import { getKanjiColorByJlptLevel } from '../../constants/indicators';
import { PDF_CARD_BORDER_TOTAL } from '../../constants/pdfDimensions';

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

  // Calculate actual card content size (border adds to total box size)
  const actualCardSize = cellSize - PDF_CARD_BORDER_TOTAL;

  // Calculate precise vertical centering using absolute positioning
  // With lineHeight: 1, text element height equals fontSize
  // However, the visual glyph sits lower due to font baseline metrics
  // Apply correction factor to move text element up for visual centering
  const cardCenterY = actualCardSize / 2;
  const baselineCorrection = kanjiFontSize * 0.2; // ~20% upward shift for CJK fonts
  const kanjiTop = cardCenterY - (kanjiFontSize / 2) - baselineCorrection;

  console.log(`PDFKanjiCard [${kanji.kanji}]:`, {
    cellSize,
    actualCardSize,
    kanjiFontSize,
    hanVietFontSize,
    cardCenterY: cardCenterY.toFixed(2) + 'pt',
    baselineCorrection: baselineCorrection.toFixed(2) + 'pt',
    kanjiTop: kanjiTop.toFixed(2) + 'pt',
    'hanViet raw': kanji.hanViet,
    topMeanings: JSON.stringify(topMeanings),
    bottomMeanings: JSON.stringify(bottomMeanings),
    'kanji % of card': ((kanjiFontSize / actualCardSize) * 100).toFixed(1) + '%',
  });

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
      width: actualCardSize,
      height: actualCardSize,
      border: '2pt solid #333',
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden', // Clip content that exceeds card boundaries
    },
    kanji: {
      position: 'absolute',
      top: kanjiTop,
      left: 0,
      right: 0,
      fontSize: kanjiFontSize,
      fontFamily: kanjiFont,
      textAlign: 'center',
      color: grayscaleMode ? '#000000' : getKanjiColorByJlptLevel(kanji.jlptLevel),
      lineHeight: 1, // No extra spacing - text element height equals fontSize
      zIndex: 10, // Layer above han-viet text
    },
    // First meaning - right side
    hanVietRight: {
      position: 'absolute',
      right: 3, // Fixed distance from edge
      top: actualCardSize * 0.25,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Don't stretch - start from top
      maxHeight: actualCardSize * 0.5,
      zIndex: 5,
    },
    // Second meaning - left side
    hanVietLeft: {
      position: 'absolute',
      left: 3, // Fixed distance from edge
      top: actualCardSize * 0.25,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Don't stretch - start from top
      maxHeight: actualCardSize * 0.5,
      zIndex: 5,
    },
    // Third meaning - bottom center (vertical mode only)
    hanVietBottom: {
      position: 'absolute',
      bottom: 3, // Fixed distance from edge
      left: 0,
      right: 0,
      flexDirection: 'row', // Layout meanings horizontally
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
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
      zIndex: 5,
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
      
      {/* Main Kanji - absolutely positioned at calculated Y for perfect centering */}
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
          
          {/* Third+ meanings - bottom center - horizontal text like screen version */}
          {bottomMeanings.length > 0 && (
            <View style={styles.hanVietBottom}>
              <Text style={styles.hanVietHorizontalText}>
                {bottomMeanings.join(', ')}
              </Text>
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

