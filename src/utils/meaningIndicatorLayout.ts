/**
 * Meaning Indicator Layout Calculation
 *
 * Implements the space expansion cascade logic for extended indicators (Board Mode).
 * Rules:
 * - Rule 1: Truncate long text with '..' suffix (space-based)
 * - Rule 2: Fixed zones: English LEFT, Vietnamese RIGHT, Han-Viet BOTTOM
 * - Rule 3: If indicator disabled/empty, others expand (Priority: English→HanViet→Vietnamese)
 * - Rule 4: Empty indicators free up space for cascading indicators
 */

export interface IndicatorConfig {
  showEnglish: boolean;
  showVietnamese: boolean;
  showHanViet: boolean;
  hasEnglishData: boolean;
  hasVietnameseData: boolean;
  hasHanVietData: boolean;
}

export interface ZoneAllocation {
  english: {
    enabled: boolean;
    zone: 'left' | 'left-expanded' | 'none';
    heightPercent: number;
    widthPercent: number;
  };
  vietnamese: {
    enabled: boolean;
    zone: 'right' | 'right-expanded' | 'none';
    heightPercent: number;
    widthPercent: number;
  };
  hanViet: {
    enabled: boolean;
    zone: 'bottom' | 'bottom-expanded' | 'none';
    heightPercent: number;
    widthPercent: number;
  };
  kanjiZone: {
    heightPercent: number;
    widthPercent: number;
  };
}

/**
 * Calculate zone allocation based on which indicators are enabled/have data
 * Implements Rule 3 & 4: Space expansion with priority cascade
 *
 * Priority order:
 * 1. English Meaning (LEFT) - highest priority
 * 2. Han-Viet Meanings (BOTTOM) - medium priority
 * 3. Vietnamese Meaning (RIGHT) - lowest priority
 *
 * @param config Configuration of which indicators are enabled and have data
 * @returns Zone allocation with expansion rules applied
 */
export function calculateZoneAllocation(config: IndicatorConfig): ZoneAllocation {
  // Determine what has data and is enabled
  const englishActive = config.showEnglish && config.hasEnglishData;
  const hanVietActive = config.showHanViet && config.hasHanVietData;
  const vietnameseActive = config.showVietnamese && config.hasVietnameseData;

  // Initialize all zones as disabled
  const zones: ZoneAllocation = {
    english: { enabled: false, zone: 'none', heightPercent: 0, widthPercent: 0 },
    vietnamese: { enabled: false, zone: 'none', heightPercent: 0, widthPercent: 0 },
    hanViet: { enabled: false, zone: 'none', heightPercent: 0, widthPercent: 0 },
    kanjiZone: { heightPercent: 100, widthPercent: 100 },
  };

  // Base zone dimensions (in percentages of card space)
  const baseLeftWidth = 15;      // LEFT zone: 15% of card width
  const baseRightWidth = 15;     // RIGHT zone: 15% of card width
  const baseBottomHeight = 25;   // BOTTOM zone: 25% of card height
  const baseKanjiHeight = 75;    // Kanji occupies 75% height

  // Priority 1: English Meaning (LEFT)
  if (englishActive) {
    zones.english = {
      enabled: true,
      zone: 'left',
      heightPercent: baseKanjiHeight,
      widthPercent: baseLeftWidth,
    };
  }

  // Priority 2: Han-Viet Meanings (BOTTOM)
  if (hanVietActive) {
    // Check if can expand left space (if English not taking space)
    const canExpandLeft = !englishActive;
    zones.hanViet = {
      enabled: true,
      zone: canExpandLeft ? 'bottom-expanded' : 'bottom',
      heightPercent: baseBottomHeight,
      widthPercent: 100, // Takes full width
    };
  }

  // Priority 3: Vietnamese Meaning (RIGHT)
  if (vietnameseActive) {
    // Check if can expand right space (depends on what's below)
    const rightSpaceTaken = englishActive; // Is LEFT taken?
    zones.vietnamese = {
      enabled: true,
      zone: rightSpaceTaken ? 'right' : 'right-expanded',
      heightPercent: baseKanjiHeight,
      widthPercent: baseRightWidth,
    };
  }

  // Calculate kanji zone based on what's taking space
  let kanjiHeight = 100;
  let kanjiWidth = 100;

  // Adjust height if Han-Viet is taking bottom space
  if (zones.hanViet.enabled) {
    kanjiHeight = 100 - zones.hanViet.heightPercent;
  }

  // Adjust width based on left/right indicators
  if (zones.english.enabled && zones.vietnamese.enabled) {
    // Both sides: kanji takes middle space
    kanjiWidth = 100 - baseLeftWidth - baseRightWidth;
  } else if (zones.english.enabled) {
    // Only left: kanji takes middle + right space
    kanjiWidth = 100 - baseLeftWidth;
  } else if (zones.vietnamese.enabled) {
    // Only right: kanji takes middle + left space
    kanjiWidth = 100 - baseRightWidth;
  }

  zones.kanjiZone = {
    heightPercent: kanjiHeight,
    widthPercent: kanjiWidth,
  };

  return zones;
}

