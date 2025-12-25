import { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setBoardColumnCount,
  setSheetColumnCount,
  setMasterKanjiSize,
  setCurrentMode,
  setBoardEmptyCellsMode,
  toggleBoardShowHeader,
  toggleBoardShowFooter,
  toggleGrayscaleMode,
  setCurrentPage,
} from '../worksheet/worksheetSlice';
import { setChosenKanjis } from '../kanji/kanjiSlice';
import {
  setInputPanelKanjiFont,
  setInputPanelKanjiSize,
  setInputPanelHanVietSize,
  setMainPanelKanjiFont,
  setMainPanelKanjiSize,
  setMainPanelHanVietSize,
  toggleInputPanelShowHanViet,
  toggleInputPanelHanVietOrientation,
  toggleInputPanelShowJlptIndicator,
  toggleInputPanelShowGradeIndicator,
  toggleInputPanelShowFrequencyIndicator,
  setInputPanelIndicatorPreset,
  toggleMainPanelShowHanViet,
  toggleMainPanelHanVietOrientation,
  toggleMainPanelShowJlptIndicator,
  toggleMainPanelShowGradeIndicator,
  toggleMainPanelShowFrequencyIndicator,
  setMainPanelIndicatorPreset,
  setPngQuality,
} from '../displaySettings/displaySettingsSlice';
import { FontSizeControl } from '../../components/shared/FontSizeControl';
import { ExportProgressModal } from '../../components/shared/ExportProgressModal';
import { exportToPDF, exportBoardToPDFVector, exportBoardToPNG, type ExportProgress } from '../../utils/exportUtils';
import { loadHeaderFontManifest } from '../../utils/fontLoader';

