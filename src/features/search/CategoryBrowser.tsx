import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { CATEGORY_CHIPS } from './categoryChips';

interface CategoryBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (query: string) => void;
}

// Hierarchical category groups
const CATEGORY_GROUPS = {
  'Beginner Friendly': [
    'category:food-ingredients-kitchen',
    'category:animals-insects-birds-fish-pets-creatures-wildlife',
    'category:family-people-friend-relations',
    'category:family-home-childcare-baby-play',
    'category:numbers-time-date-calendar-count',
    'category:colors-visual-painting-shades-tints',
    'category:body-health-medicine',
    'category:emotions-feelings-happiness-love-states',
  ],
  'Daily Life': [
    'category:eating-dining-meals-restaurants',
    'category:cooking-preparation-recipes',
    'category:drinking-beverages-alcohol',
    'category:shopping-purchasing-commerce',
    'category:household-chores-cleaning-maintenance',
    'category:storage-preservation-containers',
    'category:clothing-fashion-dress-shoes-hat',
  ],
  'Nature & Places': [
    'category:nature-elements-sightseeing',
    'category:weather-nature-seasons',
    'category:geography-places-countries-cities-mountains-rivers-lakes-landmarks',
    'category:farming-fishing-crops-gardening-flowers-fruits-vegetables-trees',
  ],
  'Verbs & Adjectives': [
    'category:verbs-basic',
    'category:verbs-action',
    'category:adjectives-basic',
    'category:adjectives-sizes-shapes-colors',
    'category:adjectives-appearance-personality',
    'category:adjectives-conditions',
  ],
  'Work & Education': [
    'category:work-office-banking-legal',
    'category:occupations-jobs-employment-company',
    'category:education-academic-learning-levels-school-research',
    'category:economics-finance-money-business',
  ],
  'Communication & Media': [
    'category:phone-call-communication-interview-dialog',
    'category:media-writing-journalism-internet-newspaper-news',
    'category:mail-post-delivery-tracking-shipping',
  ],
  'Social & Politics': [
    'category:social-relationships-party-speaking-networking-events',
    'category:social-hierarchy-rank-class-status',
    'category:social-organizations-groups-associations',
    'category:social-community-neighborhood-local',
    'category:social-cooperation-conflict-interaction',
    'category:politics-law-government-police',
  ],
  'Abstract Concepts': [
    'category:abstract-philosophy-truth-justice-virtue',
    'category:abstract-qualities-attributes-characteristics',
    'category:abstract-quantity-amount-measure',
    'category:abstract-time-duration-temporal',
    'category:abstract-causation-reason-logic',
  ],
  'Transportation & Travel': [
    'category:vehicles-train-car-travel-transport-driving-moving',
    'category:directions-positions-navigation',
  ],
  'Culture & Entertainment': [
    'category:arts-music-sports-culture-activities',
    'category:entertainment-games-hobby-relax',
    'category:history-culture-events',
  ],
  'Buildings & Construction': [
    'category:housing-buildings-architecture',
    'category:construction-engineering-technology',
  ],
  'Health & Medical': [
    'category:health-care-dental-emergency',
  ],
  'Materials & Measurement': [
    'category:materials-metals-substances',
    'category:measurements-math-calculation-units',
  ],
};

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({ isOpen, onClose, onApply }) => {
  const allKanjis = useAppSelector((state) => state.kanji.allKanjis);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Create a map of query -> label for easy lookup
  const queryToLabel = useMemo(() => {
    const map = new Map<string, string>();
    CATEGORY_CHIPS.forEach(chip => {
      map.set(chip.query, chip.label);
    });
    return map;
  }, []);

  // Count kanjis per category
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    CATEGORY_CHIPS.forEach(chip => {
      const categoryName = chip.query.replace('category:', '');
      const count = allKanjis.filter(kanji => 
        kanji.category && kanji.category.includes(categoryName)
      ).length;
      counts.set(chip.query, count);
    });
    return counts;
  }, [allKanjis]);

  // Calculate total unique kanjis for selected categories
  const totalKanjiCount = useMemo(() => {
    if (selectedCategories.size === 0) return 0;
    
    const uniqueKanjis = new Set<string>();
    Array.from(selectedCategories).forEach(query => {
      const categoryName = query.replace('category:', '');
      allKanjis.forEach(kanji => {
        if (kanji.category && kanji.category.includes(categoryName)) {
          uniqueKanjis.add(kanji.kanji);
        }
      });
    });
    
    return uniqueKanjis.size;
  }, [selectedCategories, allKanjis]);

  const handleToggleCategory = (query: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(query)) {
      newSelected.delete(query);
    } else {
      newSelected.add(query);
    }
    setSelectedCategories(newSelected);
  };

  const handleSelectAll = () => {
    const allQueries = CATEGORY_CHIPS.map(chip => chip.query);
    setSelectedCategories(new Set(allQueries));
  };

  const handleClearAll = () => {
    setSelectedCategories(new Set());
  };

  const handleApply = () => {
    if (selectedCategories.size === 0) return;
    
    // Combine with OR operator
    const query = Array.from(selectedCategories).join(' | ');
    onApply(query);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Category Browser</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select categories to filter kanjis
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Category Groups */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(CATEGORY_GROUPS).map(([groupName, queries]) => (
            <div key={groupName} className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                {groupName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {queries.map(query => {
                  const isSelected = selectedCategories.has(query);
                  const count = categoryCounts.get(query) || 0;
                  const label = queryToLabel.get(query) || query.replace('category:', '');
                  
                  return (
                    <label
                      key={query}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCategory(query)}
                        className="w-4 h-4"
                      />
                      <span className="flex-1 text-sm">{label}</span>
                      <span className="text-xs opacity-75">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="text-sm text-gray-300">
              <span className="font-semibold text-green-400">{selectedCategories.size}</span> categories selected
              {selectedCategories.size > 0 && (
                <span className="ml-2">
                  → <span className="font-semibold text-blue-400">{totalKanjiCount}</span> kanjis
                </span>
              )}
            </div>
            
            <button
              onClick={handleApply}
              disabled={selectedCategories.size === 0}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                selectedCategories.size === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
