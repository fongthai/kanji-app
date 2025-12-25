/**
 * Indicator Constants
 * 
 * Defines colors, sizing, and display settings for kanji card indicators:
 * - JLPT Level Indicator (top-right corner, circular badge)
 * - Grade Level Indicator (top-left corner, Unicode circled numbers)
 * - Frequency Indicator (bottom-left corner, simple text with hashtag)
 */

// =============================================================================
// SIZE & POSITIONING
// =============================================================================

/**
 * Indicator font size as percentage of Han-Viet text size
 * Indicators will be 140% the size of the Han-Viet text
 */
export const INDICATOR_SIZE_RATIO = 1.4;

/**
 * Padding from card edges for all indicators (in pixels)
 */
export const INDICATOR_PADDING = 2;

// =============================================================================
// RAINBOW COLOR SCHEME
// =============================================================================

/**
 * Rainbow color scheme for JLPT levels and Grade levels
 * Using vibrant, high-contrast colors for readability
 */
export const RAINBOW_COLORS = {
  RED: '#E53E3E',      // N5, Grade 1
  ORANGE: '#DD6B20',   // N4, Grade 2
  GREEN: '#38A169',    // N3, Grade 3
  BLUE: '#3182CE',     // N2, Grade 4
  INDIGO: '#5A67D8',   // Grade 5
  VIOLET: '#805AD5',   // N1, Grade 6
  BLACK: '#000000',    // Grade 7+, Frequency indicator
} as const;

/**
 * JLPT Level color mapping
 * Maps JLPT level strings to their corresponding rainbow colors
 */
export const JLPT_COLORS: Record<string, string> = {
  'N5': RAINBOW_COLORS.RED,
  'N4': RAINBOW_COLORS.ORANGE,
  'N3': RAINBOW_COLORS.GREEN,
  'N2': RAINBOW_COLORS.BLUE,
  'N1': RAINBOW_COLORS.VIOLET,
} as const;

/**
 * Grade Level color mapping
 * Maps grade level numbers/strings to their corresponding rainbow colors
 */
export const GRADE_COLORS: Record<string | number, string> = {
  '1': RAINBOW_COLORS.RED,
  '2': RAINBOW_COLORS.ORANGE,
  '3': RAINBOW_COLORS.GREEN,
  '4': RAINBOW_COLORS.BLUE,
  '5': RAINBOW_COLORS.INDIGO,
  '6': RAINBOW_COLORS.VIOLET,
  // Grade 7+ uses black
} as const;

/**
 * Frequency indicator color for Input Panel only
 * Main Panel and PDF exports use black (#000000)
 */
export const FREQUENCY_COLOR = '#FFFFFF';

/**
 * Get frequency badge background color based on frequency range
 * Used for Main Panel (board variant) only
 * Color scheme: darker (red/orange) = more common, lighter (blue/purple) = less common
 */
export const getFrequencyColor = (frequency: number): string => {
  if (frequency <= 250) return '#DC2626'; // Red - most common
  if (frequency <= 500) return '#EA580C'; // Orange
  if (frequency <= 750) return '#F59E0B'; // Amber
  if (frequency <= 1000) return '#84CC16'; // Yellow-green
  if (frequency <= 1250) return '#16A34A'; // Green
  if (frequency <= 1500) return '#0D9488'; // Teal
  if (frequency <= 1750) return '#2563EB'; // Blue
  if (frequency <= 2000) return '#4F46E5'; // Indigo
  return '#8B5CF6'; // Purple - least common
};

/**
 * Professional 30-pair color scheme for Input Panel sections
 * Each pair consists of:
 * - SectionHeader: Darker color for section header background
 * - SectionArea: Lighter shade for kanji card backgrounds
 */
