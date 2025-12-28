/**
 * Category Chips Configuration
 * 
 * All 53 real categories with smart names and emojis for rotation system
 * Weighted by priority (beginner-friendly categories appear more often)
 */

export interface CategoryChip {
  label: string;
  query: string;
  weight: number; // Higher = more likely to appear (1-10)
}

export const CATEGORY_CHIPS: CategoryChip[] = [
  // High priority - beginner friendly (weight 10)
  { label: 'Food 🍱', query: 'category:food-ingredients-kitchen', weight: 10 },
  { label: 'Animals 🐕', query: 'category:animals-insects-birds-fish-pets-creatures-wildlife', weight: 10 },
  { label: 'Family 👨‍👩‍👧', query: 'category:family-people-friend-relations', weight: 10 },
  { label: 'Numbers ⏰', query: 'category:numbers-time-date-calendar-count', weight: 10 },
  { label: 'Colors 🎨', query: 'category:colors-visual-painting-shades-tints', weight: 10 },
  
  // Medium-high priority (weight 8)
  { label: 'Body 🧑', query: 'category:body-health-medicine', weight: 8 },
  { label: 'Nature 🌲', query: 'category:nature-elements-sightseeing', weight: 8 },
  { label: 'Weather ⛅', query: 'category:weather-nature-seasons', weight: 8 },
  { label: 'Eating 🍽️', query: 'category:eating-dining-meals-restaurants', weight: 8 },
  { label: 'Home 🏠', query: 'category:family-home-childcare-baby-play', weight: 8 },
  { label: 'Emotions 😊', query: 'category:emotions-feelings-happiness-love-states', weight: 8 },
  { label: 'Basic Verbs 🏃', query: 'category:verbs-basic', weight: 8 },
  
  // Medium priority (weight 6)
  { label: 'Directions 🧭', query: 'category:directions-positions-navigation', weight: 6 },
  { label: 'Transport 🚗', query: 'category:vehicles-train-car-travel-transport-driving-moving', weight: 6 },
  { label: 'Geography 🗺️', query: 'category:geography-places-countries-cities-mountains-rivers-lakes-landmarks', weight: 6 },
  { label: 'Education 📚', query: 'category:education-academic-learning-levels-school-research', weight: 6 },
  { label: 'Clothing 👔', query: 'category:clothing-fashion-dress-shoes-hat', weight: 6 },
  { label: 'Shopping 🛒', query: 'category:shopping-purchasing-commerce', weight: 6 },
  { label: 'Work 💼', query: 'category:work-office-banking-legal', weight: 6 },
  { label: 'Occupations 👨‍💼', query: 'category:occupations-jobs-employment-company', weight: 6 },
  
  // Lower priority (weight 4)
  { label: 'Action Verbs ⚡', query: 'category:verbs-action', weight: 4 },
  { label: 'Basic Adjectives ✨', query: 'category:adjectives-basic', weight: 4 },
  { label: 'Sizes & Shapes 📐', query: 'category:adjectives-sizes-shapes-colors', weight: 4 },
  { label: 'Appearance 👤', query: 'category:adjectives-appearance-personality', weight: 4 },
  { label: 'Conditions 🔄', query: 'category:adjectives-conditions', weight: 4 },
  { label: 'Farming 🌾', query: 'category:farming-fishing-crops-gardening-flowers-fruits-vegetables-trees', weight: 4 },
  { label: 'Buildings 🏢', query: 'category:housing-buildings-architecture', weight: 4 },
  { label: 'Entertainment 🎮', query: 'category:entertainment-games-hobby-relax', weight: 4 },
  { label: 'Arts 🎭', query: 'category:arts-music-sports-culture-activities', weight: 4 },
  { label: 'Phone 📱', query: 'category:phone-call-communication-interview-dialog', weight: 4 },
  { label: 'Media 📰', query: 'category:media-writing-journalism-internet-newspaper-news', weight: 4 },
  
  // Specialized (weight 3)
  { label: 'Cooking 🍳', query: 'category:cooking-preparation-recipes', weight: 3 },
  { label: 'Drinking ☕', query: 'category:drinking-beverages-alcohol', weight: 3 },
  { label: 'Healthcare 🏥', query: 'category:health-care-dental-emergency', weight: 3 },
  { label: 'Materials ⚙️', query: 'category:materials-metals-substances', weight: 3 },
  { label: 'Math 🧮', query: 'category:measurements-math-calculation-units', weight: 3 },
  { label: 'Politics ⚖️', query: 'category:politics-law-government-police', weight: 3 },
  { label: 'Economics 💰', query: 'category:economics-finance-money-business', weight: 3 },
  { label: 'History 📜', query: 'category:history-culture-events', weight: 3 },
  { label: 'Construction 🏗️', query: 'category:construction-engineering-technology', weight: 3 },
  { label: 'Storage 📦', query: 'category:storage-preservation-containers', weight: 3 },
  { label: 'Household 🧹', query: 'category:household-chores-cleaning-maintenance', weight: 3 },
  { label: 'Mail 📮', query: 'category:mail-post-delivery-tracking-shipping', weight: 3 },
  
  // Abstract (weight 2)
  { label: 'Philosophy 🤔', query: 'category:abstract-philosophy-truth-justice-virtue', weight: 2 },
  { label: 'Qualities 💎', query: 'category:abstract-qualities-attributes-characteristics', weight: 2 },
  { label: 'Quantity 📊', query: 'category:abstract-quantity-amount-measure', weight: 2 },
  { label: 'Time ⏳', query: 'category:abstract-time-duration-temporal', weight: 2 },
  { label: 'Causation 🔗', query: 'category:abstract-causation-reason-logic', weight: 2 },
  
  // Social (weight 2)
  { label: 'Hierarchy 👑', query: 'category:social-hierarchy-rank-class-status', weight: 2 },
  { label: 'Organizations 🏛️', query: 'category:social-organizations-groups-associations', weight: 2 },
  { label: 'Community 🤝', query: 'category:social-community-neighborhood-local', weight: 2 },
  { label: 'Cooperation 🫱🏻‍🫲🏼', query: 'category:social-cooperation-conflict-interaction', weight: 2 },
  { label: 'Networking 🎉', query: 'category:social-relationships-party-speaking-networking-events', weight: 2 },
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
