/**
 * VocabularyRow Component
 *
 * Renders a single vocabulary row with side-by-side layout:
 * - Left side (70%): Info columns (vocabulary, hiragana, hanViet?, meaning?)
 * - Right side (30%): Practice grid (adaptive based on hidden columns)
 */

import React from 'react';
import type { VocabularyData } from '../../types/vocabulary';
import { useAppSelector } from '../../app/hooks';
import { useTranslation } from 'react-i18next';

interface VocabularyRowProps {
  vocabulary: VocabularyData;
  rowNumber: number;
  availableWidth: number;
}

export const VocabularyRow: React.FC<VocabularyRowProps> = ({
  vocabulary,
  rowNumber,
  availableWidth,
}) => {
  const { i18n } = useTranslation();
  const vocabSettings = useAppSelector(state => state.displaySettings.vocabularySheet);
  const vocabularyFont = vocabSettings.vocabularyFont;
  const showHanViet = vocabSettings.showHanViet;
  const showMeaning = vocabSettings.showVietnameseMeaning;
  const showExplanation = vocabSettings.showExplanation;
  const showExampleSentence = vocabSettings.showExampleSentence;
  const showExampleTranslation = vocabSettings.showExampleTranslation;
  const cellSize = vocabSettings.practiceCellSize;

  // Determine which translation to use based on current language
  const currentLanguage = i18n.language;
  const exampleTranslations = currentLanguage === 'vi'
    ? (Array.isArray(vocabulary.exampleSentencesVietnameseTranslate) ? vocabulary.exampleSentencesVietnameseTranslate : [])
    : (Array.isArray(vocabulary.exampleSentencesEnglishTranslate) ? vocabulary.exampleSentencesEnglishTranslate : []);

  // Get example sentences (arrays) - ensure they're actually arrays
  const exampleSentences = Array.isArray(vocabulary.exampleSentencesInJapanese) ? vocabulary.exampleSentencesInJapanese : [];

  // Calculate character count and practice area dimensions
  const charCount = vocabulary.vocabulary.length;
  const rectangleWidth = charCount * cellSize; // Width of one practice rectangle
  const practiceAreaWidth = rectangleWidth + 8; // 1 rectangle per row + padding
  const practiceAreaHeight = cellSize * 2 + 4; // 2 rows + gap

  // Calculate dynamic split based on practice area needs
  const infoWidth = availableWidth - practiceAreaWidth - 20; // 20px for padding/borders

  // Render 2×1 grid of practice rectangles (2 rows, 1 rectangle per row)
  const renderPracticeGrid = () => {
    return (
      <div
        className="flex flex-col gap-1"
        style={{
          width: `${practiceAreaWidth}px`,
          height: `${practiceAreaHeight}px`
        }}
      >
        {/* Row 1: First rectangle with tracing */}
        <div className="flex gap-1">
          <div
            className="border-2 border-gray-400 bg-white flex relative"
            style={{
              width: `${rectangleWidth}px`,
              height: `${cellSize}px`
            }}
          >
            {/* Render individual cells with guide lines and tracing text */}
            {Array.from({ length: charCount }, (_, i) => (
              <div
                key={i}
                className="relative"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  borderRight: i < charCount - 1 ? '1px solid #ddd' : 'none'
                }}
              >
                {/* Guide lines (SVG - same as kanji PracticeCell) */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width={cellSize}
                  height={cellSize}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Vertical center line */}
                  <line
                    x1={cellSize / 2}
                    y1={0}
                    x2={cellSize / 2}
                    y2={cellSize}
                    stroke="#cccccc"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />

                  {/* Horizontal center line */}
                  <line
                    x1={0}
                    y1={cellSize / 2}
                    x2={cellSize}
                    y2={cellSize / 2}
                    stroke="#cccccc"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />
                </svg>

                {/* Tracing text - one character per cell */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    opacity: 0.35,
                    color: '#666666'
                  }}
                >
                  <span
                    className="kanji-character"
                    style={{
                      fontSize: `${cellSize * 0.7}px`,
                      fontFamily: 'KanjiStrokeOrders, NotoSansJP-Regular, sans-serif',
                      lineHeight: 1,
                      display: 'inline-block',
                      transform: 'translateY(-10%)'
                    }}
                  >
                    {vocabulary.vocabulary[i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Second rectangle (empty practice) */}
        <div className="flex gap-1">
          <div
            className="border-2 border-gray-400 bg-white flex"
            style={{
              width: `${rectangleWidth}px`,
              height: `${cellSize}px`
            }}
          >
            {Array.from({ length: charCount }, (_, i) => (
              <div
                key={i}
                className="relative"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  borderRight: i < charCount - 1 ? '1px solid #ddd' : 'none'
                }}
              >
                {/* Guide lines (SVG - same as kanji PracticeCell) */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width={cellSize}
                  height={cellSize}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Vertical center line */}
                  <line
                    x1={cellSize / 2}
                    y1={0}
                    x2={cellSize / 2}
                    y2={cellSize}
                    stroke="#cccccc"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />

                  {/* Horizontal center line */}
                  <line
                    x1={0}
                    y1={cellSize / 2}
                    x2={cellSize}
                    y2={cellSize / 2}
                    stroke="#cccccc"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" style={{ width: `${availableWidth}px` }}>
      {/* Row number - positioned outside the box at top-left with minimal padding */}
      <div
        className="absolute text-xs text-gray-500 font-medium"
        style={{
          top: '-2px',
          left: '-18px',
        }}
      >
        {rowNumber}
      </div>

      {/* Main row container */}
      <div
        className="flex border border-gray-300 bg-white"
        style={{
          width: `${availableWidth}px`,
          minHeight: `${practiceAreaHeight + 16}px`, // Match practice area height + padding
        }}
      >
        {/* Left side: Info columns (dynamic width) */}
        <div
          className="flex flex-col justify-center px-3 py-2 border-r border-gray-300"
          style={{ width: `${infoWidth}px` }}
        >
          {/* Japanese vocabulary with Han-Viet and Furigana on same line */}
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: vocabularyFont }}
            >
              {vocabulary.vocabulary}
            </span>
            {showHanViet && vocabulary.hanViet && (
              <span className="text-xs text-blue-600 font-medium">
                {vocabulary.hanViet}
              </span>
            )}
            <span className="text-sm text-gray-700">
              {vocabulary.furigana}
            </span>
          </div>

          {/* Vietnamese meaning with explanation (if enabled) */}
          {showMeaning && (
            <div className="text-xs text-gray-600">
              {vocabulary.vietnameseMeaning || '-'}
              {showExplanation && vocabulary.explanation && (
                <>
                  {vocabulary.vietnameseMeaning?.endsWith('.') ? ' ' : '. '}
                  {vocabulary.explanation}
                </>
              )}
            </div>
          )}

          {/* Example sentences in Japanese (if enabled and exists) */}
          {showExampleSentence && exampleSentences.length > 0 && exampleSentences.map((sentence, index) => (
            <div key={index} className="text-xs text-gray-700 italic mt-2 pl-2 border-l-2 border-blue-300">
              {sentence}
            </div>
          ))}

          {/* Example sentence translations (if enabled and exists) */}
          {showExampleTranslation && exampleTranslations && exampleTranslations.length > 0 && exampleTranslations.map((translation, index) => (
            <div key={index} className="text-xs text-gray-500 italic mt-1 pl-2">
              {translation}
            </div>
          ))}
        </div>

        {/* Right side: Practice grid (dynamic width - 2 rows × 2 rectangles) */}
        <div
          className="flex items-center justify-center bg-gray-50 py-2"
          style={{ width: `${practiceAreaWidth + 10}px` }}
        >
          {renderPracticeGrid()}
        </div>
      </div>
    </div>
  );
};
