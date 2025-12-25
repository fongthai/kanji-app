import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface PDFFrequencyBadgeProps {
  frequency: number;
  size?: number; // Size in points, default 20pt
  orientation?: 'vertical' | 'horizontal'; // Han-Viet text orientation
}

export const PDFFrequencyBadge: React.FC<PDFFrequencyBadgeProps> = ({ 
  frequency,
  size = 20,
  orientation = 'vertical',
}) => {
  // Calculate badge width based on frequency digits (#17, #123, etc.)
  const digits = String(frequency).length;
  const badgeWidth = size * (1 + digits * 0.35); // Wider for multi-digit numbers
  
  // Color scheme by frequency range (darker = more common/important)
  const getFrequencyColor = (freq: number): string => {
    if (freq <= 250) return '#DC2626'; // Red - most common
    if (freq <= 500) return '#EA580C'; // Orange
    if (freq <= 750) return '#F59E0B'; // Amber
    if (freq <= 1000) return '#84CC16'; // Yellow-green
    if (freq <= 1250) return '#16A34A'; // Green
    if (freq <= 1500) return '#0D9488'; // Teal
    if (freq <= 1750) return '#2563EB'; // Blue
    if (freq <= 2000) return '#4F46E5'; // Indigo
    return '#8B5CF6'; // Purple - least common
  };
  
  const styles = StyleSheet.create({
    badge: {
      position: 'absolute',
      // Position based on orientation: bottom-left for vertical, top-right for horizontal
      ...(orientation === 'vertical' ? {
        bottom: 2,
        left: 2,
      } : {
        top: 2,
        right: 2,
      }),
      width: badgeWidth,
      height: size,
      backgroundColor: getFrequencyColor(frequency),
      borderRadius: 3,
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 2,
      paddingRight: 2,
    },
    text: {
      fontSize: size * 0.52, // Increased from 0.45 for better readability
      color: '#ffffff', // White text for all backgrounds
      fontWeight: 'bold',
      fontFamily: 'Helvetica-Bold', // Explicit font for PDF rendering
    },
  });
  
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{frequency}</Text>
    </View>
  );
};
