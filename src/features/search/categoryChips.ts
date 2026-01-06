/**
 * Category Chips Configuration
 * 
 * All 53 real categories with smart names and emojis for rotation system
 * Weighted by priority (beginner-friendly categories appear more often)
 */

export interface CategoryChip {
  labelKey: string; // Translation key (e.g., 'food')
  emoji: string; // Emoji to display
  query: string;
  weight: number; // Higher = more likely to appear (1-10)
}

export const CATEGORY_CHIPS: CategoryChip[] = [
  // High priority - beginner friendly (weight 10)
  { labelKey: 'food', emoji: '🍱', query: 'category:food-ingredients-kitchen', weight: 10 },
  { labelKey: 'animals', emoji: '🐕', query: 'category:animals-insects-birds-fish-pets-creatures-wildlife', weight: 10 },
  { labelKey: 'family', emoji: '👨‍👩‍👧', query: 'category:family-people-friend-relations', weight: 10 },
  { labelKey: 'numbers', emoji: '⏰', query: 'category:numbers-time-date-calendar-count', weight: 10 },
  { labelKey: 'colors', emoji: '🎨', query: 'category:colors-visual-painting-shades-tints', weight: 10 },
  
  // Medium-high priority (weight 8)
  { labelKey: 'body', emoji: '🧑', query: 'category:body-health-medicine', weight: 8 },
  { labelKey: 'nature', emoji: '🌲', query: 'category:nature-elements-sightseeing', weight: 8 },
  { labelKey: 'weather', emoji: '⛅', query: 'category:weather-nature-seasons', weight: 8 },
  { labelKey: 'eating', emoji: '🍽️', query: 'category:eating-dining-meals-restaurants', weight: 8 },
  { labelKey: 'home', emoji: '🏠', query: 'category:family-home-childcare-baby-play', weight: 8 },
  { labelKey: 'emotions', emoji: '😊', query: 'category:emotions-feelings-happiness-love-states', weight: 8 },
  { labelKey: 'basic_verbs', emoji: '🏃', query: 'category:verbs-basic', weight: 8 },
  
  // Medium priority (weight 6)
  { labelKey: 'directions', emoji: '🧭', query: 'category:directions-positions-navigation', weight: 6 },
  { labelKey: 'transport', emoji: '🚗', query: 'category:vehicles-train-car-travel-transport-driving-moving', weight: 6 },
  { labelKey: 'geography', emoji: '🗺️', query: 'category:geography-places-countries-cities-mountains-rivers-lakes-landmarks', weight: 6 },
  { labelKey: 'education', emoji: '📚', query: 'category:education-academic-learning-levels-school-research', weight: 6 },
  { labelKey: 'clothing', emoji: '👔', query: 'category:clothing-fashion-dress-shoes-hat', weight: 6 },
  { labelKey: 'shopping', emoji: '🛒', query: 'category:shopping-purchasing-commerce', weight: 6 },
  { labelKey: 'work', emoji: '💼', query: 'category:work-office-banking-legal', weight: 6 },
  { labelKey: 'occupations', emoji: '👨‍💼', query: 'category:occupations-jobs-employment-company', weight: 6 },
  
  // Lower priority (weight 4)
  { labelKey: 'action_verbs', emoji: '⚡', query: 'category:verbs-action', weight: 4 },
  { labelKey: 'basic_adjectives', emoji: '✨', query: 'category:adjectives-basic', weight: 4 },
  { labelKey: 'sizes_shapes', emoji: '📐', query: 'category:adjectives-sizes-shapes-colors', weight: 4 },
  { labelKey: 'appearance', emoji: '👤', query: 'category:adjectives-appearance-personality', weight: 4 },
  { labelKey: 'conditions', emoji: '🔄', query: 'category:adjectives-conditions', weight: 4 },
  { labelKey: 'farming', emoji: '🌾', query: 'category:farming-fishing-crops-gardening-flowers-fruits-vegetables-trees', weight: 4 },
  { labelKey: 'buildings', emoji: '🏢', query: 'category:housing-buildings-architecture', weight: 4 },
  { labelKey: 'entertainment', emoji: '🎮', query: 'category:entertainment-games-hobby-relax', weight: 4 },
  { labelKey: 'arts', emoji: '🎭', query: 'category:arts-music-sports-culture-activities', weight: 4 },
  { labelKey: 'phone', emoji: '📱', query: 'category:phone-call-communication-interview-dialog', weight: 4 },
  { labelKey: 'media', emoji: '📰', query: 'category:media-writing-journalism-internet-newspaper-news', weight: 4 },
  
  // Specialized (weight 3)
  { labelKey: 'cooking', emoji: '🍳', query: 'category:cooking-preparation-recipes', weight: 3 },
  { labelKey: 'drinking', emoji: '☕', query: 'category:drinking-beverages-alcohol', weight: 3 },
  { labelKey: 'healthcare', emoji: '🏥', query: 'category:health-care-dental-emergency', weight: 3 },
  { labelKey: 'materials', emoji: '⚙️', query: 'category:materials-metals-substances', weight: 3 },
  { labelKey: 'math', emoji: '🧮', query: 'category:measurements-math-calculation-units', weight: 3 },
  { labelKey: 'politics', emoji: '⚖️', query: 'category:politics-law-government-police', weight: 3 },
  { labelKey: 'economics', emoji: '💰', query: 'category:economics-finance-money-business', weight: 3 },
  { labelKey: 'history', emoji: '📜', query: 'category:history-culture-events', weight: 3 },
  { labelKey: 'construction', emoji: '🏗️', query: 'category:construction-engineering-technology', weight: 3 },
  { labelKey: 'storage', emoji: '📦', query: 'category:storage-preservation-containers', weight: 3 },
  { labelKey: 'household', emoji: '🧹', query: 'category:household-chores-cleaning-maintenance', weight: 3 },
  { labelKey: 'mail', emoji: '📮', query: 'category:mail-post-delivery-tracking-shipping', weight: 3 },
  
  // Abstract (weight 2)
  { labelKey: 'philosophy', emoji: '🤔', query: 'category:abstract-philosophy-truth-justice-virtue', weight: 2 },
  { labelKey: 'qualities', emoji: '💎', query: 'category:abstract-qualities-attributes-characteristics', weight: 2 },
  { labelKey: 'quantity', emoji: '📊', query: 'category:abstract-quantity-amount-measure', weight: 2 },
  { labelKey: 'time', emoji: '⏳', query: 'category:abstract-time-duration-temporal', weight: 2 },
  { labelKey: 'causation', emoji: '🔗', query: 'category:abstract-causation-reason-logic', weight: 2 },
  
  // Social (weight 2)
  { labelKey: 'hierarchy', emoji: '👑', query: 'category:social-hierarchy-rank-class-status', weight: 2 },
  { labelKey: 'organizations', emoji: '🏛️', query: 'category:social-organizations-groups-associations', weight: 2 },
  { labelKey: 'community', emoji: '🤝', query: 'category:social-community-neighborhood-local', weight: 2 },
  { labelKey: 'cooperation', emoji: '🫱🏻‍🫲🏼', query: 'category:social-cooperation-conflict-interaction', weight: 2 },
  { labelKey: 'networking', emoji: '🎉', query: 'category:social-relationships-party-speaking-networking-events', weight: 2 },
];

/**
 * Get random weighted selection of category chips
 * @param count Number of chips to select
 * @param exclude Array of queries to exclude from selection
 * @returns Array of selected CategoryChip objects
 */
export function getRandomCategoryChips(count: number, exclude: string[] = []): CategoryChip[] {
  const available = CATEGORY_CHIPS.filter(chip => !exclude.includes(chip.query));
  
  // Create weighted pool (chip appears N times based on weight)
  const weightedPool: CategoryChip[] = [];
  available.forEach(chip => {
    for (let i = 0; i < chip.weight; i++) {
      weightedPool.push(chip);
    }
  });
  
  // Fisher-Yates shuffle
  for (let i = weightedPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];
  }
  
  // Select unique chips (deduplicate by query)
  const selected: CategoryChip[] = [];
  const seenQueries = new Set<string>();
  
  for (const chip of weightedPool) {
    if (!seenQueries.has(chip.query)) {
      selected.push(chip);
      seenQueries.add(chip.query);
      if (selected.length >= count) break;
    }
  }
  
  return selected;
}
