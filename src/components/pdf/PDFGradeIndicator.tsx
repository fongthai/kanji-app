import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { getGradeColor } from '../../constants/indicators';

interface PDFGradeIndicatorProps {
  gradeLevel: number | string;
  size?: number; // Size in points, default 20
}

export const PDFGradeIndicator: React.FC<PDFGradeIndicatorProps> = ({ 
  gradeLevel,
  size = 20 
}) => {
  const color = getGradeColor(gradeLevel);
  
  const styles = StyleSheet.create({
    indicator: {
      position: 'absolute',
      top: 2,
      left: size + 6, // 2px edge + size + 4px gap = size + 6
      width: size,
      height: size,
      borderRadius: size / 2, // Full circle
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: size * 0.5, // 50% of badge size
      color: '#fff',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.indicator}>
      <Text style={styles.text}>{gradeLevel}</Text>
    </View>
  );
};
