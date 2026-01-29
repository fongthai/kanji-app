import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { A4_WIDTH_PT, A4_HEIGHT_PT } from '../../constants/pdfDimensions';
import {
  WATERMARK_TEXT,
  WATERMARK_FONT_SIZE,
  WATERMARK_RADIUS,
  WATERMARK_COLOR,
} from '../../constants/watermark';

interface PDFWatermarkProps {
  grayscaleMode?: boolean;
  opacity: number;
}

/**
 * Helper function to render a single circular watermark
 */
const renderWatermarkCircle = (
  centerX: number,
  centerY: number,
  allChars: string[],
  angles: number[],
  _grayscaleMode: boolean, // Reserved for future grayscale styling
  charStyle: any,
  watermarkId: string
) => {
  return allChars.map((char, index) => {
    const angle = angles[index];

    // Calculate position on circle
    const x = centerX + WATERMARK_RADIUS * Math.cos(angle);
    const y = centerY + WATERMARK_RADIUS * Math.sin(angle);

    // Calculate rotation to make text follow the curve
    // Add 90 degrees to make text perpendicular to radius
    const rotation = (angle * 180 / Math.PI) + 90;

    return (
      <Text
        key={`${watermarkId}-${index}`}
        style={[
          charStyle,
          {
            left: x - WATERMARK_FONT_SIZE / 2, // Center the character
            top: y - WATERMARK_FONT_SIZE / 2,
            transform: `rotate(${rotation}deg)`,
          },
        ]}
      >
        {char}
      </Text>
    );
  });
};

/**
 * Circular watermark component for PDF exports
 * Renders text in a single circle at the center of the page
 */
export const PDFWatermark: React.FC<PDFWatermarkProps> = ({ grayscaleMode = false, opacity }) => {
  const centerX = A4_WIDTH_PT / 2;
  const centerY = A4_HEIGHT_PT / 2; // Center watermark

  // Calculate character positions along the circle with improved character width mapping
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

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: opacity,
      pointerEvents: 'none', // Don't interfere with content
    },
    char: {
      position: 'absolute',
      fontSize: WATERMARK_FONT_SIZE,
      color: grayscaleMode ? '#000000' : WATERMARK_COLOR,
      fontFamily: 'NotoSansJP-Regular',
    },
  });

  // Render single watermark circle in the center
  const watermark = renderWatermarkCircle(centerX, centerY, allChars, angles, grayscaleMode, styles.char, 'center');

  return (
    <View style={styles.container}>
      {watermark}
    </View>
  );
};
