/**
 * PDF Meaning Layout Utilities
 *
 * Calculates word-by-word overflow for meaning indicators in PDF export
 * Implements the same priority-based overflow logic as the on-screen version
 *
 * Priority Order: English (highest) > Han-Viet > Vietnamese (lowest)
 */

/**
 * Estimate text width for PDF rendering
 * Uses character-based estimation since we can't use DOM in PDF generation
 *
 * @param text Text to measure
 * @param fontSizePt Font size in points
 * @returns Estimated width in points
 */
function estimateTextWidth(text: string, fontSizePt: number): number {
  // Average character width is approximately 0.5-0.6x font size
  // Vietnamese diacritics are slightly wider, use 0.6x
  const avgCharWidth = fontSizePt * 0.6;
  return text.length * avgCharWidth;
}

/**
 * Fit words into a zone with given width
 * Returns fitted words and overflow words
 */
function fitWordsInZone(
  words: string[],
  maxWidthPt: number,
  fontSizePt: number,
  separator: string = ', '
): { fitted: string[]; overflow: string[] } {
  if (words.length === 0) return { fitted: [], overflow: [] };

  const fitted: string[] = [];
  let currentWidth = 0;
  const separatorWidth = estimateTextWidth(separator, fontSizePt);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordWidth = estimateTextWidth(word, fontSizePt);
    const addedWidth = i > 0 ? separatorWidth + wordWidth : wordWidth;

    // First word always fits (will be truncated by PDF if needed)
    if (i === 0) {
      fitted.push(word);
      currentWidth = wordWidth;
      continue;
    }

    if (currentWidth + addedWidth <= maxWidthPt) {
      fitted.push(word);
      currentWidth += addedWidth;
    } else {
      // Overflow starts here
      return { fitted, overflow: words.slice(i) };
    }
  }

  return { fitted, overflow: [] };
}

/**
 * Calculate meaning layout for PDF with overflow
 * Implements priority-based overflow (English > Han-Viet > Vietnamese)
 */
export interface PDFMeaningLayout {
  english: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  hanViet: {
    top: string;
    left: string;
    right: string;
    bottom: string;
  };
  vietnamese: {
    top: string;
    left: string;
    right: string;
    bottom: string;
  };
}

export interface PDFMeaningConfig {
  englishMeanings: string[];
  vietnameseMeanings: string[];
  hanVietMeanings: string[];
  showEnglish: boolean;
  showVietnamese: boolean;
  showHanViet: boolean;
  hasIndicators: boolean;    // TRUE if any indicator checkbox is ON
  topZoneWidthPt: number;    // Width of TOP zone in points (horizontal text)
  sideZoneWidthPt: number;   // Width of LEFT/RIGHT zones in points (vertical text height)
  bottomZoneWidthPt: number; // Width of BOTTOM zone in points (horizontal text)
  englishFontSizePt: number;
  vietnameseFontSizePt: number;
  hanVietFontSizePt: number;
}

