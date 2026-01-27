import { memo } from 'react';
import { type KanjiData } from '../../features/kanji/kanjiSlice';
import { useAppSelector } from '../../app/hooks';
import { KanjiTooltip } from '../shared/KanjiTooltip';
import {
  INDICATOR_SIZE_RATIO,
  INDICATOR_PADDING,
  getJlptColor,
  getGradeColor,
  formatFrequency,
  FREQUENCY_COLOR,
  getFrequencyColor,
} from '../../constants/indicators';
import { calculateScreenMeaningLayout, type ScreenMeaningLayout } from '../../utils/screenMeaningLayout';

interface KanjiCardProps {
  kanji: KanjiData;
  variant?: 'input' | 'board';
  isChosen?: boolean;
  colors?: {
    header?: string;
    body?: string;
    border?: string;
    chosenBorder?: string;
    text?: string;
  };
  onClick?: () => void;
  onDoubleClick?: () => void;
  showAlreadyPicked?: boolean;
  showHanViet?: boolean;
  // New: Individual indicator props (optional overrides)
  showJlptIndicator?: boolean;
  showGradeIndicator?: boolean;
  showFrequencyIndicator?: boolean;
  showVietnameseMeaning?: boolean;
  showEnglishMeaning?: boolean;
  kanjiFont?: string;
  kanjiSize?: number;
  hanVietFont?: string;
  hanVietSize?: number;
  hanVietOrientation?: 'horizontal' | 'vertical';
}

