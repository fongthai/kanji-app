/**
 * Search Examples and Quick Filters for KQL Search
 * 
 * These are used in the MinimalSearch component to provide:
 * - Rotating example queries (shown below the search box)
 * - Static quick filter chips (JLPT, KOTY, Top 100)
 * - Rotating category chips (dynamically selected from categoryChips.ts)
 */

// Rotating example queries (shown as "ⓘ Try: ..." below search box)
// These rotate every 5 seconds to give users search ideas
export const EXAMPLES = [
  'hanviet:PHONG',
  'en:fly & jlpt:N5',
  'freq:<1000',
  'category:food-ingredients-kitchen',
  'on:コウ | kun:い',
  'com:水 & jlpt:N5',
  '(jlpt:N5 | jlpt:N4) & category:animals-insects-birds-fish-pets-creatures-wildlife',
];

// Static quick filter chips (always shown)
export const STATIC_FILTERS = [
  { label: 'N5', query: 'jlpt:N5' },
  { label: 'N4', query: 'jlpt:N4' },
  { label: 'Top 100 ⭐', query: 'freq:<100' },
  { label: 'KOTY 2025 🏆', query: 'freq:<21' }, // Top 20 most frequent kanjis (KOTY 2025)
];

// Note: Category chips are now dynamically rotated from categoryChips.ts
// See getRandomCategoryChips() for rotation logic
