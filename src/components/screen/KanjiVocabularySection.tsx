import React from 'react';
import type { KanjiData } from '../../features/kanji/kanjiSlice';

interface KanjiVocabularySectionProps {
  kanji: KanjiData;
  availableWidth: number;
  availableHeight: number; // Match WritingTable height
}

/**
 * KanjiVocabularySection - Displays vocabulary related to a kanji
 *
 * Purpose: Clean, modular component for displaying kanji-related vocabulary.
 * Easy to expand later with real vocabulary logic.
 *
 * Current State: Placeholder UI
 * Future: Will fetch and display vocabularies using this kanji
 */
export const KanjiVocabularySection = React.memo<KanjiVocabularySectionProps>(({
  kanji: _kanji, // Will be used for vocabulary fetching in the future
  availableWidth,
  availableHeight,
}) => {
  return (
    <div
      className="kanji-vocabulary-section border border-gray-300 bg-white flex flex-col"
      style={{
        width: `${availableWidth}px`,
        height: `${availableHeight}px`,
      }}
    >
      {/* Placeholder content - easy to replace later */}
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-400 text-sm text-center">
          Vocabulary section
        </p>
        <p className="text-gray-300 text-xs text-center mt-1">
          (Coming soon)
        </p>
      </div>
    </div>
  );
});

KanjiVocabularySection.displayName = 'KanjiVocabularySection';
