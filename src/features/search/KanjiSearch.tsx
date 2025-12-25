import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setSearchQuery, addKanji } from '../kanji/kanjiSlice';
import type { KanjiData } from '../kanji/kanjiSlice';
import { KanjiCard } from '../../components/screen/KanjiCard';

interface KanjiSearchProps {
  kanjiColors: Map<string, { header: string; body: string; border: string; chosenBorder: string; text: string }>;
}

export const KanjiSearch: React.FC<KanjiSearchProps> = ({ kanjiColors }) => {
  const dispatch = useAppDispatch();
  const allKanjis = useAppSelector((state) => state.kanji.allKanjis);
  const chosenKanjis = useAppSelector((state) => state.kanji.chosenKanjis);
  const searchQuery = useAppSelector((state) => state.kanji.searchQuery);
  const inputPanelSettings = useAppSelector((state) => state.displaySettings.inputPanel);
  
  const [localQuery, setLocalQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KanjiData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate actual font sizes from percentage sliders (same as InputPanel)
  const baseKanjiFontSize = 3;
  const kanjiFontSizePercentage = Math.max(60, Math.min(120, inputPanelSettings.kanjiSize));
  const calculatedKanjiSize = baseKanjiFontSize * (kanjiFontSizePercentage / 100);
  
  const baseHanVietSize = baseKanjiFontSize * 0.20; // 0.6rem
  const hanVietSizePercentage = Math.max(60, Math.min(120, inputPanelSettings.hanVietSize));
  const calculatedHanVietSize = baseHanVietSize * (hanVietSizePercentage / 100);

  // Fixed card size: always 4.05rem (same as InputPanel sections)
  const fixedCardSize = 4.05;

  // Debounce search: wait 300ms after user stops typing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      dispatch(setSearchQuery(localQuery));
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuery, dispatch]);

  // Perform search when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Normalize for Unicode-safe, case-insensitive search
    const normalizedQuery = searchQuery.toLowerCase().trim();

    const results = allKanjis.filter((kanji) => {
      const searchableFields = [
        kanji.kanji || '',
        kanji.sinoViet || '',
        kanji.meaning || '',
        kanji.vietnameseMeaning || '',
        kanji.frequency?.toString() || '',
      ];

      return searchableFields.some((field) =>
        field && field.toLowerCase().includes(normalizedQuery)
      );
    });

    // Deduplicate results: keep only first occurrence of each kanji character
    const seenKanjis = new Set();
    const uniqueResults = results.filter((kanji) => {
      if (seenKanjis.has(kanji.kanji)) {
        return false;
      }
      seenKanjis.add(kanji.kanji);
      return true;
    });

    setSearchResults(uniqueResults);
    setShowResults(true);
  }, [searchQuery, allKanjis]);

  const handleClear = () => {
    setLocalQuery('');
    dispatch(setSearchQuery(''));
    setSearchResults([]);
    setShowResults(false);
  };

  const handleKanjiClick = (kanji: KanjiData) => {
    // Check if already chosen
    const isAlreadyChosen = chosenKanjis.some((k) => k.kanji === kanji.kanji);

    if (isAlreadyChosen) {
      // Show toast message
      setToastMessage('This kanji was already chosen before');
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      // Add to chosen
      dispatch(addKanji(kanji));
      // Close search
      handleClear();
    }
  };

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="mb-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search kanji, han-viet, meaning, frequency..."
          className="w-full px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 font-bold text-xl"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="mt-3 border-2 border-blue-500 rounded-lg bg-gray-800 shadow-lg max-h-96 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-gray-200 mb-2">
                No data found
              </p>
              <p className="text-gray-400">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-sm text-gray-300 mb-3 font-semibold">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fill, ${fixedCardSize}rem)`,
                  gap: '4px',
                  justifyContent: 'center',
                }}
              >
                {searchResults.map((kanji) => {
                  const isChosen = chosenKanjis.some((k) => k.kanji === kanji.kanji);
                  const colors = kanjiColors.get(kanji.kanji) || {
                    header: '#4A5568',
                    body: '#718096',
                    border: '#4A5568',
                    chosenBorder: '#FFFFFF',
                    text: '#FFFFFF',
                  };
                  return (
                    <KanjiCard
                      key={kanji.kanji}
                      kanji={kanji}
                      isChosen={isChosen}
                      colors={colors}
                      onClick={() => handleKanjiClick(kanji)}
                      showAlreadyPicked={true}
                      kanjiFont={inputPanelSettings.kanjiFont}
                      kanjiSize={calculatedKanjiSize}
                      hanVietFont={inputPanelSettings.hanVietFont}
                      hanVietSize={calculatedHanVietSize}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
