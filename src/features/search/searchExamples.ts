/**
 * Search Examples and Quick Filters for KQL Search
 * 
 * These are used in the MinimalSearch component to provide:
 * - Rotating example queries (shown below the search box)
 * - Quick filter chips (preset buttons for common searches)
 */

// Rotating example queries (shown as "ⓘ Try: ..." below search box)
// These rotate every 5 seconds to give users search ideas
export const EXAMPLES = [
  'hanviet:PHONG',
  'en:fly & jlpt:N5',
  'freq:<1000',
  'category:actions',
  'on:コウ | kun:い',
  'com:水 & jlpt:N5',
  '(jlpt:N5 | jlpt:N4) & !category:numbers',
];

// Quick filter chips (clickable preset buttons)
// These appear as colored chips below the search box
export const QUICK_FILTERS = [
  { label: 'N5', query: 'jlpt:N5' },
  { label: 'N4', query: 'jlpt:N4' },
  { label: 'Actions', query: 'category:actions' },
  { label: 'Numbers', query: 'category:numbers' },
  { label: 'Frequency <500', query: 'freq:<500' },
];
