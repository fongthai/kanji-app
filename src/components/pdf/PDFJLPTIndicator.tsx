import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { getJlptColor } from '../../constants/indicators';

interface PDFJLPTIndicatorProps {
  level: string; // 'N5', 'N4', 'N3', 'N2', 'N1'
  size?: number; // Size in points, default 20
  grayscaleMode?: boolean;
}

export const PDFJLPTIndicator: React.FC<PDFJLPTIndicatorProps> = ({ 
  level, 
  size = 20,
  grayscaleMode = false,
}) => {
  const color = getJlptColor(level);
  const displayLevel = level.toUpperCase().replace(/-ORG$/i, ''); // Show N5, N4, etc
  
  const styles = StyleSheet.create({
    indicator: {
      position: 'absolute',
      top: 2,
      left: 2,
      width: size,
      height: size,
      borderRadius: 2, // Square with slight rounding
      backgroundColor: grayscaleMode ? '#ffffff' : color,
      border: grayscaleMode ? '1pt solid #000000' : undefined,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: size * 0.5, // 50% of badge size
      color: grayscaleMode ? '#000000' : '#fff',
      fontWeight: 'bold',
    },
  });
  
  return (
    <View style={styles.indicator}>
      <Text style={styles.text}>{displayLevel}</Text>
    </View>
  );
};
