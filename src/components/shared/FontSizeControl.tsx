import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { IndicatorPreset } from '../../constants/indicators';
import { loadKanjiFontManifest, preloadFont, type FontInfo } from '../../utils/fontLoader';

interface FontSizeControlProps {
  kanjiFont: string;
  kanjiSize: number;
  kanjiSizeMin?: number; // Optional: default 60
  kanjiSizeMax?: number; // Optional: default 120
  hanVietSize: number;
  hanVietSizeMin?: number; // Optional: default 35
  hanVietSizeMax?: number; // Optional: default 65
  showHanViet: boolean;
  hanVietOrientation: 'horizontal' | 'vertical';
  showVietnameseMeaning: boolean;
  showEnglishMeaning: boolean;
  // Individual indicator flags
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  indicatorPreset: IndicatorPreset;
  // Explanation flags (optional - only for Sheet mode)
  showExplanationMeaning?: boolean;
  showExplanationMnemonic?: boolean;
  onKanjiFontChange: (font: string) => void;
  onKanjiSizeChange: (size: number) => void;
  onHanVietSizeChange: (size: number) => void;
  // Individual indicator toggles
  onToggleShowJlptIndicator: () => void;
  onToggleShowGradeIndicator: () => void;
  onToggleShowFrequencyIndicator: () => void;
  onToggleShowHanViet: () => void;
  onToggleHanVietOrientation: () => void;
  onToggleShowVietnameseMeaning: () => void;
  onToggleShowEnglishMeaning: () => void;
  onIndicatorPresetChange: (preset: IndicatorPreset) => void;
  // Explanation toggles (optional - only for Sheet mode)
  onToggleShowExplanationMeaning?: () => void;
  onToggleShowExplanationMnemonic?: () => void;
}

