import React from 'react';
import { type KanjiData } from '../../features/kanji/kanjiSlice';
import { useAppSelector } from '../../app/hooks';
import {
  INDICATOR_SIZE_RATIO,
  INDICATOR_PADDING,
  getJlptColor,
  getGradeColor,
  formatFrequency,
  getFrequencyColor,
} from '../../constants/indicators';

interface MasterCellProps {
  kanji: KanjiData;
  cellWidth: number; // 2× practice cell width
  cellHeight: number; // 2× practice cell height
  kanjiFont?: string;
  kanjiFontSize?: number; // in rem
  className?: string;
}

/**
 * MasterCell - Master kanji display cell for Sheet mode
 * 
 * Features:
 * - 2×2 cell size (twice the width and height of practice cells)
 * - Similar layout to Board mode KanjiCard
 * - Kanji character with stroke order font (default)
 * - Optional Han-viet display (vertical/horizontal)
 * - Optional indicators (JLPT, Grade, Frequency)
 * - Responsive and scalable
 */
export const MasterCell: React.FC<MasterCellProps> = ({
  kanji,
  cellWidth,
  cellHeight,
  kanjiFont,
  kanjiFontSize,
  className = '',
}) => {
  // Get Sheet panel settings (completely separate from Board/mainPanel)
  const sheetPanel = useAppSelector(state => state.displaySettings.sheetPanel);
  const grayscaleMode = useAppSelector(state => state.worksheet.grayscaleMode);
  
  // Use sheetPanel settings (ignore worksheet.sheetShowHanViet/sheetShowIndicators)
  const showHanViet = sheetPanel.showHanViet;
  const showIndicators = sheetPanel.showJlptIndicator || sheetPanel.showGradeIndicator || sheetPanel.showFrequencyIndicator;
  const hanVietOrientation = sheetPanel.hanVietOrientation;
  
  // Use provided font or fallback to sheetPanel font
  const actualKanjiFont = kanjiFont || sheetPanel.kanjiFont;
  
  // Calculate actual sizes from percentage (sheetPanel stores percentages)
  // Base font size for master kanji: scales with cell size
  const baseFontSize = kanjiFontSize || 6;
  const kanjiSizeRem = baseFontSize * (sheetPanel.kanjiSize / 100);
  
  // Han-viet size: independent from kanji size, uses its own percentage and base
  // Base is 1/4 of kanji base, then apply hanVietSize percentage
  const hanVietBaseSize = baseFontSize * 0.25;
  const hanVietSizeRem = hanVietBaseSize * (sheetPanel.hanVietSize / 100);
  
  // Parse Han-viet meanings
  const hanVietMeanings = kanji.hanViet
    .split(/[,/]/)
    .map(m => m.trim())
    .filter(m => m.length > 0);
  
  // Indicator size (relative to han-viet size)
  const indicatorSize = hanVietSizeRem * INDICATOR_SIZE_RATIO;
  
  // Guide line settings (same as PracticeCell)
  const guideColor = '#cccccc';
  const guideStrokeWidth = 1;
  const guideDashArray = '2,2';
  const guideOpacity = 50; // Match practice cell default
  
  return (
    <div
      className={`relative border-2 border-gray-600 bg-white ${className}`}
      style={{
        width: `${cellWidth}px`,
        height: `${cellHeight}px`,
        gridColumn: 'span 2',
        gridRow: 'span 2',
      }}
    >
      {/* Guide lines (SVG) - same as PracticeCell */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={cellWidth}
        height={cellHeight}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vertical center line */}
        <line
          x1={cellWidth / 2}
          y1={0}
          x2={cellWidth / 2}
          y2={cellHeight}
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={guideOpacity / 100}
        />
        
        {/* Horizontal center line */}
        <line
          x1={0}
          y1={cellHeight / 2}
          x2={cellWidth}
          y2={cellHeight / 2}
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={guideOpacity / 100}
        />
        
        {/* Center square (1/2 cell size) */}
        <rect
          x={cellWidth * 0.25}
          y={cellHeight * 0.25}
          width={cellWidth * 0.5}
          height={cellHeight * 0.5}
          fill="none"
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={guideOpacity / 100}
        />
      </svg>

      {/* Indicators (top-left and top-right corners) */}
      {showIndicators && (
        <>
          {/* JLPT Level (top-left) */}
          {kanji.jlptLevel && sheetPanel.showJlptIndicator && (
            <div
              className="absolute"
              style={{
                top: `${INDICATOR_PADDING}px`,
                left: `${INDICATOR_PADDING}px`,
                width: `${indicatorSize}rem`,
                height: `${indicatorSize}rem`,
                borderRadius: '2px',
                backgroundColor: grayscaleMode ? '#666666' : getJlptColor(kanji.jlptLevel),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: `${indicatorSize * 0.5}rem`,
                color: '#ffffff',
                fontWeight: 700,
                lineHeight: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {kanji.jlptLevel}
            </div>
          )}
          
          {/* Grade Level (top-right) */}
          {kanji.gradeLevel && sheetPanel.showGradeIndicator && (
            <div
              className="absolute"
              style={{
                top: `${INDICATOR_PADDING}px`,
                left: `calc(${INDICATOR_PADDING}px + ${indicatorSize}rem + 4px)`,
                width: `${indicatorSize}rem`,
                height: `${indicatorSize}rem`,
                borderRadius: '50%',
                backgroundColor: grayscaleMode ? '#888888' : getGradeColor(kanji.gradeLevel),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: `${indicatorSize * 0.5}rem`,
                color: '#ffffff',
                fontWeight: 700,
                lineHeight: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {kanji.gradeLevel}
            </div>
          )}
          
          {/* Frequency (bottom-right or top-right based on han-viet orientation) */}
          {kanji.frequency && sheetPanel.showFrequencyIndicator && (
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
                backgroundColor: grayscaleMode ? '#999999' : getFrequencyColor(kanji.frequency),
                color: '#ffffff',
                borderRadius: '3px',
                padding: '0.1rem 0.3rem',
                fontWeight: 'bold',
                fontSize: `${indicatorSize * 0.5}rem`,
                lineHeight: 1,
              }}
            >
              {formatFrequency(kanji.frequency)}
            </div>
          )}
        </>
      )}
      
      {/* Main Content Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Main kanji character */}
        <div
          className="kanji-character"
          style={{
            fontFamily: actualKanjiFont,
            fontSize: `${kanjiSizeRem}rem`,
            lineHeight: 1,
            color: '#000000',
          }}
        >
          {kanji.kanji}
        </div>
      </div>

      {/* Han-viet meanings - positioned based on orientation */}
      {hanVietOrientation === 'vertical' ? (
        // Vertical mode: 1st right, 2nd left, 3rd+ bottom
        <>
          {/* First meaning - right side */}
          {showHanViet && hanVietMeanings[0] && (
            <div
              className="absolute"
              style={{
                top: '50%',
                right: '0.2rem',
                transform: 'translateY(-50%)',
                fontSize: `${hanVietSizeRem}rem`,
                fontFamily: sheetPanel.hanVietFont === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : `'${sheetPanel.hanVietFont}', sans-serif`,
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
              {hanVietMeanings[0]}
            </div>
          )}

          {/* Second meaning - left side */}
          {showHanViet && hanVietMeanings[1] && (
            <div
              className="absolute"
              style={{
                top: '50%',
                left: '0.2rem',
                transform: 'translateY(-50%)',
                fontSize: `${hanVietSizeRem}rem`,
                fontFamily: sheetPanel.hanVietFont === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : `'${sheetPanel.hanVietFont}', sans-serif`,
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
              {hanVietMeanings[1]}
            </div>
          )}

          {/* Third+ meanings - bottom center */}
          {showHanViet && hanVietMeanings.length > 2 && (
            <div
              className="absolute left-0 right-0 text-center overflow-hidden"
              style={{
                bottom: '0.2rem',
                fontSize: `${hanVietSizeRem}rem`,
                fontFamily: sheetPanel.hanVietFont === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : `'${sheetPanel.hanVietFont}', sans-serif`,
                color: '#9ca3af',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                paddingLeft: '0.2rem',
                paddingRight: '0.2rem',
              }}
            >
              {hanVietMeanings.slice(2).join(', ')}
            </div>
          )}
        </>
      ) : (
        // Horizontal mode: all meanings at center-bottom, comma-separated
        showHanViet && hanVietMeanings.length > 0 && (
          <div
            className="absolute left-0 right-0 text-center"
            style={{
              bottom: '0.2rem',
              fontSize: `${hanVietSizeRem}rem`,
              fontFamily: sheetPanel.hanVietFont === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : `'${sheetPanel.hanVietFont}', sans-serif`,
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
    </div>
  );
};
