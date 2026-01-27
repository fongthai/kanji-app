import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { getGradeColor } from '../../constants/indicators';

interface PDFGradeIndicatorProps {
  gradeLevel: number | string;
  size?: number; // Size in points, default 20
  grayscaleMode?: boolean;
}

export const PDFGradeIndicator: React.FC<PDFGradeIndicatorProps> = ({ 
  gradeLevel,
  size = 20,
  grayscaleMode = false,
}) => {
  const color = getGradeColor(gradeLevel);
  
  const styles = StyleSheet.create({
    indicator: {
      width: size,
      height: size,
      borderRadius: size / 2, // Full circle
      backgroundColor: grayscaleMode ? '#ffffff' : color,
      border: grayscaleMode ? '1pt solid #000000' : undefined,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0, // Don't shrink in flex container
    },
    text: {
      fontSize: size * 0.5, // 50% of badge size
      color: grayscaleMode ? '#000000' : '#fff',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.indicator}>
      <Text style={styles.text}>G{gradeLevel}</Text>
    </View>
  );
};