const KanjiCardComponent = ({
  kanji,
  variant = 'input',
  isChosen = false,
  colors,
  onClick,
  onDoubleClick,
  showAlreadyPicked = false,
  showHanViet: showHanVietProp,
  showJlptIndicator: showJlptIndicatorProp,
  showGradeIndicator: showGradeIndicatorProp,
  showFrequencyIndicator: showFrequencyIndicatorProp,
  showVietnameseMeaning: showVietnameseMeaningProp,
  showEnglishMeaning: showEnglishMeaningProp,
  kanjiFont = 'KleeOne-Regular',
  kanjiSize = 3,
  hanVietFont = 'system-ui',
  hanVietSize = 1,
  hanVietOrientation: hanVietOrientationProp,
}: KanjiCardProps) => {
  // Get settings from Redux based on variant
  const inputPanelSettings = useAppSelector(state => state.displaySettings.inputPanel);
  const mainPanelSettings = useAppSelector(state => state.displaySettings.mainPanel);
  const panelSettings = variant === 'input' ? inputPanelSettings : mainPanelSettings;

  // Use props if provided, otherwise fall back to Redux based on variant
  const showHanViet = showHanVietProp !== undefined ? showHanVietProp : panelSettings.showHanViet;
  const showJlptIndicator = showJlptIndicatorProp !== undefined ? showJlptIndicatorProp : panelSettings.showJlptIndicator;
  const showGradeIndicator = showGradeIndicatorProp !== undefined ? showGradeIndicatorProp : panelSettings.showGradeIndicator;
  const showFrequencyIndicator = showFrequencyIndicatorProp !== undefined ? showFrequencyIndicatorProp : panelSettings.showFrequencyIndicator;
  const showVietnameseMeaning = showVietnameseMeaningProp !== undefined ? showVietnameseMeaningProp : panelSettings.showVietnameseMeaning || false;
  const showEnglishMeaning = showEnglishMeaningProp !== undefined ? showEnglishMeaningProp : panelSettings.showEnglishMeaning || false;
  const hanVietOrientation = hanVietOrientationProp !== undefined ? hanVietOrientationProp : panelSettings.hanVietOrientation || 'vertical';
  void hanVietOrientation; // Reserved for future use - prop kept for backward compatibility


  // Calculate indicator size: 80% of Han-Viet text size
  const indicatorSize = hanVietSize * INDICATOR_SIZE_RATIO;

  // Parse han-viet meanings
  const hanVietMeanings = kanji.hanViet;

  // Fixed card size for input variant: 4.05rem (based on 3rem kanji * 1.35)
  const inputCardSize = 4.05;

  // Helper function to estimate text width (rough approximation)
  // ========== Zone Padding Constants ==========
  // Constants for meaning text zone padding (converted from PDF points to rem)
  // Negative value pulls text up into the border area for tighter spacing
  const TOP_ZONE_TOP_PADDING_REM = -1 / 16; // -1pt = -0.0625rem
  const BOTTOM_ZONE_BOTTOM_PADDING_REM = 1 / 16; // 1pt = 0.0625rem
  const RIGHT_ZONE_TOP_PADDING_REM = 2 / 16; // 2pt = 0.125rem
  const LEFT_ZONE_TOP_PADDING_REM = 8 / 16; // 8pt = 0.5rem
  // Parse meanings helper function
  // Keep each array element as a complete meaning (don't split multi-word meanings)
  const parseMeaningsHelper = (input: string[] | undefined): string[] => {
    if (!input) return [];
    return input.filter(item => item && item.trim().length > 0);
  };

  // Font family mapping
  const getKanjiFontFamily = (font: string) => {
    if (font === 'system-ui') return 'system-ui, -apple-system, sans-serif';
    return `'${font}', serif`;
  };

  const getHanVietFontFamily = (font: string) => {
    if (font === 'system-ui') return 'system-ui, -apple-system, sans-serif';
    return `'${font}', sans-serif`;
  };

  // ========== Path Determination ==========
  // Determine which PATH to use for Han-Viet layout
  // OLD PATH: Only when NO other indicators are checked (or checked but have no data)
  // NEW PATH: When English OR Vietnamese checkbox is checked AND has data
  const hasEnglishData = parseMeaningsHelper(kanji.englishMeaning).length > 0;
  const hasVietnameseData = parseMeaningsHelper(kanji.vietnameseMeaning).length > 0;
  const useNewPath = (showEnglishMeaning && hasEnglishData) || (showVietnameseMeaning && hasVietnameseData);

  // ========== Calculate Unified Layout (NEW PATH only) ==========
  // Calculate zone dimensions (in pixels for screen)
  const cardWidthPx = (variant === 'board' ? kanjiSize * 1.35 : inputCardSize) * 16;
  const topZoneWidthPx = cardWidthPx * 0.9;
  const bottomZoneWidthPx = cardWidthPx * 0.9;
  const sideZoneHeightPx = cardWidthPx * 0.85; // For rotated text

  // Calculate unified meaning layout using utility (only for NEW PATH)
  const meaningLayout: ScreenMeaningLayout | null = useNewPath ? calculateScreenMeaningLayout({
    englishMeanings: parseMeaningsHelper(kanji.englishMeaning),
    vietnameseMeanings: parseMeaningsHelper(kanji.vietnameseMeaning),
    hanVietMeanings: hanVietMeanings,
    showEnglish: showEnglishMeaning,
    showVietnamese: showVietnameseMeaning,
    showHanViet: showHanViet,
    hasIndicators: showJlptIndicator || showGradeIndicator || showFrequencyIndicator,
    topZoneWidthPx,
    sideZoneHeightPx,
    bottomZoneWidthPx,
    englishFontSizePx: hanVietSize * 0.65 * 16,
    vietnameseFontSizePx: hanVietSize * 0.65 * 16,
    hanVietFontSizePx: hanVietSize * 16,
  }) : null;

  // ========== Han-Viet Layout Functions ==========

  /**
   * OLD PATH: Simple fixed allocation for Han-Viet
   * - Only 1 meaning per zone
   * - Zone Order: 1st BOTTOM, 2nd TOP, 3rd RIGHT, 4th LEFT
   * - Vertical zones use top-down vertical text (writingMode: vertical-rl, textOrientation: upright)
   * - Used when: !useNewPath (no English/Vietnamese or they have no data)
   */
  const calculateHanVietOldPath = () => {
    return {
      bottom: hanVietMeanings[0] || '',
      top: hanVietMeanings[1] || '',
      right: hanVietMeanings[2] || '',
      left: hanVietMeanings[3] || '',
    };
  };


  // Calculate badge font size based on card size
  const badgeFontSize = Math.max(0.5, Math.min(kanjiSize * 0.25, 1));

  // Variant-specific padding: tighter for board (5%), normal for input (fixed)
  const cardPadding = variant === 'board' 
    ? Math.max(0.2, kanjiSize * 0.05)
    : 0.6; // Fixed padding for input
  
  // @ts-ignore - kept for future reference
  const hanVietMargin = 0.15;

  const cardContent = (
    <div 
      className="relative group" 
      style={variant === 'board' 
        ? { width: '100%', height: '100%', boxSizing: 'border-box', padding: 0, margin: 0, display: 'block' } 
        : { width: `${inputCardSize}rem`, height: `${inputCardSize}rem` }
      }
    >
      <div
        className="rounded cursor-pointer transition-all relative overflow-hidden"
        style={{
          borderWidth: isChosen ? '3px' : (variant === 'board' ? '2px' : '1px'),
          borderStyle: 'solid',
          borderColor: isChosen ? (colors?.chosenBorder || '#22c55e') : (colors?.border || '#d1d5db'),
          backgroundColor: colors?.body || 'transparent', // Use original section color for both chosen and non-chosen
          boxSizing: 'border-box',
          // Board variant uses parent's fixed dimensions, input uses fixed card size
          ...(variant === 'board' ? {
            width: '100%',
            height: '100%',
          } : {
            padding: `${cardPadding}rem`,
            minWidth: `${inputCardSize}rem`,
            minHeight: `${inputCardSize}rem`,
            width: `${inputCardSize}rem`,
            height: `${inputCardSize}rem`,
            aspectRatio: '1 / 1',
          }),
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {/* Badge container - left side vertical, centered vertically */}
        {(showGradeIndicator || showJlptIndicator || showFrequencyIndicator) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${INDICATOR_PADDING}px`,
              display: 'flex',
              flexDirection: 'column', // Stack vertically
              justifyContent: 'center', // Center vertically
              alignItems: 'center',
              gap: '4px',
              zIndex: 15, // Above everything else
            }}
          >
            {/* Grade Level Indicator - Top of stack, circle badge */}
            {showGradeIndicator && kanji.gradeLevel && (
              <div
                style={{
                  width: `${indicatorSize}rem`,
                  height: `${indicatorSize}rem`,
                  borderRadius: '50%', // Full circle
                  backgroundColor: getGradeColor(kanji.gradeLevel),
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: `${indicatorSize * 0.5}rem`, // 50% of badge size
                  fontFamily: getKanjiFontFamily(kanjiFont),
                  color: '#ffffff',
                  fontWeight: 700,
                  lineHeight: 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                }}
              >
                G{kanji.gradeLevel}
              </div>
            )}

            {/* JLPT Level Indicator - Middle of stack, square badge */}
            {showJlptIndicator && kanji.jlptLevel && (
              <div
                style={{
                  width: `${indicatorSize}rem`,
                  height: `${indicatorSize}rem`,
                  borderRadius: '2px', // Square with slight rounding
                  backgroundColor: getJlptColor(kanji.jlptLevel),
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: `${indicatorSize * 0.5}rem`, // 50% of badge size
                  fontFamily: getKanjiFontFamily(kanjiFont),
                  color: '#ffffff',
                  fontWeight: 700,
                  lineHeight: 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                }}
              >
                {kanji.jlptLevel.toUpperCase().replace(/-ORG$/i, '')}
              </div>
            )}

            {/* Frequency Indicator - Bottom of stack */}
            {showFrequencyIndicator && kanji.frequency && (
              <div
                style={{
                  width: `${indicatorSize}rem`,
                  height: `${indicatorSize}rem`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: `${indicatorSize * 0.5}rem`, // 50% to match JLPT/Grade badges
                  fontFamily: getKanjiFontFamily(kanjiFont),
                  lineHeight: 1,
                  flexShrink: 0,
                  // Board variant: badge styling with color-coded background
                  ...(variant === 'board' ? {
                    backgroundColor: getFrequencyColor(kanji.frequency),
                    color: '#FFFFFF',
                    borderRadius: '3px',
                    padding: '0.1rem 0.3rem',
                    fontWeight: 'bold',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  } : {
                    // Input variant: simple white text
                    color: FREQUENCY_COLOR,
                    opacity: 0.6,
                    fontWeight: 400,
                  }),
                }}
              >
                {formatFrequency(kanji.frequency)}
              </div>
            )}
          </div>
        )}

        {/* Main content area - centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Kanji - takes 75% of space */}
          <div 
            className={variant === 'board' && kanjiFont === 'KanjiStrokeOrders' ? '' : 'font-bold'}
            style={{
              fontSize: `${kanjiSize}rem`,
              fontFamily: getKanjiFontFamily(kanjiFont),
              lineHeight: 1,
              color: colors?.text || '#ffffff',
            }}
          >
            {kanji.kanji}
          </div>
        </div>

        {/* ========================================
            OLD PATH: Simple Han-Viet Layout
            Trigger: !useNewPath (no English/Vietnamese or they have no data)
            Zone Order: 1st BOTTOM, 2nd TOP, 3rd RIGHT, 4th LEFT
            Rendering: Top-down vertical text on sides
            ======================================== */}
        {!useNewPath && showHanViet && (() => {
          const layout = calculateHanVietOldPath();

          return (
            <>
              {/* Bottom zone (center-aligned horizontal text) */}
              {layout.bottom && (
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{
                    bottom: `${BOTTOM_ZONE_BOTTOM_PADDING_REM}rem`,
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                    zIndex: 5,
                  }}
                >
                  {layout.bottom}
                </div>
              )}

              {/* Top zone (center-aligned horizontal text) */}
              {layout.top && (
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{
                    top: `${TOP_ZONE_TOP_PADDING_REM}rem`,
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                    zIndex: 5,
                  }}
                >
                  {layout.top}
                </div>
              )}

              {/* Right zone (center-aligned vertical text) */}
              {layout.right && (
                <div
                  className="absolute"
                  style={{
                    top: '50%',
                    right: '0.2rem',
                    transform: 'translateY(-50%)',
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    maxHeight: '80%',
                    overflow: 'hidden',
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    letterSpacing: '0.05em',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                  }}
                >
                  {layout.right}
                </div>
              )}

              {/* Left zone (center-aligned vertical text) */}
              {layout.left && (
                <div
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '0.2rem',
                    transform: 'translateY(-50%)',
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    maxHeight: '80%',
                    overflow: 'hidden',
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    letterSpacing: '0.05em',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                  }}
                >
                  {layout.left}
                </div>
              )}
            </>
          );
        })()}

        {/* ========================================
            NEW PATH: Dynamic Zone Allocation with Overflow
            Trigger: useNewPath (English/Vietnamese checked with data)
            Behavior: Priority-based overflow (English > Han-Viet > Vietnamese)
            Uses meaningLayout from screenMeaningLayout utility
            ======================================== */}
        {useNewPath && meaningLayout && (() => {
          return (
            <>
              {/* ========== ENGLISH ZONES ========== */}
              {/* English - Top zone (left-aligned horizontal text) */}
              {meaningLayout.english.top && (
                <div
                  className="absolute left-0 right-0"
                  style={{
                    top: `${TOP_ZONE_TOP_PADDING_REM}rem`,
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                    textAlign: 'left',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.english.top}
                </div>
              )}

              {/* English - Left zone (sideways rotated vertical text) */}
              {meaningLayout.english.left && (
                <div
                  className="absolute"
                  style={{
                    left: 0,
                    top: `${LEFT_ZONE_TOP_PADDING_REM}rem`,
                    bottom: 0,
                    width: 'fit-content',
                    maxWidth: 'none',
                    paddingRight: '0.12rem',
                    paddingBottom: '0.2rem',
                    paddingLeft: '0.12rem',
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.0,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.english.left}
                </div>
              )}

              {/* English - Right zone (sideways rotated vertical text) */}
              {meaningLayout.english.right && (
                <div
                  className="absolute"
                  style={{
                    right: 0,
                    top: `${RIGHT_ZONE_TOP_PADDING_REM}rem`,
                    bottom: 0,
                    width: '1.2rem',
                    padding: '0.2rem 0.05rem',
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.0,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.english.right}
                </div>
              )}

              {/* English - Bottom zone (center-aligned horizontal text) */}
              {meaningLayout.english.bottom && (
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{
                    bottom: `${BOTTOM_ZONE_BOTTOM_PADDING_REM}rem`,
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.english.bottom}
                </div>
              )}

              {/* ========== HAN-VIET ZONES ========== */}
              {/* Han-Viet - Top zone (center-aligned horizontal text) */}
              {meaningLayout.hanViet.top && (
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{
                    top: `${TOP_ZONE_TOP_PADDING_REM}rem`,
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                    zIndex: 4,
                  }}
                >
                  {meaningLayout.hanViet.top}
                </div>
              )}

              {/* Han-Viet - Left zone (sideways rotated vertical text) */}
              {meaningLayout.hanViet.left && (
                <div
                  className="absolute"
                  style={{
                    left: 0,
                    top: `${LEFT_ZONE_TOP_PADDING_REM}rem`,
                    bottom: 0,
                    width: 'fit-content',
                    maxWidth: 'none',
                    paddingRight: '0.12rem',
                    paddingBottom: '0.2rem',
                    paddingLeft: '0.12rem',
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.0,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    whiteSpace: 'nowrap',
                    zIndex: 4,
                  }}
                >
                  {meaningLayout.hanViet.left}
                </div>
              )}

              {/* Han-Viet - Right zone (sideways rotated vertical text) */}
              {meaningLayout.hanViet.right && (
                <div
                  className="absolute"
                  style={{
                    right: 0,
                    top: `${RIGHT_ZONE_TOP_PADDING_REM}rem`,
                    bottom: 0,
                    width: '1.2rem',
                    padding: '0.2rem 0.05rem',
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.0,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    whiteSpace: 'nowrap',
                    zIndex: 4,
                  }}
                >
                  {meaningLayout.hanViet.right}
                </div>
              )}

              {/* Han-Viet - Bottom zone (center-aligned horizontal text) */}
              {meaningLayout.hanViet.bottom && (
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{
                    bottom: `${BOTTOM_ZONE_BOTTOM_PADDING_REM}rem`,
                    fontSize: `${hanVietSize}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.1rem',
                    paddingRight: '0.1rem',
                    zIndex: 4,
                  }}
                >
                  {meaningLayout.hanViet.bottom}
                </div>
              )}

              {/* ========== VIETNAMESE ZONES ========== */}
              {/* Vietnamese - Top zone (center-aligned horizontal text) */}
              {meaningLayout.vietnamese.top && (
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{
                    top: `${TOP_ZONE_TOP_PADDING_REM}rem`,
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.vietnamese.top}
                </div>
              )}

              {/* Vietnamese - Left zone (sideways rotated vertical text) */}
              {meaningLayout.vietnamese.left && (
                <div
                  className="absolute"
                  style={{
                    left: 0,
                    top: `${LEFT_ZONE_TOP_PADDING_REM}rem`,
                    bottom: 0,
                    width: 'fit-content',
                    maxWidth: 'none',
                    paddingRight: '0.12rem',
                    paddingBottom: '0.2rem',
                    paddingLeft: '0.12rem',
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.0,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.vietnamese.left}
                </div>
              )}

              {/* Vietnamese - Right zone (sideways rotated vertical text) */}
              {meaningLayout.vietnamese.right && (
                <div
                  className="absolute"
                  style={{
                    right: 0,
                    top: `${RIGHT_ZONE_TOP_PADDING_REM}rem`,
                    bottom: 0,
                    width: '1.2rem',
                    padding: '0.2rem 0.05rem',
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.0,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'clip',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.vietnamese.right}
                </div>
              )}

              {/* Vietnamese - Bottom zone (center-aligned horizontal text) */}
              {meaningLayout.vietnamese.bottom && (
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{
                    bottom: `${BOTTOM_ZONE_BOTTOM_PADDING_REM}rem`,
                    fontSize: `${hanVietSize * 0.65}rem`,
                    fontFamily: getHanVietFontFamily(hanVietFont),
                    color: '#9ca3af',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                    zIndex: 5,
                  }}
                >
                  {meaningLayout.vietnamese.bottom}
                </div>
              )}
            </>
          );
        })()}
      </div>
      
      {/* "Already picked" badge - shows on hover if kanji is chosen (Input Panel only) */}
      {variant === 'input' && showAlreadyPicked && isChosen && (
        <div 
          className="absolute bg-yellow-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap font-semibold"
          style={{
            top: `${-badgeFontSize * 0.8}rem`,
            right: `${-badgeFontSize * 0.8}rem`,
            fontSize: `${badgeFontSize * 1.2}rem`,
            padding: `${badgeFontSize * 0.2}rem ${badgeFontSize * 0.6}rem`,
          }}
        >
          Already picked
        </div>
      )}
    </div>
  );

  // Only wrap with tooltip for board (main panel) variant
  return variant === 'board' ? (
    <KanjiTooltip kanji={kanji}>
      {cardContent}
    </KanjiTooltip>
  ) : (
    cardContent
  );
};

// Export memoized version for performance optimization
export const KanjiCard = memo(KanjiCardComponent);