/**
 * Truncate text to fit within a given width with ellipsis
 * Implements Rule 1: Truncate with '..' suffix
 *
 * This uses an approximation based on average character width.
 * For accurate measurement, use actual text rendering measurements.
 *
 * @param text Text to truncate
 * @param maxWidthPx Maximum width in pixels
 * @param fontSize Font size in pixels
 * @returns Truncated text with '..' suffix if needed
 */
export function truncateMeaningText(
  text: string,
  maxWidthPx: number,
  fontSize: number
): string {
  if (!text) return '';

  // Estimate character width based on font size
  // This is approximate; real implementation should measure actual text
  const charWidth = fontSize * 0.5; // Rough estimate: ~50% of font size

  // Calculate max characters that fit
  const maxChars = Math.floor(maxWidthPx / charWidth);

  // If text fits, return as-is
  if (text.length <= maxChars) {
    return text;
  }

  // Truncate and add '..' suffix
  // Ensure we have at least room for '..'
  const truncateAt = Math.max(1, maxChars - 2);
  return text.substring(0, truncateAt) + '..';
}

/**
 * Calculate font size for meaning indicators based on base size and multipliers
 *
 * @param baseSize Base size in pixels
 * @param columnMultiplier Multiplier based on column count (e.g., 1.25 for 4 columns)
 * @returns Calculated font size in pixels
 */
export function calculateMeaningFontSize(
  baseSize: number,
  columnMultiplier: number = 1.0
): number {
  return baseSize * columnMultiplier;
}

/**
 * Get zone dimensions for rendering based on allocation
 *
 * @param allocation Zone allocation from calculateZoneAllocation()
 * @param cardWidthPx Card width in pixels
 * @param cardHeightPx Card height in pixels
 * @returns Dimensions for each zone
 */
export interface ZoneDimensions {
  english: { top: number; left: number; width: number; height: number };
  vietnamese: { top: number; right: number; width: number; height: number };
  hanViet: { bottom: number; left: number; width: number; height: number };
  kanji: { top: number; left: number; width: number; height: number };
}

export function getZoneDimensions(
  allocation: ZoneAllocation,
  cardWidthPx: number,
  cardHeightPx: number
): ZoneDimensions {
  const leftWidth = (allocation.english.widthPercent / 100) * cardWidthPx;
  const rightWidth = (allocation.vietnamese.widthPercent / 100) * cardWidthPx;
  const bottomHeight = (allocation.hanViet.heightPercent / 100) * cardHeightPx;
  const topHeight = (allocation.kanjiZone.heightPercent / 100) * cardHeightPx;
  const middleWidth = (allocation.kanjiZone.widthPercent / 100) * cardWidthPx;

  // Calculate starting positions
  let kanjiLeft = 0;
  if (allocation.english.enabled) {
    kanjiLeft = leftWidth;
  }

  return {
    english: {
      top: 0,
      left: 0,
      width: leftWidth,
      height: topHeight,
    },
    vietnamese: {
      top: 0,
      right: 0,
      width: rightWidth,
      height: topHeight,
    },
    hanViet: {
      bottom: 0,
      left: 0,
      width: cardWidthPx,
      height: bottomHeight,
    },
    kanji: {
      top: 0,
      left: kanjiLeft,
      width: middleWidth,
      height: topHeight,
    },
  };
}

/**
 * Check if any meaning indicators are active
 *
 * @param config Indicator configuration
 * @returns True if at least one meaning indicator is active
 */
export function hasActiveMeaningIndicators(config: IndicatorConfig): boolean {
  return (
    (config.showEnglish && config.hasEnglishData) ||
    (config.showVietnamese && config.hasVietnameseData) ||
    (config.showHanViet && config.hasHanVietData)
  );
}

/**
 * Get text orientation for a zone
 *
 * LEFT and RIGHT zones use vertical text (top-to-bottom)
 * BOTTOM zone uses horizontal text (left-to-right)
 *
 * @param zone Zone type
 * @returns CSS writing-mode value or normal
 */
export function getTextOrientation(zone: 'left' | 'right' | 'bottom' | 'kanji'): string {
  switch (zone) {
    case 'left':
    case 'right':
      return 'vertical-rl'; // Top-to-bottom, right-to-left (rotated)
    case 'bottom':
    case 'kanji':
    default:
      return 'horizontal-tb'; // Normal left-to-right
  }
}
