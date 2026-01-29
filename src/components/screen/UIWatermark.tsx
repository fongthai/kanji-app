import {
  WATERMARK_TEXT,
  WATERMARK_FONT_SIZE,
  WATERMARK_RADIUS,
  WATERMARK_COLOR,
  WATERMARK_OPACITY_UI,
} from '../../constants/watermark';

/**
 * UI Watermark component for empty state screens
 * Renders circular text watermark using SVG
 */
export const UIWatermark: React.FC = () => {
  // Calculate character positions along the circle
  const baseText = WATERMARK_TEXT;

  // Use the full circle for even distribution
  const usableCircle = 2 * Math.PI;

  // Always use exactly 3 repetitions of the watermark text
  const repetitions = 3;
  // Remove spaces from original text, then space each character
  const noSpaces = baseText.replace(/\s+/g, '');
  const spacedText = noSpaces.split('').join(' ');
  // Repeat 3 times continuously with single space separator
  const repeatedText = Array(repetitions).fill(spacedText).join(' ') + ' ';
  const allChars = repeatedText.split('');

  // Improved character width mapping for better visual balance
  const narrowChars = ['i', 'j', 'l', 'I', 'J', 'L', '1', 'f', 't', 'r', '!', '|'];
  const wideChars = ['w', 'm', 'W', 'M'];

  // Get character width: narrow=0.6, wide=1.3, normal=1.0
  const getCharWidth = (char: string): number => {
    if (narrowChars.includes(char)) return 0.6;
    if (wideChars.includes(char)) return 1.3;
    return 1.0;
  };

  // Calculate character widths
  const charWidths = allChars.map(char => getCharWidth(char));
  const totalWidth = charWidths.reduce((sum, w) => sum + w, 0);

  // Distribute angle proportionally based on character widths
  const angles: number[] = [];
  let currentAngle = -Math.PI / 2; // Start from top

  charWidths.forEach(width => {
    angles.push(currentAngle);
    currentAngle += (usableCircle / totalWidth) * width;
  });

  // Convert points to pixels (1 point = 1.333 pixels at 96 DPI)
  const radiusPx = WATERMARK_RADIUS * 1.333;
  const fontSizePx = WATERMARK_FONT_SIZE * 1.333;
  const svgSize = radiusPx * 2 + fontSizePx * 2; // Add padding for text

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity: WATERMARK_OPACITY_UI,
        zIndex: 0,
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{ overflow: 'visible' }}
      >
        {allChars.map((char, index) => {
          const angle = angles[index];
          const centerX = svgSize / 2;
          const centerY = svgSize / 2;

          // Calculate position on circle
          const x = centerX + radiusPx * Math.cos(angle);
          const y = centerY + radiusPx * Math.sin(angle);

          // Calculate rotation to make text follow the curve
          // Add 90 degrees to make text perpendicular to radius
          const rotation = (angle * 180 / Math.PI) + 90;

          return (
            <text
              key={`watermark-${index}`}
              x={x}
              y={y}
              fill={WATERMARK_COLOR}
              fontSize={fontSizePx}
              fontFamily="Noto Sans JP, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${rotation}, ${x}, ${y})`}
            >
              {char}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