export function calculatePDFMeaningLayout(config: PDFMeaningConfig): PDFMeaningLayout {
  const layout: PDFMeaningLayout = {
    english: { top: '', right: '', bottom: '', left: '' },
    hanViet: { top: '', left: '', right: '', bottom: '' },
    vietnamese: { top: '', left: '', right: '', bottom: '' },
  };

  // LEFT zone is only available when NO indicators are showing
  const leftZoneAvailable = !config.hasIndicators;

  // Early return if no meanings to show
  if (!config.showEnglish && !config.showVietnamese && !config.showHanViet) {
    return layout;
  }

  // Phase 1: Calculate PRIMARY zone allocations
  // English: Always TOP zone (horizontal text)
  const englishPrimary = config.showEnglish && config.englishMeanings.length > 0
    ? fitWordsInZone(config.englishMeanings, config.topZoneWidthPt, config.englishFontSizePt)
    : { fitted: [], overflow: [] };

  // Vietnamese: PRIMARY depends on whether English is showing
  // - If English ON: RIGHT zone (vertical)
  // - If English OFF: TOP zone (horizontal)
  let vietnamesePrimary: { fitted: string[]; overflow: string[] };
  if (config.showVietnamese && config.vietnameseMeanings.length > 0) {
    if (config.showEnglish) {
      // English is ON: Vietnamese primary = RIGHT zone
      vietnamesePrimary = fitWordsInZone(config.vietnameseMeanings, config.sideZoneWidthPt, config.vietnameseFontSizePt);
    } else {
      // English is OFF: Vietnamese primary = TOP zone
      vietnamesePrimary = fitWordsInZone(config.vietnameseMeanings, config.topZoneWidthPt, config.vietnameseFontSizePt);
    }
  } else {
    vietnamesePrimary = { fitted: [], overflow: [] };
  }

  // Han-Viet: Always BOTTOM zone (horizontal text)
  const hanVietPrimary = config.showHanViet && config.hanVietMeanings.length > 0
    ? fitWordsInZone(config.hanVietMeanings, config.bottomZoneWidthPt, config.hanVietFontSizePt)
    : { fitted: [], overflow: [] };

  // Phase 2: Assign PRIMARY zones
  layout.english.top = englishPrimary.fitted.join(', ');

  if (config.showVietnamese && vietnamesePrimary.fitted.length > 0) {
    if (config.showEnglish) {
      layout.vietnamese.right = vietnamesePrimary.fitted.join(', ');
    } else {
      layout.vietnamese.top = vietnamesePrimary.fitted.join(', ');
    }
  }

  layout.hanViet.bottom = hanVietPrimary.fitted.join(', ');

  // Phase 3: Handle OVERFLOW with priority cascade
  // PRIORITY ORDER:
  // 1. English: TOP → RIGHT → BOTTOM → LEFT (if freed)
  // 2. Han-Viet: BOTTOM → TOP → RIGHT → LEFT (if freed)
  // 3. Vietnamese:
  //    - If English ON: RIGHT → BOTTOM → LEFT (if freed)
  //    - If English OFF: TOP → RIGHT → BOTTOM → LEFT (if freed)
  // LEFT zone only available when NO indicators showing

  // ========== Priority 1: English overflow ==========
  let englishRemaining = englishPrimary.overflow;
  if (config.showEnglish && englishRemaining.length > 0) {
    // Try RIGHT zone (if Vietnamese not using it)
    if (!layout.vietnamese.right) {
      const fit = fitWordsInZone(englishRemaining, config.sideZoneWidthPt, config.englishFontSizePt);
      layout.english.right = fit.fitted.join(', ');
      englishRemaining = fit.overflow;
    }

    // Try BOTTOM zone (if Han-Viet not using it)
    if (englishRemaining.length > 0 && !layout.hanViet.bottom) {
      const fit = fitWordsInZone(englishRemaining, config.bottomZoneWidthPt, config.englishFontSizePt);
      layout.english.bottom = fit.fitted.join(', ');
      englishRemaining = fit.overflow;
    }

    // Try LEFT zone (only if available - no indicators)
    if (englishRemaining.length > 0 && leftZoneAvailable) {
      const fit = fitWordsInZone(englishRemaining, config.sideZoneWidthPt, config.englishFontSizePt);
      layout.english.left = fit.fitted.join(', ');
    }
  }

  // ========== Priority 2: Han-Viet overflow ==========
  let hanVietRemaining = hanVietPrimary.overflow;
  if (config.showHanViet && hanVietRemaining.length > 0) {
    // Try TOP zone (if English and Vietnamese not using it)
    if (!layout.english.top && !layout.vietnamese.top) {
      const fit = fitWordsInZone(hanVietRemaining, config.topZoneWidthPt, config.hanVietFontSizePt);
      layout.hanViet.top = fit.fitted.join(', ');
      hanVietRemaining = fit.overflow;
    }

    // Try RIGHT zone (if Vietnamese and English not using it)
    if (hanVietRemaining.length > 0 && !layout.vietnamese.right && !layout.english.right) {
      const fit = fitWordsInZone(hanVietRemaining, config.sideZoneWidthPt, config.hanVietFontSizePt);
      layout.hanViet.right = fit.fitted.join(', ');
      hanVietRemaining = fit.overflow;
    }

    // Try LEFT zone (if available - no indicators, and English not using it)
    if (hanVietRemaining.length > 0 && leftZoneAvailable && !layout.english.left) {
      const fit = fitWordsInZone(hanVietRemaining, config.sideZoneWidthPt, config.hanVietFontSizePt);
      layout.hanViet.left = fit.fitted.join(', ');
    }
  }

  // ========== Priority 3: Vietnamese overflow ==========
  let vietnameseRemaining = vietnamesePrimary.overflow;
  if (config.showVietnamese && vietnameseRemaining.length > 0) {
    if (config.showEnglish) {
      // English ON: Vietnamese primary is RIGHT, overflow to BOTTOM → LEFT
      // Try BOTTOM zone (if Han-Viet and English not using it)
      if (!layout.hanViet.bottom && !layout.english.bottom) {
        const fit = fitWordsInZone(vietnameseRemaining, config.bottomZoneWidthPt, config.vietnameseFontSizePt);
        layout.vietnamese.bottom = fit.fitted.join(', ');
        vietnameseRemaining = fit.overflow;
      }

      // Try LEFT zone (if available and not used by English/Han-Viet)
      if (vietnameseRemaining.length > 0 && leftZoneAvailable && !layout.english.left && !layout.hanViet.left) {
        const fit = fitWordsInZone(vietnameseRemaining, config.sideZoneWidthPt, config.vietnameseFontSizePt);
        layout.vietnamese.left = fit.fitted.join(', ');
      }
    } else {
      // English OFF: Vietnamese primary is TOP, overflow to RIGHT → BOTTOM → LEFT
      // Try RIGHT zone (if not used by Han-Viet)
      if (!layout.hanViet.right) {
        const fit = fitWordsInZone(vietnameseRemaining, config.sideZoneWidthPt, config.vietnameseFontSizePt);
        layout.vietnamese.right = fit.fitted.join(', ');
        vietnameseRemaining = fit.overflow;
      }

      // Try BOTTOM zone (if not used by Han-Viet)
      if (vietnameseRemaining.length > 0 && !layout.hanViet.bottom) {
        const fit = fitWordsInZone(vietnameseRemaining, config.bottomZoneWidthPt, config.vietnameseFontSizePt);
        layout.vietnamese.bottom = fit.fitted.join(', ');
        vietnameseRemaining = fit.overflow;
      }

      // Try LEFT zone (if available and not used by Han-Viet)
      if (vietnameseRemaining.length > 0 && leftZoneAvailable && !layout.hanViet.left) {
        const fit = fitWordsInZone(vietnameseRemaining, config.sideZoneWidthPt, config.vietnameseFontSizePt);
        layout.vietnamese.left = fit.fitted.join(', ');
      }
    }
  }

  return layout;
}
