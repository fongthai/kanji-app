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
  kanjiFont = 'YujiMai-Regular',
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
  const hanVietOrientation = hanVietOrientationProp !== undefined ? hanVietOrientationProp : panelSettings.hanVietOrientation || 'vertical';
  
  // Calculate indicator size: 80% of Han-Viet text size
  const indicatorSize = hanVietSize * INDICATOR_SIZE_RATIO;
  
  // Parse han-viet meanings (comma or slash separated)
  const hanVietMeanings = kanji.sinoViet
    .split(/[,/]/)
    .map(m => m.trim())
    .filter(m => m.length > 0);

  // Determine layout: 1-2 meanings in columns, 3rd+ at bottom center
  const topMeanings = hanVietMeanings.slice(0, 2);
  const bottomMeanings = hanVietMeanings.slice(2); // All meanings from 3rd onward

  // Font family mapping
  const getKanjiFontFamily = (font: string) => {
    if (font === 'system-ui') return 'system-ui, -apple-system, sans-serif';
    return `'${font}', serif`;
  };

  const getHanVietFontFamily = (font: string) => {
    if (font === 'system-ui') return 'system-ui, -apple-system, sans-serif';
    return `'${font}', sans-serif`;
  };

  // Calculate badge font size based on card size
  const badgeFontSize = Math.max(0.5, Math.min(kanjiSize * 0.25, 1));
  
  // Fixed card size for input variant: 4.05rem (based on 3rem kanji * 1.35)
  const inputCardSize = 4.05;
  
  // Variant-specific padding: tighter for board (5%), normal for input (fixed)
  const cardPadding = variant === 'board' 
    ? Math.max(0.2, kanjiSize * 0.05)
    : 0.6; // Fixed padding for input
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        {/* JLPT Level Indicator - Top-left corner, square badge */}
        {showJlptIndicator && kanji.jlptLevel && (
          <div 
            className="absolute"
            style={{
              top: `${INDICATOR_PADDING}px`,
              left: `${INDICATOR_PADDING}px`,
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
            }}
          >
            {kanji.jlptLevel.toUpperCase().replace(/-ORG$/i, '')}
          </div>
        )}

        {/* Grade Level Indicator - Next to JLPT indicator, circle badge */}
        {showGradeIndicator && kanji.gradeLevel && (
          <div 
            className="absolute"
            style={{
              top: `${INDICATOR_PADDING}px`,
              left: `calc(${INDICATOR_PADDING}px + ${indicatorSize}rem + 4px)`, // Fixed 4px gap
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
            }}
          >
            {kanji.gradeLevel}
          </div>
        )}

        {/* Frequency Indicator - Position depends on Han-Viet orientation */}
        {showFrequencyIndicator && kanji.frequency && (
          <div 
            className="absolute"
            style={{
              ...(hanVietOrientation === 'vertical' ? {
                bottom: `${INDICATOR_PADDING}px`,
                left: `${INDICATOR_PADDING}px`,
              } : {
                top: `${INDICATOR_PADDING}px`,
                right: `${INDICATOR_PADDING}px`,
              }),
              // Board variant: badge styling with color-coded background
              ...(variant === 'board' ? {
                backgroundColor: getFrequencyColor(kanji.frequency),
                color: '#FFFFFF',
                borderRadius: '3px',
                padding: '0.1rem 0.3rem',
                fontWeight: 'bold',
              } : {
                // Input variant: simple white text
                color: FREQUENCY_COLOR,
                opacity: 0.6,
                fontWeight: 400,
              }),
              fontSize: `${indicatorSize * 0.5}rem`, // 50% to match JLPT/Grade badges
              fontFamily: getKanjiFontFamily(kanjiFont),
              lineHeight: 1,
            }}
          >
            {formatFrequency(kanji.frequency)}
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

        {/* Han-viet meanings - respects orientation setting */}
        {hanVietOrientation === 'vertical' ? (
          // Vertical mode: 1st right, 2nd left, 3rd bottom
          <>
            {/* First meaning - right side */}
            {showHanViet && topMeanings[0] && (
              <div 
                className="absolute"
                style={{
                  top: '50%',
                  right: '0.2rem', // Fixed distance from edge
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
                }}
              >
                {topMeanings[0]}
              </div>
            )}

            {/* Second meaning - left side */}
            {showHanViet && topMeanings[1] && (
              <div 
                className="absolute"
                style={{
                  top: '50%',
                  left: '0.2rem', // Fixed distance from edge
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
                }}
              >
                {topMeanings[1]}
              </div>
            )}
          </>
        ) : (
          // Horizontal mode: all meanings at center-bottom, comma-separated
          showHanViet && hanVietMeanings.length > 0 && (
            <div 
              className="absolute left-0 right-0 text-center"
              style={{
                bottom: '0.2rem', // Fixed distance from edge
                fontSize: `${hanVietSize}rem`,
                fontFamily: getHanVietFontFamily(hanVietFont),
                color: '#9ca3af',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                paddingLeft: '0.2rem',
                paddingRight: '0.2rem',
              }}
            >
              {hanVietMeanings.join(', ')}
            </div>
          )
        )}

        {/* Third+ meanings - bottom center - only for vertical mode and when card is large enough */}
        {hanVietOrientation === 'vertical' && showHanViet && bottomMeanings.length > 0 && kanjiSize >= 2.5 && (
          <div 
            className="absolute left-0 right-0 text-center overflow-hidden"
            style={{
              bottom: '0.2rem', // Fixed distance from edge
              fontSize: `${hanVietSize}rem`,
              fontFamily: getHanVietFontFamily(hanVietFont),
              color: '#9ca3af',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              paddingLeft: '0.2rem',
              paddingRight: '0.2rem',
            }}
          >
            {bottomMeanings.join(', ')}
          </div>
        )}
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