export const FontSizeControl = memo(function FontSizeControl({
  kanjiFont,
  kanjiSize,
  kanjiSizeMin = 60,
  kanjiSizeMax = 120,
  hanVietSize,
  hanVietSizeMin = 35,
  hanVietSizeMax = 65,
  showHanViet,
  hanVietOrientation,
  showVietnameseMeaning,
  showEnglishMeaning,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  indicatorPreset,
  showExplanationMeaning,
  showExplanationMnemonic,
  onKanjiFontChange,
  onKanjiSizeChange,
  onHanVietSizeChange,
  onToggleShowJlptIndicator,
  onToggleShowGradeIndicator,
  onToggleShowFrequencyIndicator,
  onToggleShowHanViet,
  onToggleHanVietOrientation,
  onToggleShowVietnameseMeaning,
  onToggleShowEnglishMeaning,
  onIndicatorPresetChange,
  onToggleShowExplanationMeaning,
  onToggleShowExplanationMnemonic,
}: FontSizeControlProps) {
  const { t } = useTranslation('controls');
  // Accordion state
  const [openSection, setOpenSection] = useState<'kanji' | 'indicators' | null>('kanji');

  // Font manifest state
  const [availableFonts, setAvailableFonts] = useState<FontInfo[]>([]);

  // Load kanji fonts on mount
  useEffect(() => {
    loadKanjiFontManifest().then(setAvailableFonts);
  }, []);

  // Preload font when it's selected
  useEffect(() => {
    const font = availableFonts.find(f => f.family === kanjiFont);
    if (font && !font.loaded && !font.error) {
      preloadFont(font).catch(err => {
        console.warn(`Failed to preload font ${font.name}:`, err);
      });
    }
  }, [kanjiFont, availableFonts]);

  const toggleSection = (section: 'kanji' | 'indicators') => {
    setOpenSection(openSection === section ? null : section);
  };

  // Use min/max from props (defaults: 60%-120% for kanji, 50%-100% for hanViet)
  const kanjiStep = 0.1; // Smooth stepless experience
  const hanVietStep = 0.1;
  
  // Size labels - both panels show percentages
  const getSizeLabel = (size: number) => {
    return `${size.toFixed(0)}%`;
  };

  return (
    <div className="space-y-2">
      {/* Kanji Character Section - Collapsible */}
      <div className="border-b border-gray-700">
        <button
          onClick={() => toggleSection('kanji')}
          className="w-full py-2 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded px-1"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
            <span className="text-base">🔤</span>
            <span>{t('display.kanji_character')}</span>
          </div>
          <span className={`text-gray-400 transition-transform text-xs ${openSection === 'kanji' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSection === 'kanji' && (
          <div className="pb-3 px-1">
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('display.font')}</label>
                <select
                  value={kanjiFont}
                  onChange={(e) => onKanjiFontChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-gray-700 text-gray-200 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  {availableFonts.map((font) => (
                    <option key={font.family} value={font.family}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  {t('display.size')}: {getSizeLabel(kanjiSize)}
                </label>
                <input
                  type="range"
                  min={kanjiSizeMin}
                  max={kanjiSizeMax}
                  step={kanjiStep}
                  value={kanjiSize}
                  onChange={(e) => onKanjiSizeChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
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
          <div className="pb-3 px-1 space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Quick Preset</label>
              <select
                value={indicatorPreset}
                onChange={(e) => onIndicatorPresetChange(e.target.value as IndicatorPreset)}
                className="w-full px-2 py-1 text-sm bg-gray-700 text-gray-200 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="minimal">Minimal (All Off)</option>
                <option value="study">Study (JLPT + Grade)</option>
                <option value="advanced">Advanced (All On)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Master kanji indicators */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Master kanji:</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showJlptIndicator}
                    onChange={onToggleShowJlptIndicator}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <span className="text-xs text-gray-300">JLPT</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGradeIndicator}
                    onChange={onToggleShowGradeIndicator}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <span className="text-xs text-gray-300">{t('display.grade')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFrequencyIndicator}
                    onChange={onToggleShowFrequencyIndicator}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <span className="text-xs text-gray-300">{t('display.frequency')}</span>
                </label>
              </div>
            </div>

            {/* Meaning indicators (Han-Viet, Vietnamese, English) */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Meaning indicators:</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHanViet}
                    onChange={onToggleShowHanViet}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <span className="text-xs text-gray-300">Hán-Việt</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVietnameseMeaning}
                    onChange={onToggleShowVietnameseMeaning}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <span className="text-xs text-gray-300">Vietnamese</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEnglishMeaning}
                    onChange={onToggleShowEnglishMeaning}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <span className="text-xs text-gray-300">English</span>
                </label>
              </div>
            </div>

            {/* Han-Viet Orientation (only visible if Han-Viet is shown alone, without Vietnamese/English meanings) */}
            {showHanViet && !showVietnameseMeaning && !showEnglishMeaning && (
              <div>
                <button
                  type="button"
                  onClick={onToggleHanVietOrientation}
                  className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded border border-gray-600 hover:bg-gray-600"
                >
                  Hán-Việt: {hanVietOrientation === 'vertical' ? t('display.vertical') : t('display.horizontal')}
                </button>
              </div>
            )}

            {/* Explanation section (only shown if props provided - Sheet mode only) */}
            {showExplanationMeaning !== undefined && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Explanation:</label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showExplanationMeaning}
                      onChange={onToggleShowExplanationMeaning}
                      className="w-3.5 h-3.5 accent-blue-600"
                    />
                    <span className="text-xs text-gray-300">Meaning</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showExplanationMnemonic}
                      onChange={onToggleShowExplanationMnemonic}
                      className="w-3.5 h-3.5 accent-blue-600"
                    />
                    <span className="text-xs text-gray-300">Mnemonic</span>
                  </label>
                </div>
              </div>
            )}

            {/* Surround-Text Size Slider */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Surround-Text Size: {getSizeLabel(hanVietSize)}
              </label>
              <div className="text-xs text-gray-500 italic mb-1">
                {t('display.affects_text_badges')}
              </div>
              <input
                type="range"
                min={hanVietSizeMin}
                max={hanVietSizeMax}
                step={hanVietStep}
                value={hanVietSize}
                onChange={(e) => onHanVietSizeChange(parseFloat(e.target.value))}
                disabled={!showHanViet && !showJlptIndicator && !showGradeIndicator && !showFrequencyIndicator && !showVietnameseMeaning && !showEnglishMeaning}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
});