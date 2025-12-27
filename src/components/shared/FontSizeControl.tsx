import { memo, useState, useEffect } from 'react';
import type { IndicatorPreset } from '../../constants/indicators';
import { loadKanjiFontManifest, preloadFont, type FontInfo } from '../../utils/fontLoader';

interface FontSizeControlProps {
  kanjiFont: string;
  kanjiSize: number;
  hanVietSize: number;
  showHanViet: boolean;
  hanVietOrientation: 'horizontal' | 'vertical';
  // Individual indicator flags
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  indicatorPreset: IndicatorPreset;
  onKanjiFontChange: (font: string) => void;
  onKanjiSizeChange: (size: number) => void;
  onHanVietSizeChange: (size: number) => void;
  onToggleShowHanViet: () => void;
  onToggleHanVietOrientation: () => void;
  // Individual indicator toggles
  onToggleShowJlptIndicator: () => void;
  onToggleShowGradeIndicator: () => void;
  onToggleShowFrequencyIndicator: () => void;
  onIndicatorPresetChange: (preset: IndicatorPreset) => void;
}

export const FontSizeControl = memo(function FontSizeControl({
  kanjiFont,
  kanjiSize,
  hanVietSize,
  showHanViet,
  hanVietOrientation,
  showJlptIndicator,
  showGradeIndicator,
  showFrequencyIndicator,
  indicatorPreset,
  onKanjiFontChange,
  onKanjiSizeChange,
  onHanVietSizeChange,
  onToggleShowHanViet,
  onToggleHanVietOrientation,
  onToggleShowJlptIndicator,
  onToggleShowGradeIndicator,
  onToggleShowFrequencyIndicator,
  onIndicatorPresetChange,
}: FontSizeControlProps) {
  // Accordion state
  const [openSection, setOpenSection] = useState<'kanji' | 'indicators' | 'hanviet' | null>('kanji');
  
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
  
  const toggleSection = (section: 'kanji' | 'indicators' | 'hanviet') => {
    setOpenSection(openSection === section ? null : section);
  };

  // Both panels now use percentage scale: 60% - 120% for kanji, 50% - 100% for hanViet
  const kanjiMinSize = 60;
  const kanjiMaxSize = 120;
  const kanjiStep = 0.1; // Smooth stepless experience
  const hanVietMinSize = 50;
  const hanVietMaxSize = 100;
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
            <span>Kanji Character</span>
          </div>
          <span className={`text-gray-400 transition-transform text-xs ${openSection === 'kanji' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSection === 'kanji' && (
          <div className="pb-3 px-1">
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Font</label>
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
                  Size: {getSizeLabel(kanjiSize)}
                </label>
                <input
                  type="range"
                  min={kanjiMinSize}
                  max={kanjiMaxSize}
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
            <span>Indicators</span>
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
                <span className="text-xs text-gray-300">Grade</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFrequencyIndicator}
                  onChange={onToggleShowFrequencyIndicator}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <span className="text-xs text-gray-300">Frequency</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Hán-Việt & Sizing Section - Collapsible */}
      <div>
        <button
          onClick={() => toggleSection('hanviet')}
          className="w-full py-2 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded px-1"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
            <span className="text-base">📝</span>
            <span>Hán-Việt & Sizing</span>
          </div>
          <span className={`text-gray-400 transition-transform text-xs ${openSection === 'hanviet' ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openSection === 'hanviet' && (
          <div className="pt-2 px-1 space-y-3">
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHanViet}
                    onChange={onToggleShowHanViet}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <span className="text-xs text-gray-300">Show</span>
                </label>
              </div>
              <div>
                <button
                  type="button"
                  onClick={onToggleHanVietOrientation}
                  disabled={!showHanViet}
                  className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hanVietOrientation === 'vertical' ? '↓ Vertical' : '→ Horizontal'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Size: {getSizeLabel(hanVietSize)}
              </label>
              <div className="text-xs text-gray-500 italic mb-1">
                Affects both Hán-Việt text and indicator badges
              </div>
              <input
                type="range"
                min={hanVietMinSize}
                max={hanVietMaxSize}
                step={hanVietStep}
                value={hanVietSize}
                onChange={(e) => onHanVietSizeChange(parseFloat(e.target.value))}
                disabled={!showHanViet && !showJlptIndicator && !showGradeIndicator && !showFrequencyIndicator}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});