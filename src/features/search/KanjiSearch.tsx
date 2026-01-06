import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addKanji } from '../kanji/kanjiSlice';
import type { KanjiData } from '../kanji/kanjiSlice';
import { KanjiCard } from '../../components/screen/KanjiCard';
import { MinimalSearch } from './MinimalSearch';

interface KanjiSearchProps {
  kanjiColors: Map<string, { header: string; body: string; border: string; chosenBorder: string; text: string }>;
}

export const KanjiSearch: React.FC<KanjiSearchProps> = ({ kanjiColors }) => {
  const { t } = useTranslation('controls');
  const dispatch = useAppDispatch();
  const chosenKanjis = useAppSelector((state) => state.kanji.chosenKanjis);
  const inputPanelSettings = useAppSelector((state) => state.displaySettings.inputPanel);
  
  const [searchResults, setSearchResults] = useState<KanjiData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate actual font sizes from percentage sliders (same as InputPanel)
  const baseKanjiFontSize = 3;
  const kanjiFontSizePercentage = Math.max(60, Math.min(120, inputPanelSettings.kanjiSize));
  const calculatedKanjiSize = baseKanjiFontSize * (kanjiFontSizePercentage / 100);
  
  const baseHanVietSize = baseKanjiFontSize * 0.20; // 0.6rem
  const hanVietSizePercentage = Math.max(60, Math.min(120, inputPanelSettings.hanVietSize));
  const calculatedHanVietSize = baseHanVietSize * (hanVietSizePercentage / 100);

  // Fixed card size: always 4.05rem (same as InputPanel sections)
  const fixedCardSize = 4.05;

  const handleResultsChange = (results: KanjiData[]) => {
    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleKanjiClick = (kanji: KanjiData) => {
    // Check if already chosen
    const isAlreadyChosen = chosenKanjis.some((k) => k.kanji === kanji.kanji);

    if (!isAlreadyChosen) {
      // Add to chosen
      dispatch(addKanji(kanji));
      // Show toast notification
      showToast(`Added ${kanji.kanji}`);
      // Keep results visible
    }
  };

  const handleAddAll = () => {
    const uniqueKanjis = searchResults.filter(
      (kanji) => !chosenKanjis.some((k) => k.kanji === kanji.kanji)
    );
    
    const alreadyChosenCount = searchResults.length - uniqueKanjis.length;
    
    // Add all unique kanjis
    uniqueKanjis.forEach((kanji) => {
      dispatch(addKanji(kanji));
    });

    // Show summary toast
    if (alreadyChosenCount > 0) {
      showToast(`Added ${uniqueKanjis.length} kanji${uniqueKanjis.length !== 1 ? 's' : ''} (${alreadyChosenCount} already chosen)`);
    } else {
      showToast(`Added ${uniqueKanjis.length} kanji${uniqueKanjis.length !== 1 ? 's' : ''}`);
    }
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Minimal Search Interface */}
      <MinimalSearch 
        onResultsChange={handleResultsChange}
      />

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="border-2 border-blue-500 rounded-lg bg-gray-800 shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2 bg-gray-700 border-b border-gray-600 flex justify-between items-center">
            <span className="text-white font-semibold text-sm">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found {searchResults.length >= 200 ? '(showing top 200)' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleAddAll}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                title={t('search.add_all_tooltip')}
              >
                {t('search.add_all')} {searchResults.length} ➕
              </button>
              <button
                onClick={handleClearResults}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                title={t('search.clear_results_tooltip')}
              >
                {t('search.clear_results')} ×
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, ${fixedCardSize}rem)`,
              gap: '4px',
              justifyContent: 'center',
              padding: '0.5rem',
            }}
          >
            {searchResults.map((kanji, index) => {
              const isChosen = chosenKanjis.some((k) => k.kanji === kanji.kanji);
              const colors = kanjiColors.get(kanji.kanji) || {
                header: '#4A5568',
                body: '#718096',
                border: '#4A5568',
                chosenBorder: '#FFFFFF',
                text: '#FFFFFF',
              };
              return (
                <div key={`${kanji.sectionName}-${kanji.kanji}-${index}`} className="relative">
                  <KanjiCard
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
                  {isChosen && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl border border-green-500 animate-fade-in z-50">
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-xl">✓</span>
            <span className="text-sm">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

