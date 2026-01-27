import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { PDFJLPTIndicator } from './PDFJLPTIndicator';
import { PDFGradeIndicator } from './PDFGradeIndicator';
import { PDFFrequencyBadge } from './PDFFrequencyBadge';
import { getKanjiColorByJlptLevel } from '../../constants/indicators';
import { PDF_CARD_BORDER_TOTAL } from '../../constants/pdfDimensions';
import { calculatePDFMeaningLayout } from '../../utils/pdfMeaningLayout';

// Constants for meaning text zone padding (in points)
// Negative value pulls text up into the border area for tighter spacing
const TOP_ZONE_TOP_PADDING = -1;
const BOTTOM_ZONE_BOTTOM_PADDING = 1; // Space from bottom edge
const RIGHT_ZONE_TOP_PADDING = 2; // Start position for right zone rotated text (was 1, increased by 1)
const LEFT_ZONE_TOP_PADDING = 8; // Prevent overlap with TOP zone text

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
  showVietnameseMeaning?: boolean;
  showEnglishMeaning?: boolean;
  meaningFont?: string;
  meaningFontSize?: number;
  grayscaleMode: boolean;
}

export const PDFKanjiCard: React.FC<PDFKanjiCardProps> = ({
  kanji,
  cellSize,
  kanjiFont,
  kanjiFontSize,
  hanVietFont,
  hanVietFontSize,
  hanVietOrientation, // Note: Currently unused - Han-Viet now uses fixed zone order for both OLD/NEW paths
  indicatorFontSize,
  showHanViet,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  showVietnameseMeaning = false,
  showEnglishMeaning = false,
  meaningFont = 'system-ui',
  meaningFontSize = hanVietFontSize,
  grayscaleMode,
}) => {
  // Suppress unused variable warning - kept for interface compatibility
  void hanVietOrientation;
  // Parse meanings - filter out empty values
  const hanVietMeanings = kanji.hanViet || [];
  const englishMeanings = (kanji.englishMeaning || []).filter(item => item && item.trim().length > 0);
  const vietnameseMeanings = (kanji.vietnameseMeaning || []).filter(item => item && item.trim().length > 0);

  // Calculate actual card content size (border adds to total box size)
  const actualCardSize = cellSize - PDF_CARD_BORDER_TOTAL;

  // Determine which PATH to use
  // OLD PATH: Only when NO other indicators are checked (or checked but have no data)
  // NEW PATH: When English OR Vietnamese checkbox is checked AND has data
  const hasEnglishData = englishMeanings.length > 0;
  const hasVietnameseData = vietnameseMeanings.length > 0;
  const useNewPath = (showEnglishMeaning && hasEnglishData) || (showVietnameseMeaning && hasVietnameseData);


  // ========== Han-Viet Layout Functions ==========

  /**
   * OLD PATH: Simple fixed allocation for Han-Viet
   * - Only 1 meaning per zone
   * - Order: 1st bottom, 2nd top, 3rd right, 4th left
   * - Vertical zones use top-down vertical text (textOrientation: upright)
   */
  const calculateHanVietOldPath = () => {
    return {
      bottom: hanVietMeanings[0] || '',
      top: hanVietMeanings[1] || '',
      right: hanVietMeanings[2] || '',
      left: hanVietMeanings[3] || '',
    };
  };


  // NEW PATH: Calculate overflow layout with priority cascade
  // IMPORTANT: For rotated sideways text, the "width" is actually the vertical height available
  // Top zone (horizontal): Width for horizontal text at top
  // Side zones (rotated 90deg): Use card HEIGHT minus top/bottom padding
  // Bottom zone (horizontal): Width for horizontal text at bottom
  const topZoneWidthPt = actualCardSize * 0.9; // 90% of card width (with padding)
  const sideZoneWidthPt = actualCardSize * 0.85; // 85% of card height (leave space for indicators and kanji)
  const bottomZoneWidthPt = actualCardSize * 0.9; // 90% of card width (with padding)

  // Determine if indicators are showing (LEFT zone only available when ALL indicators OFF)
  const hasIndicators = showJlptIndicator || showGradeIndicator || showFrequencyIndicator;

  const meaningLayout = useNewPath ? calculatePDFMeaningLayout({
    englishMeanings,
    vietnameseMeanings,
    hanVietMeanings,
    showEnglish: showEnglishMeaning,
    showVietnamese: showVietnameseMeaning,
    showHanViet: showHanViet,
    hasIndicators, // LEFT zone only available when this is FALSE
    topZoneWidthPt,
    sideZoneWidthPt,
    bottomZoneWidthPt,
    englishFontSizePt: meaningFontSize * 0.65, // English/Vietnamese are 65% of Han-Viet size
    vietnameseFontSizePt: meaningFontSize * 0.65,
    hanVietFontSizePt: meaningFontSize,
  }) : null;

  /**
   * NEW PATH: Word-based overflow with zone collision detection for Han-Viet
   * Must be called AFTER meaningLayout is calculated
   * - Multiple meanings per zone (fit as many as possible)
   * - Priority order: BOTTOM → TOP → RIGHT → LEFT
   * - Checks for zone occupancy by English/Vietnamese
   * - Vertical zones use sideways rotated text (transform: rotate(90deg))
   */
  const calculateHanVietNewPath = () => {
    if (!showHanViet || hanVietMeanings.length === 0) {
      return { bottom: '', top: '', right: '', left: '' };
    }

    const result = { bottom: '', top: '', right: '', left: '' };
    let remainingMeanings = [...hanVietMeanings];

    // Helper to estimate text width (same logic as in pdfMeaningLayout.ts)
    const estimateTextWidth = (text: string, fontSizePt: number): number => {
      const avgCharWidth = fontSizePt * 0.6;
      return text.length * avgCharWidth;
    };

    // Helper to fit words in horizontal zones (bottom/top)
    const fitHorizontalZone = (meanings: string[], maxWidth: number) => {
      const fitted: string[] = [];
      let currentWidth = 0;

      for (let i = 0; i < meanings.length; i++) {
        const meaning = meanings[i];
        const meaningWidth = estimateTextWidth(meaning, meaningFontSize);
        const separatorWidth = i > 0 ? estimateTextWidth(', ', meaningFontSize) : 0;

        if (i === 0 || currentWidth + separatorWidth + meaningWidth <= maxWidth) {
          fitted.push(meaning);
          currentWidth += (i > 0 ? separatorWidth : 0) + meaningWidth;
        } else {
          break; // Can't fit more
        }
      }

      return {
        fitted: fitted.join(', '),
        overflow: meanings.slice(fitted.length)
      };
    };

    // Helper to fit words in vertical zones (right/left) - rotated sideways
    const fitVerticalZone = (meanings: string[], maxWidth: number) => {
      const fitted: string[] = [];
      let currentWidth = 0;

      for (let i = 0; i < meanings.length; i++) {
        const meaning = meanings[i];
        const meaningWidth = estimateTextWidth(meaning, meaningFontSize);
        const separatorWidth = i > 0 ? estimateTextWidth(', ', meaningFontSize) : 0;

        if (i === 0 || currentWidth + separatorWidth + meaningWidth <= maxWidth) {
          fitted.push(meaning);
          currentWidth += (i > 0 ? separatorWidth : 0) + meaningWidth;
        } else {
          break; // Can't fit more
        }
      }

      return {
        fitted: fitted.join(', '),
        overflow: meanings.slice(fitted.length)
      };
    };

    // 1. Try BOTTOM zone (if not occupied by English/Vietnamese)
    const bottomOccupied = meaningLayout?.english.bottom || meaningLayout?.vietnamese.bottom;
    if (!bottomOccupied && remainingMeanings.length > 0) {
      const fit = fitHorizontalZone(remainingMeanings, bottomZoneWidthPt);
      result.bottom = fit.fitted;
      remainingMeanings = fit.overflow;
    }

    // 2. Try TOP zone (if not occupied by English/Vietnamese)
    const topOccupied = meaningLayout?.english.top || meaningLayout?.vietnamese.top;
    if (!topOccupied && remainingMeanings.length > 0) {
      const fit = fitHorizontalZone(remainingMeanings, topZoneWidthPt);
      result.top = fit.fitted;
      remainingMeanings = fit.overflow;
    }

    // 3. Try RIGHT zone (if not occupied by English/Vietnamese)
    const rightOccupied = meaningLayout?.english.right || meaningLayout?.vietnamese.right;
    if (!rightOccupied && remainingMeanings.length > 0) {
      const fit = fitVerticalZone(remainingMeanings, sideZoneWidthPt);
      result.right = fit.fitted;
      remainingMeanings = fit.overflow;
    }

    // 4. Try LEFT zone (if not occupied by English/Vietnamese AND indicators are OFF)
    const leftOccupied = meaningLayout?.english.left || meaningLayout?.vietnamese.left;
    const leftZoneAvailable = !hasIndicators; // Only available when NO indicators
    if (!leftOccupied && leftZoneAvailable && remainingMeanings.length > 0) {
      const fit = fitVerticalZone(remainingMeanings, sideZoneWidthPt);
      result.left = fit.fitted;
      remainingMeanings = fit.overflow;
    }

    return result;
  };

  // ========== Calculate Han-Viet Layout Based on Path ==========
  const hanVietLayout = useNewPath ? calculateHanVietNewPath() : calculateHanVietOldPath();


  // Calculate precise vertical centering using absolute positioning
  // With lineHeight: 1, text element height equals fontSize
  // However, the visual glyph sits lower due to font baseline metrics
  // Apply correction factor to move text element up for visual centering
  const cardCenterY = actualCardSize / 2;
  const baselineCorrection = kanjiFontSize * 0.2; // ~20% upward shift for CJK fonts
  const kanjiTop = cardCenterY - (kanjiFontSize / 2) - baselineCorrection;



  // Helper to render a single meaning vertically
  const renderVerticalMeaning = (meaning: string) => {
    const chars = meaning.split('');
    return chars.map((char, idx) => (
      <Text key={idx} style={styles.hanVietVerticalChar}>
        {char}
      </Text>
    ));
  };

  // Helper to render rotated sideways text
  // fontSizeMultiplier: 0.65 for English/Vietnamese, 1.0 for Han-Viet
  const renderSidewaysText = (text: string, side: 'left' | 'right', fontSizeMultiplier: number = 0.65) => {
    const fontSize = meaningFontSize * fontSizeMultiplier;
    const topPosition = side === 'left' ? LEFT_ZONE_TOP_PADDING : RIGHT_ZONE_TOP_PADDING;
    const leftPadding = 9; // Left side padding
    const rightPadding = 3; // Right side padding from edge

    // Both sides use 'left' property but calculated differently
    // Left side: simple padding from left edge
    // Right side: calculated from right edge (actualCardSize - padding)
    const dynamicStyle = {
      position: 'absolute' as const,
      left: side === 'left' ? leftPadding : (actualCardSize - rightPadding),
      top: topPosition,
      fontSize: fontSize,
      fontFamily: meaningFont === 'system-ui' ? 'NotoSansJP-Regular' : meaningFont,
      color: grayscaleMode ? '#000000' : '#9ca3af',
      transform: 'rotate(90deg)',
      transformOrigin: 'top left',
      zIndex: 6,
    };

    return (
      <Text style={dynamicStyle}>
        {text}
      </Text>
    );
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
    // Indicator container - left side vertical, center-aligned
    indicatorContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 2, // Small padding from left edge
      flexDirection: 'column', // Stack vertically top to bottom
      justifyContent: 'center', // Center-aligned vertically
      alignItems: 'center',
      gap: 4, // 4pt gap between indicators
      zIndex: 15, // Above everything else
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
      bottom: BOTTOM_ZONE_BOTTOM_PADDING,
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
      bottom: BOTTOM_ZONE_BOTTOM_PADDING,
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
    // TOP zone container for English meanings (left-aligned, not centered)
    meaningTopContainer: {
      position: 'absolute',
      top: TOP_ZONE_TOP_PADDING,
      left: 2, // Left padding
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start', // Left-aligned, not centered
      zIndex: 6,
    },
    // TOP zone container for Han-Viet meanings (center-aligned)
    hanVietTop: {
      position: 'absolute',
      top: TOP_ZONE_TOP_PADDING,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', // Center-aligned
      zIndex: 6,
    },
    // BOTTOM zone container for Han-Viet meanings
    meaningBottomContainer: {
      position: 'absolute',
      bottom: BOTTOM_ZONE_BOTTOM_PADDING,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 6,
      maxWidth: actualCardSize, // Prevent overflow beyond card width
      overflow: 'hidden', // Clip any overflowing text
    },
    // Vertical meaning character
    meaningVerticalChar: {
      fontSize: meaningFontSize * 0.65, // English/Vietnamese are 65% of Han-Viet size
      fontFamily: meaningFont === 'system-ui' ? 'NotoSansJP-Regular' : meaningFont,
      color: grayscaleMode ? '#000000' : '#9ca3af',
      lineHeight: meaningFontSize * 0.65 * 1.3,
      letterSpacing: meaningFontSize * 0.65 * 0.05,
      textAlign: 'center',
    },
    // Horizontal meaning text (for Han-Viet at bottom)
    meaningHorizontalText: {
      fontSize: meaningFontSize,
      fontFamily: meaningFont === 'system-ui' ? 'NotoSansJP-Regular' : meaningFont,
      color: grayscaleMode ? '#000000' : '#9ca3af',
      textAlign: 'center',
      lineHeight: 1, // Minimal line height to reduce spacing
    },
    // Horizontal English text (at top - 65% size)
    englishHorizontalText: {
      fontSize: meaningFontSize * 0.65,
      fontFamily: meaningFont === 'system-ui' ? 'NotoSansJP-Regular' : meaningFont,
      color: grayscaleMode ? '#000000' : '#9ca3af',
      textAlign: 'center',
      lineHeight: 1, // Minimal line height to reduce spacing
      paddingBottom: 3, // Extra padding to prevent descenders (g, p, q, y) from being clipped
    },
  });
  
  return (
    <View style={styles.card}>
      {/* Badge container - centered horizontally at top with Grade | JLPT | Frequency layout */}
      {(showGradeIndicator || showJlptIndicator || showFrequencyIndicator) && (
        <View style={styles.indicatorContainer}>
          {/* Grade Level Indicator - Left of JLPT, circle badge */}
          {showGradeIndicator && kanji.gradeLevel && (
            <PDFGradeIndicator gradeLevel={kanji.gradeLevel} size={indicatorFontSize} grayscaleMode={grayscaleMode} />
          )}

          {/* JLPT Level Indicator - Center, square badge */}
          {showJlptIndicator && kanji.jlptLevel && (
            <PDFJLPTIndicator level={kanji.jlptLevel} size={indicatorFontSize} grayscaleMode={grayscaleMode} />
          )}

          {/* Frequency Indicator - Right of JLPT */}
          {showFrequencyIndicator && kanji.frequency && (
            <PDFFrequencyBadge
              frequency={kanji.frequency}
              size={indicatorFontSize}
              grayscaleMode={grayscaleMode}
              inContainer={true}
            />
          )}
        </View>
      )}

      {/* Main Kanji - absolutely positioned at calculated Y for perfect centering */}
      <Text style={styles.kanji}>{kanji.kanji}</Text>

      {/* ========================================
          OLD PATH: Simple Han-Viet Layout
          Trigger: !showEnglishMeaning && !showVietnameseMeaning
          Zone Order: 1st bottom, 2nd top, 3rd right, 4th left
          Rendering: Vertical zones use top-down vertical text (textOrientation: upright)
          ======================================== */}
      {!useNewPath && showHanViet && (
        <>
          {/* Bottom zone (center-aligned horizontal text) */}
          {hanVietLayout.bottom && (
            <View style={styles.hanVietBottom}>
              <Text style={styles.hanVietHorizontalText}>
                {hanVietLayout.bottom}
              </Text>
            </View>
          )}

          {/* Top zone (center-aligned horizontal text) */}
          {hanVietLayout.top && (
            <View style={styles.hanVietTop}>
              <Text style={styles.meaningHorizontalText}>
                {hanVietLayout.top}
              </Text>
            </View>
          )}

          {/* Right zone (center-aligned vertical text) */}
          {hanVietLayout.right && (
            <View style={styles.hanVietRight}>
              {renderVerticalMeaning(hanVietLayout.right)}
            </View>
          )}

          {/* Left zone (center-aligned vertical text) */}
          {hanVietLayout.left && (
            <View style={styles.hanVietLeft}>
              {renderVerticalMeaning(hanVietLayout.left)}
            </View>
          )}
        </>
      )}

      {/* ========================================
          NEW PATH: Dynamic Zone Allocation with Overflow
          Trigger: showEnglishMeaning || showVietnameseMeaning
          ======================================== */}
      {useNewPath && meaningLayout && (
        <>
          {/* English - Top zone (primary - horizontal) */}
          {meaningLayout.english.top && (
            <View style={styles.meaningTopContainer}>
              <Text style={styles.englishHorizontalText}>
                {meaningLayout.english.top}
              </Text>
            </View>
          )}

          {/* English - Right zone (overflow - vertical) */}
          {meaningLayout.english.right && renderSidewaysText(meaningLayout.english.right, 'right')}

          {/* English - Bottom zone (overflow - horizontal) */}
          {meaningLayout.english.bottom && (
            <View style={styles.meaningBottomContainer}>
              <Text style={styles.englishHorizontalText}>
                {meaningLayout.english.bottom}
              </Text>
            </View>
          )}

          {/* English - Left zone (overflow - vertical) */}
          {meaningLayout.english.left && renderSidewaysText(meaningLayout.english.left, 'left')}

          {/* Han-Viet - Word-based overflow with zone collision detection
              Priority: BOTTOM → TOP → RIGHT → LEFT
              Rendering: Vertical zones use sideways rotated text, multiple meanings per zone */}

          {/* Bottom zone (center-aligned horizontal text) */}
          {hanVietLayout.bottom && (
            <View style={styles.hanVietBottom}>
              <Text style={styles.hanVietHorizontalText}>
                {hanVietLayout.bottom}
              </Text>
            </View>
          )}

          {/* Top zone (center-aligned horizontal text) */}
          {hanVietLayout.top && (
            <View style={styles.hanVietTop}>
              <Text style={styles.meaningHorizontalText}>
                {hanVietLayout.top}
              </Text>
            </View>
          )}

          {/* Right zone (center-aligned sideways rotated text) */}
          {hanVietLayout.right && renderSidewaysText(hanVietLayout.right, 'right', 1.0)}

          {/* Left zone (center-aligned sideways rotated text) */}
          {hanVietLayout.left && renderSidewaysText(hanVietLayout.left, 'left', 1.0)}

          {/* Vietnamese - Top zone (primary when English OFF - horizontal) */}
          {meaningLayout.vietnamese.top && (
            <View style={styles.meaningTopContainer}>
              <Text style={styles.englishHorizontalText}>
                {meaningLayout.vietnamese.top}
              </Text>
            </View>
          )}

          {/* Vietnamese - Right zone (primary when English ON - vertical) */}
          {meaningLayout.vietnamese.right && renderSidewaysText(meaningLayout.vietnamese.right, 'right')}

          {/* Vietnamese - Bottom zone (overflow - horizontal) */}
          {meaningLayout.vietnamese.bottom && (
            <View style={styles.meaningBottomContainer}>
              <Text style={styles.englishHorizontalText}>
                {meaningLayout.vietnamese.bottom}
              </Text>
            </View>
          )}

          {/* Vietnamese - Left zone (overflow - vertical) */}
          {meaningLayout.vietnamese.left && renderSidewaysText(meaningLayout.vietnamese.left, 'left')}
        </>
      )}
    </View>
  );
};

