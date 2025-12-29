import React from 'react';

interface PracticeCellProps {
  cellSize: number; // in pixels
  guidingKanji?: string; // Optional guiding kanji for P1-P3
  tracingOpacity?: number; // Opacity for guiding kanji (0-100)
  guideOpacity?: number; // Opacity for guide lines (0-100)
  kanjiFont?: string; // Font family for guiding kanji (from sheetPanel settings)
  kanjiSize?: number; // Font size percentage (70-110) from sheetPanel settings
  className?: string;
}

/**
 * PracticeCell - A square cell for kanji writing practice
 * 
 * Features:
 * - Square proportions (width === height)
 * - Cross guide lines (vertical + horizontal through center)
 * - Center square guide (1/2 cell size)
 * - Optional guiding kanji with adjustable opacity (for P1-P3)
 * - All guides use dotted lines
 */
export const PracticeCell: React.FC<PracticeCellProps> = ({
  cellSize,
  guidingKanji,
  tracingOpacity = 0,
  guideOpacity = 50,
  kanjiFont = 'KanjiStrokeOrders',
  kanjiSize = 90, // Default 90% if not provided
  className = '',
}) => {
  const guideColor = '#cccccc';
  const guideStrokeWidth = 1;
  const guideDashArray = '2,2';
  
  // Calculate guiding kanji font size: base 70% of cell size (balanced ratio), scaled by user's percentage
  const baseFontSize = cellSize * 0.7;
  const guidingKanjiFontSize = baseFontSize * (kanjiSize / 100);
  
  return (
    <div
      className={`relative border border-gray-400 ${className}`}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }}
    >
      {/* Guide lines (SVG) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={cellSize}
        height={cellSize}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vertical center line */}
        <line
          x1={cellSize / 2}
          y1={0}
          x2={cellSize / 2}
          y2={cellSize}
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={guideOpacity / 100}
        />
        
        {/* Horizontal center line */}
        <line
          x1={0}
          y1={cellSize / 2}
          x2={cellSize}
          y2={cellSize / 2}
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={guideOpacity / 100}
        />
        
        {/* Center square (1/2 cell size) */}
        <rect
          x={cellSize * 0.25}
          y={cellSize * 0.25}
          width={cellSize * 0.5}
          height={cellSize * 0.5}
          fill="none"
          stroke={guideColor}
          strokeWidth={guideStrokeWidth}
          strokeDasharray={guideDashArray}
          opacity={guideOpacity / 100}
        />
      </svg>
      
      {/* Guiding kanji (for P1-P3 cells) */}
      {guidingKanji && tracingOpacity > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: tracingOpacity / 100,
            color: '#888888',
          }}
        >
          <span
            className="kanji-character"
            style={{
              fontSize: `${guidingKanjiFontSize}px`,
              fontFamily: kanjiFont === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : `'${kanjiFont}', serif`,
              lineHeight: 1,
            }}
          >
            {guidingKanji}
          </span>
        </div>
      )}
    </div>
  );
};
