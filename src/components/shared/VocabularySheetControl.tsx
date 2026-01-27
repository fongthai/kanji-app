import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadKanjiFontManifest, preloadFont, type FontInfo } from '../../utils/fontLoader';

interface VocabularySheetControlProps {
  vocabularyFont: string;
  showHanViet: boolean;
  showVietnameseMeaning: boolean;
  showEnglishMeaning: boolean;
  showExplanation: boolean;
  showExampleSentence: boolean;
  showExampleTranslation: boolean;
  practiceCellSize: number;
  onVocabularyFontChange: (font: string) => void;
  onToggleShowHanViet: () => void;
  onToggleShowVietnameseMeaning: () => void;
  onToggleShowEnglishMeaning: () => void;
  onToggleShowExplanation: () => void;
  onToggleShowExampleSentence: () => void;
  onToggleShowExampleTranslation: () => void;
  onPracticeCellSizeChange: (size: number) => void;
}

export const VocabularySheetControl = memo(function VocabularySheetControl({
  vocabularyFont,
  showHanViet,
  showVietnameseMeaning,
  showEnglishMeaning,
  showExplanation,
  showExampleSentence,
  showExampleTranslation,
  practiceCellSize,
  onVocabularyFontChange,
  onToggleShowHanViet,
  onToggleShowVietnameseMeaning,
  onToggleShowEnglishMeaning,
  onToggleShowExplanation,
  onToggleShowExampleSentence,
  onToggleShowExampleTranslation,
  onPracticeCellSizeChange,
}: VocabularySheetControlProps) {
  const { t } = useTranslation('controls');

  // Accordion state
  const [openSection, setOpenSection] = useState<'font' | 'indicators' | 'layout' | null>('indicators');

  // Font manifest state
  const [availableFonts, setAvailableFonts] = useState<FontInfo[]>([]);

  // Load kanji fonts on mount (same fonts can be used for vocabulary)
  useEffect(() => {
    loadKanjiFontManifest().then(setAvailableFonts);
  }, []);

  // Preload font when it's selected
  useEffect(() => {
    const font = availableFonts.find(f => f.family === vocabularyFont);
    if (font && !font.loaded && !font.error) {
      preloadFont(font).catch(err => {
        console.warn(`Failed to preload font ${font.name}:`, err);
      });
    }
  }, [vocabularyFont, availableFonts]);

  const toggleSection = (section: 'font' | 'indicators' | 'layout') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-0">
      {/* Font Section - Collapsible */}
      <div className="border-b border-gray-700">
        <button
          onClick={() => toggleSection('font')}
          className="w-full py-2 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded px-1"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
            <span className="text-base">🔤</span>
            <span>{t('vocabulary.font')}</span>
          </div>
          <span className={`text-gray-400 transition-transform text-xs ${openSection === 'font' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSection === 'font' && (
          <div className="pb-3 px-1">
            <label className="block text-xs text-gray-400 mb-1">{t('vocabulary.vocabulary_font')}</label>
            <select
              value={vocabularyFont}
              onChange={(e) => onVocabularyFontChange(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-gray-700 text-gray-200 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              style={{ fontFamily: vocabularyFont }}
            >
              {availableFonts.map((font) => (
                <option
                  key={font.family}
                  value={font.family}
                  style={{ fontFamily: font.family }}
                >
                  {font.name} {font.loaded ? '✓' : font.error ? '✗' : '⋯'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Indicators Section - Collapsible */}
      <div className="border-b border-gray-700">
        <button
          onClick={() => toggleSection('indicators')}
          className="w-full py-2 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded px-1"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
            <span className="text-base">🏷️</span>
            <span>{t('display.indicators')}</span>
          </div>
          <span className={`text-gray-400 transition-transform text-xs ${openSection === 'indicators' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSection === 'indicators' && (
          <div className="pb-3 px-1 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHanViet}
                onChange={onToggleShowHanViet}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-gray-300">{t('vocabulary.show_han_viet_reading')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVietnameseMeaning}
                onChange={onToggleShowVietnameseMeaning}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-gray-300">{t('vocabulary.show_vietnamese_meaning')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEnglishMeaning}
                onChange={onToggleShowEnglishMeaning}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-gray-300">{t('vocabulary.show_english_meaning')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExplanation}
                onChange={onToggleShowExplanation}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-gray-300">{t('vocabulary.show_explanation')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExampleSentence}
                onChange={onToggleShowExampleSentence}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-gray-300">{t('vocabulary.show_example_sentence')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExampleTranslation}
                onChange={onToggleShowExampleTranslation}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-gray-300">{t('vocabulary.show_example_translation')}</span>
            </label>
          </div>
        )}
      </div>

      {/* Layout Section - Collapsible */}
      <div>
        <button
          onClick={() => toggleSection('layout')}
          className="w-full py-2 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded px-1"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
            <span className="text-base">📐</span>
            <span>{t('vocabulary.layout')}</span>
          </div>
          <span className={`text-gray-400 transition-transform text-xs ${openSection === 'layout' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSection === 'layout' && (
          <div className="pb-3 px-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">{t('vocabulary.practice_cell_size')}</label>
              <span className="text-sm text-blue-400 font-semibold">{practiceCellSize}px</span>
            </div>
            <input
              type="range"
              min={30}
              max={60}
              value={practiceCellSize}
              onChange={(e) => onPracticeCellSizeChange(Number(e.target.value))}
              className="w-full h-2 accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>30px</span>
              <span>45px</span>
              <span>60px</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
