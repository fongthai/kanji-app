/**
 * VocabularyCard Component
 *
 * Displays a vocabulary item in the InputPanel selection area
 */

import React from 'react';
import type { VocabularyData } from '../../types/vocabulary';
import { useAppSelector } from '../../app/hooks';

interface VocabularyCardProps {
  vocabulary: VocabularyData;
  isChosen: boolean;
  onClick?: () => void;
  colors?: {
    header: string;
    body: string;
    border: string;
    chosenBorder: string;
  };
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocabulary,
  isChosen,
  onClick,
  colors,
}) => {
  const showHanViet = useAppSelector(state => state.displaySettings.inputPanel.showHanViet);
  const showJlptIndicator = useAppSelector(state => state.displaySettings.inputPanel.showJlptIndicator);

  const defaultColors = {
    header: 'bg-gray-700',
    body: 'bg-gray-800',
    border: 'border-gray-600',
    chosenBorder: 'border-blue-500',
  };

  const cardColors = colors || defaultColors;

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-lg overflow-hidden
        border-2 transition-all duration-200
        ${isChosen ? cardColors.chosenBorder : cardColors.border}
        ${isChosen ? 'shadow-lg shadow-blue-500/20' : 'hover:border-gray-500'}
        ${onClick ? '' : 'cursor-default'}
      `}
      style={{
        minHeight: '4.5rem',
      }}
    >
      {/* JLPT Level Badge */}
      {showJlptIndicator && vocabulary.jlptLevel && (
        <div
          className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs font-semibold z-10"
          style={{
            backgroundColor: getJlptColor(vocabulary.jlptLevel),
            color: 'white',
          }}
        >
          {vocabulary.jlptLevel}
        </div>
      )}

      {/* Card Content */}
      <div className={`${cardColors.body} p-2`}>
        {/* Japanese Vocabulary */}
        <div className="text-base font-medium text-white mb-1 pr-10">
          {vocabulary.vocabulary}
        </div>

        {/* Furigana Reading */}
        <div className="text-sm text-gray-400 mb-1">
          {vocabulary.furigana}
        </div>

        {/* Han-Viet (if enabled) */}
        {showHanViet && vocabulary.hanViet && (
          <div className="text-xs text-blue-300 mb-1">
            {vocabulary.hanViet}
          </div>
        )}

        {/* Vietnamese Meaning (truncated) */}
        <div className="text-xs text-gray-300 line-clamp-2">
          {vocabulary.vietnameseMeaning || vocabulary.englishMeaning}
        </div>
      </div>

      {/* Already Chosen Indicator */}
      {isChosen && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 pointer-events-none" />
      )}
    </div>
  );
};

// Helper function to get JLPT level color
function getJlptColor(level: string): string {
  const colors: Record<string, string> = {
    'N1': '#e74c3c', // Red
    'N2': '#e67e22', // Orange
    'N3': '#f39c12', // Yellow/Gold
    'N4': '#3498db', // Blue
    'N5': '#2ecc71', // Green
  };
  return colors[level] || '#95a5a6'; // Gray fallback
}