export const SECTION_COLOR_PAIRS = [
  { name: 'Off-Black', header: '#121212', area: '#1E1E1E' },
  { name: 'Obsidian', header: '#1A1A1B', area: '#282829' },
  { name: 'Midnight', header: '#191970', area: '#2D2D8A' },
  { name: 'Deep Navy', header: '#011627', area: '#0A2E47' },
  { name: 'Charcoal', header: '#1E1E1E', area: '#2C2C2C' },
  { name: 'Prussian', header: '#003153', area: '#004B7D' },
  { name: 'Deep Maroon', header: '#4B0000', area: '#6B1A1A' },
  { name: 'Gunmetal', header: '#2C3E50', area: '#3E5871' },
  { name: 'Forest', header: '#0B3D0B', area: '#185C18' },
  { name: 'Eggplant', header: '#311B92', area: '#4A31C1' },
  { name: 'Oxford Blue', header: '#002147', area: '#003B7F' },
  { name: 'Slate Grey', header: '#2F4F4F', area: '#446E6E' },
  { name: 'Indigo', header: '#3F51B5', area: '#5C6BC0' },
  { name: 'Deep Teal', header: '#004D40', area: '#00796B' },
  { name: 'Burgundy', header: '#800020', area: '#A51C30' },
  { name: 'Chocolate', header: '#3E2723', area: '#5D4037' },
  { name: 'Royal Blue', header: '#002366', area: '#003DA5' },
  { name: 'Space Grey', header: '#34495E', area: '#496582' },
  { name: 'Plum', header: '#4A148C', area: '#7B1FA2' },
  { name: 'Espresso', header: '#4E342E', area: '#6D4C41' },
  { name: 'Pine Green', header: '#01579B', area: '#0277BD' },
  { name: 'Graphite', header: '#455A64', area: '#607D8B' },
  { name: 'Violet', header: '#6200EE', area: '#7C4DFF' },
  { name: 'Crimson', header: '#B71C1C', area: '#D32F2F' },
  { name: 'Saddle', header: '#8B4513', area: '#A0522D' },
  { name: 'Cobalt', header: '#0047AB', area: '#005FD3' },
  { name: 'Olive Drab', header: '#556B2F', area: '#6B8E23' },
  { name: 'Burnt Orange', header: '#BF360C', area: '#E64A19' },
  { name: 'Slate Blue', header: '#6A5ACD', area: '#836FFF' },
  { name: 'Amethyst', header: '#9932CC', area: '#BA55D3' },
] as const;

/**
 * Get kanji text color based on JLPT level
 * Used for Main Panel display and PDF/PNG exports
 */
export function getKanjiColorByJlptLevel(jlptLevel: string | undefined): string {
  if (!jlptLevel) return '#000000'; // Default black
  
  const normalizedLevel = jlptLevel.toUpperCase().replace(/-ORG$/i, '');
  return JLPT_COLORS[normalizedLevel] || '#000000';
}

// =============================================================================
// UNICODE CIRCLED NUMBERS FOR GRADE LEVELS
// =============================================================================

/**
 * Unicode circled numbers for grade levels 1-6
 * These characters will be displayed with their corresponding colors
 */
export const GRADE_UNICODE_CIRCLES: Record<string | number, string> = {
  '1': '①',
  '2': '②',
  '3': '③',
  '4': '④',
  '5': '⑤',
  '6': '⑥',
} as const;

// =============================================================================
// PRESET MODES
// =============================================================================

export type IndicatorPreset = 'minimal' | 'study' | 'advanced' | 'custom';

export interface IndicatorSettings {
  showJlpt: boolean;
  showGrade: boolean;
  showFrequency: boolean;
}

/**
 * Predefined indicator visibility presets
 */
export const INDICATOR_PRESETS: Record<IndicatorPreset, IndicatorSettings> = {
  minimal: {
    showJlpt: false,
    showGrade: false,
    showFrequency: false,
  },
  study: {
    showJlpt: true,
    showGrade: true,
    showFrequency: false,
  },
  advanced: {
    showJlpt: true,
    showGrade: true,
    showFrequency: true,
  },
  custom: {
    showJlpt: true,
    showGrade: false,
    showFrequency: true,
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get color for JLPT level
 * @param jlptLevel - JLPT level string (e.g., "N5", "N1")
 * @returns Hex color code or undefined if not found
 */
export function getJlptColor(jlptLevel: string | undefined): string | undefined {
  if (!jlptLevel) return undefined;
  const normalized = jlptLevel.toUpperCase().replace(/[^N0-9]/g, ''); // Handle "n5-org" -> "N5"
  return JLPT_COLORS[normalized];
}

/**
 * Get color for grade level
 * @param gradeLevel - Grade level (number or string)
 * @returns Hex color code, defaults to black for grade 7+
 */
export function getGradeColor(gradeLevel: number | string | undefined): string {
  if (!gradeLevel) return RAINBOW_COLORS.BLACK;
  const grade = String(gradeLevel);
  return GRADE_COLORS[grade] || RAINBOW_COLORS.BLACK;
}

/**
 * Get Unicode circled number for grade level
 * @param gradeLevel - Grade level (number or string)
 * @returns Unicode circled character or plain number as fallback
 */
export function getGradeCircle(gradeLevel: number | string | undefined): string {
  if (!gradeLevel) return '';
  const grade = String(gradeLevel);
  return GRADE_UNICODE_CIRCLES[grade] || grade; // Fallback to plain number for 7+
}

/**
 * Format frequency number
 * @param frequency - Frequency number
 * @returns Formatted string like "123" or empty string if undefined
 */
export function formatFrequency(frequency: number | undefined): string {
  if (frequency === undefined || frequency === null) return '';
  return `${frequency}`;
}