function ControlPanel() {
  const dispatch = useAppDispatch();
  const worksheet = useAppSelector((state) => state.worksheet);
  const { chosenKanjis, allKanjis } = useAppSelector((state) => state.kanji);
  const { inputPanel, mainPanel, pngQuality } = useAppSelector((state) => state.displaySettings);

  // Tab state for Display Settings section
  const [activeTab, setActiveTab] = useState<'input' | 'main' | 'sheet' | 'board'>('main');

  // Export state
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportCancelledRef = useRef(false);

  // Get current column count based on mode
  const columnCount = worksheet.currentMode === 'board'
    ? worksheet.boardColumnCount
    : worksheet.sheetColumnCount;

  const handleExport = () => {
    if (chosenKanjis.length === 0) {
      alert('No kanjis selected to export');
      return;
    }

    const text = chosenKanjis.map(k => k.kanji).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanji-list-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const kanjis = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const matchedKanjis = kanjis
        .map(kanjiChar => allKanjis.find(k => k.kanji === kanjiChar))
        .filter((k): k is NonNullable<typeof k> => k !== undefined);

      if (matchedKanjis.length === 0) {
        alert('No matching kanjis found in the imported file');
        return;
      }

      dispatch(setChosenKanjis(matchedKanjis));
      
      const notFound = kanjis.length - matchedKanjis.length;
      if (notFound > 0) {
        alert(`Imported ${matchedKanjis.length} kanjis. ${notFound} kanjis not found in database.`);
      } else {
        alert(`Successfully imported ${matchedKanjis.length} kanjis`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReloadData = () => {
    if (confirm('This will clear IndexedDB and reload all JSON files. Continue?')) {
      indexedDB.deleteDatabase('ft-kanji-database');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Export handlers
  const calculateTotalPages = (): number => {
    if (worksheet.currentMode === 'board') {
      // Match BoardGrid calculation
      const availableWidth = 698;
      let availableHeight = 1027;
      if (worksheet.boardShowHeader) availableHeight -= 48;
      if (worksheet.boardShowFooter) availableHeight -= 40;
      const gap = 2;
      const cellSize = Math.floor((availableWidth - (worksheet.boardColumnCount - 1) * gap) / worksheet.boardColumnCount);
      const rowCount = Math.floor((availableHeight + gap) / (cellSize + gap));
      const cardsPerPage = rowCount * worksheet.boardColumnCount;
      return Math.max(1, Math.ceil(chosenKanjis.length / cardsPerPage));
    } else {
      // Sheet mode - simplified calculation (20 per page)
      return Math.max(1, Math.ceil(chosenKanjis.length / 20));
    }
  };

  const handleExportPDF = async () => {
    if (chosenKanjis.length === 0 || isExporting) return;

    exportCancelledRef.current = false;
    setIsExporting(true);

    try {
      // Use React-PDF for board mode, keep html2canvas for sheet mode (for now)
      if (worksheet.currentMode === 'board') {
        // Load font manifest to get header font info
        const fonts = await loadHeaderFontManifest();
        const headerFont = fonts[worksheet.headerFontIndex] || fonts[0];
        
        await exportBoardToPDFVector(
          chosenKanjis,
          worksheet.boardColumnCount,
          worksheet.boardShowHeader,
          worksheet.boardShowFooter,
          worksheet.boardEmptyCellsMode !== 'hide',
          worksheet.boardEmptyCellsMode === 'page',
          mainPanel.kanjiFont,
          mainPanel.kanjiSize,
          mainPanel.hanVietFont,
          mainPanel.hanVietSize,
          mainPanel.hanVietOrientation,
          mainPanel.showHanViet,
          mainPanel.showJlptIndicator,
          mainPanel.showGradeIndicator,
          mainPanel.showFrequencyIndicator,
          worksheet.headerText,
          headerFont.family,
          headerFont.filename,
          (progress) => setExportProgress(progress)
        );
      } else {
        // Sheet mode - use old method for now
        await exportToPDF(
          calculateTotalPages,
          (page: number) => dispatch(setCurrentPage(page)),
          () => document.querySelector('[data-component="a4-paper"]') as HTMLElement | null,
          () => worksheet.currentMode,
          () => worksheet.currentMode === 'board' ? worksheet.boardColumnCount : worksheet.sheetColumnCount,
          () => chosenKanjis,
          (progress) => setExportProgress(progress),
          () => exportCancelledRef.current
        );
      }
    } catch (error) {
      console.error('Export PDF failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (chosenKanjis.length === 0 || isExporting) return;

    exportCancelledRef.current = false;
    setIsExporting(true);

    try {
      await exportBoardToPNG(
        chosenKanjis,
        {
          boardColumnCount: worksheet.boardColumnCount,
          showEmptyCells: worksheet.boardEmptyCellsMode !== 'hide',
          centerCards: false, // Default value
          showHeader: worksheet.boardShowHeader,
          showFooter: worksheet.boardShowFooter,
        },
        {
          kanjiFont: mainPanel.kanjiFont,
          hanVietFont: mainPanel.hanVietFont,
          hanVietOrientation: mainPanel.hanVietOrientation,
          showHanViet: mainPanel.showHanViet,
          showJlptIndicator: mainPanel.showJlptIndicator,
          showGradeIndicator: mainPanel.showGradeIndicator,
          showFrequencyIndicator: mainPanel.showFrequencyIndicator,
          kanjiSize: mainPanel.kanjiSize,
          hanVietSize: mainPanel.hanVietSize,
        },
        pngQuality,
        (progress) => setExportProgress(progress),
        () => exportCancelledRef.current
      );
    } catch (error) {
      console.error('Export PNG failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancelExport = () => {
    exportCancelledRef.current = true;
  };

  const handleCloseExportModal = () => {
    if (!isExporting) {
      setExportProgress(null);
    }
  };

  return (
    <div data-testid="control-panel" className="bg-gray-800 rounded-lg p-4 border border-gray-700 h-full flex flex-col overflow-hidden">
      <h2 className="text-lg font-semibold mb-4">Control Panel</h2>

      <div className="flex-1 overflow-y-scroll pr-2 space-y-4">
        {/* VIEW MODE */}
        <div className="pb-3 border-b border-gray-700">
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                worksheet.currentMode === 'sheet' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => dispatch(setCurrentMode('sheet'))}
            >
              Sheet
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                worksheet.currentMode === 'board' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => dispatch(setCurrentMode('board'))}
            >
              Board
            </button>
          </div>
        </div>

        {/* GLOBAL OPTIONS */}
        <div className="pb-3 border-b border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Global Options</h3>
          
          {/* Column Count */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">Columns</label>
              <span className="text-sm text-blue-400 font-semibold">{columnCount}</span>
            </div>
            <input
              type="range"
              min={worksheet.currentMode === 'board' ? 4 : 4}
              max={worksheet.currentMode === 'board' ? 10 : 10}
              value={columnCount}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (worksheet.currentMode === 'board') {
                  dispatch(setBoardColumnCount(value));
                } else {
                  dispatch(setSheetColumnCount(value));
                }
              }}
              className="w-full h-2 accent-blue-600"
            />
          </div>

          {/* Global Checkboxes */}
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={worksheet.grayscaleMode}
                onChange={() => dispatch(toggleGrayscaleMode())}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-gray-300">Grayscale</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={worksheet.boardShowHeader}
                onChange={() => dispatch(toggleBoardShowHeader())}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-gray-300">Header</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={worksheet.boardShowFooter}
                onChange={() => dispatch(toggleBoardShowFooter())}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-gray-300">Footer</span>
            </label>
          </div>
        </div>

        {/* DISPLAY SETTINGS (TABS) */}
        <div className="pb-3 border-b border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Display Settings</h3>
          
          {/* Tabs */}
          <div className="flex gap-1 mb-3 border-b border-gray-700">
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                activeTab === 'input'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('input')}
            >
              Input
            </button>
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                activeTab === 'main'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('main')}
            >
              Main
            </button>
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                activeTab === 'sheet'
                  ? 'text-blue-400 border-blue-400'
                  : worksheet.currentMode === 'sheet'
                    ? 'text-gray-400 border-transparent hover:text-gray-300'
                    : 'text-gray-600 border-transparent opacity-50'
              }`}
              onClick={() => setActiveTab('sheet')}
            >
              Sheet {worksheet.currentMode !== 'sheet' && <span className="text-[10px]">(inactive)</span>}
            </button>
            <button
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                activeTab === 'board'
                  ? 'text-blue-400 border-blue-400'
                  : worksheet.currentMode === 'board'
                    ? 'text-gray-400 border-transparent hover:text-gray-300'
                    : 'text-gray-600 border-transparent opacity-50'
              }`}
              onClick={() => setActiveTab('board')}
            >
              Board {worksheet.currentMode !== 'board' && <span className="text-[10px]">(inactive)</span>}
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-black/20 p-3 rounded">
            {/* Input Panel Tab */}
            {activeTab === 'input' && (
              <FontSizeControl
                kanjiFont={inputPanel.kanjiFont}
                kanjiSize={inputPanel.kanjiSize}
                hanVietSize={inputPanel.hanVietSize}
                showHanViet={inputPanel.showHanViet}
                hanVietOrientation={inputPanel.hanVietOrientation}
                showJlptIndicator={inputPanel.showJlptIndicator}
                showGradeIndicator={inputPanel.showGradeIndicator}
                showFrequencyIndicator={inputPanel.showFrequencyIndicator}
                indicatorPreset={inputPanel.indicatorPreset}
                onKanjiFontChange={(font) => dispatch(setInputPanelKanjiFont(font))}
                onKanjiSizeChange={(size) => dispatch(setInputPanelKanjiSize(size))}
                onHanVietSizeChange={(size) => dispatch(setInputPanelHanVietSize(size))}
                onToggleShowHanViet={() => dispatch(toggleInputPanelShowHanViet())}
                onToggleHanVietOrientation={() => dispatch(toggleInputPanelHanVietOrientation())}
                onToggleShowJlptIndicator={() => dispatch(toggleInputPanelShowJlptIndicator())}
                onToggleShowGradeIndicator={() => dispatch(toggleInputPanelShowGradeIndicator())}
                onToggleShowFrequencyIndicator={() => dispatch(toggleInputPanelShowFrequencyIndicator())}
                onIndicatorPresetChange={(preset) => dispatch(setInputPanelIndicatorPreset(preset))}
              />
            )}

            {/* Main Panel Tab */}
            {activeTab === 'main' && (
              <FontSizeControl
                kanjiFont={mainPanel.kanjiFont}
                kanjiSize={mainPanel.kanjiSize}
                hanVietSize={mainPanel.hanVietSize}
                showHanViet={mainPanel.showHanViet}
                hanVietOrientation={mainPanel.hanVietOrientation}
                showJlptIndicator={mainPanel.showJlptIndicator}
                showGradeIndicator={mainPanel.showGradeIndicator}
                showFrequencyIndicator={mainPanel.showFrequencyIndicator}
                indicatorPreset={mainPanel.indicatorPreset}
                onKanjiFontChange={(font) => dispatch(setMainPanelKanjiFont(font))}
                onKanjiSizeChange={(size) => dispatch(setMainPanelKanjiSize(size))}
                onHanVietSizeChange={(size) => dispatch(setMainPanelHanVietSize(size))}
                onToggleShowHanViet={() => dispatch(toggleMainPanelShowHanViet())}
                onToggleHanVietOrientation={() => dispatch(toggleMainPanelHanVietOrientation())}
                onToggleShowJlptIndicator={() => dispatch(toggleMainPanelShowJlptIndicator())}
                onToggleShowGradeIndicator={() => dispatch(toggleMainPanelShowGradeIndicator())}
                onToggleShowFrequencyIndicator={() => dispatch(toggleMainPanelShowFrequencyIndicator())}
                onIndicatorPresetChange={(preset) => dispatch(setMainPanelIndicatorPreset(preset))}
              />
            )}

            {/* Sheet Tab */}
            {activeTab === 'sheet' && (
              <div>
                {worksheet.currentMode !== 'sheet' && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3 mb-3 text-xs text-blue-300">
                    💡 Sheet mode is not active. Changes will apply when you switch to Sheet mode.
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-400">Kanji Size</label>
                      <span className="text-xs text-blue-400 font-semibold">{worksheet.masterKanjiSize}%</span>
                    </div>
                    <input
                      type="range"
                      min="130"
                      max="170"
                      step="10"
                      value={worksheet.masterKanjiSize}
                      onChange={(e) => dispatch(setMasterKanjiSize(Number(e.target.value)))}
                      className="w-full h-2 accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Board Tab */}
            {activeTab === 'board' && (
              <div>
                {worksheet.currentMode !== 'board' && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3 mb-3 text-xs text-blue-300">
                    💡 Board mode is not active. Changes will apply when you switch to Board mode.
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Empty Cells</label>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="emptyCellsMode"
                          value="hide"
                          checked={worksheet.boardEmptyCellsMode === 'hide'}
                          onChange={() => dispatch(setBoardEmptyCellsMode('hide'))}
                          className="sr-only"
                        />
                        <div className={`py-1.5 px-3 rounded text-xs text-center cursor-pointer transition-colors ${
                          worksheet.boardEmptyCellsMode === 'hide' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}>
                          Hide
                        </div>
                      </label>
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="emptyCellsMode"
                          value="row"
                          checked={worksheet.boardEmptyCellsMode === 'row'}
                          onChange={() => dispatch(setBoardEmptyCellsMode('row'))}
                          className="sr-only"
                        />
                        <div className={`py-1.5 px-3 rounded text-xs text-center cursor-pointer transition-colors ${
                          worksheet.boardEmptyCellsMode === 'row' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}>
                          Row
                        </div>
                      </label>
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="emptyCellsMode"
                          value="page"
                          checked={worksheet.boardEmptyCellsMode === 'page'}
                          onChange={() => dispatch(setBoardEmptyCellsMode('page'))}
                          className="sr-only"
                        />
                        <div className={`py-1.5 px-3 rounded text-xs text-center cursor-pointer transition-colors ${
                          worksheet.boardEmptyCellsMode === 'page' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}>
                          Page
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PNG EXPORT QUALITY */}
        <div className="pb-3 border-b border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">PNG Export Quality</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">
                {pngQuality === 200 ? 'Low (Web)' : pngQuality === 300 ? 'Medium (Standard)' : 'HQ (Print)'}
              </span>
              <span className="text-xs text-gray-400">{pngQuality} dpi</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={pngQuality === 200 ? 0 : pngQuality === 300 ? 1 : 2}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                const dpi = val === 0 ? 200 : val === 1 ? 300 : 600;
                dispatch(setPngQuality(dpi as 200 | 300 | 600));
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>HQ</span>
            </div>
          </div>
        </div>

        {/* DATA MANAGEMENT */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Data Management</h3>
          <div className="space-y-2">
            {/* Row 1: PDF and PNG Export */}
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                disabled={chosenKanjis.length === 0 || isExporting}
                className="flex-1 py-2 px-3 rounded text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                title="Export worksheet as PDF"
              >
                {isExporting && exportProgress?.status === 'exporting' 
                  ? `📄 ${exportProgress.currentPage}/${exportProgress.totalPages}`
                  : '📄 PDF Export'}
              </button>
              <button
                onClick={handleExportPNG}
                disabled={chosenKanjis.length === 0 || isExporting}
                className="flex-1 py-2 px-3 rounded text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                title="Export worksheet as PNG images"
              >
                {isExporting && exportProgress?.status === 'exporting'
                  ? `🖼️ ${exportProgress.currentPage}/${exportProgress.totalPages}`
                  : '🖼️ PNG Export'}
              </button>
            </div>
            {/* Row 2: Save, Load, Reset */}
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={chosenKanjis.length === 0}
                className="flex-1 py-2 px-3 rounded text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                title="Save chosen kanjis as text file"
              >
                💾 Save kanji list
              </button>
              <label className="flex-1">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="py-2 px-3 rounded text-xs bg-blue-600 hover:bg-blue-700 text-center cursor-pointer transition-colors">
                  📂 Load kanji list
                </div>
              </label>
              <button
                onClick={handleReloadData}
                disabled={isExporting}
                className="flex-1 py-2 px-3 rounded bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-xs"
                title="Clear database and reload"
              >
                🔄 Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Progress Modal */}
      <ExportProgressModal 
        progress={exportProgress} 
        onCancel={isExporting ? handleCancelExport : handleCloseExportModal}
      />
    </div>
  );
}

export default ControlPanel;
