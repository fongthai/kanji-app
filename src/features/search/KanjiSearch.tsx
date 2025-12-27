import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addKanji } from '../kanji/kanjiSlice';
import type { KanjiData } from '../kanji/kanjiSlice';
import { KanjiCard } from '../../components/screen/KanjiCard';
import { MinimalSearch } from './MinimalSearch';

interface KanjiSearchProps {
  kanjiColors: Map<string, { header: string; body: string; border: string; chosenBorder: string; text: string }>;
}

export const KanjiSearch: React.FC<KanjiSearchProps> = ({ kanjiColors }) => {
  const dispatch = useAppDispatch();
  const chosenKanjis = useAppSelector((state) => state.kanji.chosenKanjis);
  const inputPanelSettings = useAppSelector((state) => state.displaySettings.inputPanel);
  
  const [searchResults, setSearchResults] = useState<KanjiData[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  const handleKanjiClick = (kanji: KanjiData) => {
    // Check if already chosen
    const isAlreadyChosen = chosenKanjis.some((k) => k.kanji === kanji.kanji);

    if (!isAlreadyChosen) {
      // Add to chosen
      dispatch(addKanji(kanji));
      // Clear results
      setSearchResults([]);
      setShowResults(false);
    }
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
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found {searchResults.length >= 50 ? '(showing top 50)' : ''}
            </span>
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
                <KanjiCard
                  key={`${kanji.sectionName}-${kanji.kanji}-${index}`}
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
  );
};

