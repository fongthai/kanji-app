import { useAppSelector } from '../../app/hooks';
import { useTranslation } from 'react-i18next';
import { A4Paper } from '../../components/screen/A4Paper';
import { Paginator } from '../../components/shared/Paginator';
import { BoardGrid } from '../../components/screen/BoardGrid';
import { SheetGrid, calculateTablesPerPage } from '../../components/screen/SheetGrid';
import { VocabularySheetGrid, calculatePageBreaks, estimateVocabRowsPerPage } from '../../components/screen/VocabularySheetGrid';
import { A4_HEIGHT, BOARD_HEADER_HEIGHT, BOARD_FOOTER_HEIGHT } from '../../constants/boardDimensions';
import { BoardHeader } from '../../components/screen/BoardHeader';
import { BoardFooter } from '../../components/screen/BoardFooter';
import { UIWatermark } from '../../components/screen/UIWatermark';
import Quiz from '../quiz/Quiz';
import { useState, useEffect, useMemo } from 'react';

function MainView() {
  const { t } = useTranslation('messages');
  const chosenKanjis = useAppSelector((state) => state.kanji.chosenKanjis);
  const chosenVocabularies = useAppSelector((state) => state.vocabulary.chosenVocabularies);
  const filterMode = useAppSelector((state) => state.worksheet.filterMode);
  const currentMode = useAppSelector((state) => state.worksheet.currentMode);
  const currentPage = useAppSelector((state) => state.worksheet.currentPage);
  const worksheet = useAppSelector((state) => state.worksheet);
  const sheetPanel = useAppSelector((state) => state.displaySettings.sheetPanel);
  const vocabularySheet = useAppSelector((state) => state.displaySettings.vocabularySheet);

  // Calculate immediate explanation line count
  const immediateExplanationLineCount = (sheetPanel.showExplanationMnemonic ?? false) ? 3 :
                                        (sheetPanel.showExplanationMeaning ?? true) ? 2 : 1;
  
  // Debounced explanation line count for layout calculations (300ms delay)
  const [debouncedExplanationLineCount, setDebouncedExplanationLineCount] = useState<1 | 2 | 3>(immediateExplanationLineCount);

  // State for vocabulary sheet dynamic pagination
  const [vocabRowHeights, setVocabRowHeights] = useState<number[]>([]);
  const [measuredAvailableHeight, setMeasuredAvailableHeight] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Re-confirm checkbox values after delay
      const confirmedLineCount = (sheetPanel.showExplanationMnemonic ?? false) ? 3 :
                                 (sheetPanel.showExplanationMeaning ?? true) ? 2 : 1;
      setDebouncedExplanationLineCount(confirmedLineCount);
    }, 300);

    return () => clearTimeout(timer);
  }, [sheetPanel.showExplanationMnemonic, sheetPanel.showExplanationMeaning]);

  // Calculate available height for vocabulary sheets
  const vocabAvailableHeight = useMemo(() => {
    const containerPadding = 40; // p-5 class adds 20px top + 20px bottom padding
    let height = A4_HEIGHT - containerPadding;

    if (worksheet.boardShowHeader) {
      height -= BOARD_HEADER_HEIGHT;
    }

    if (worksheet.boardShowFooter) {
      height -= BOARD_FOOTER_HEIGHT;
    }

    return height;
  }, [worksheet.boardShowHeader, worksheet.boardShowFooter]);

  // Calculate page breaks from measured heights (moved into useMemo to fix render order)
  const vocabPageBreaks = useMemo(() => {
    if (vocabRowHeights.length > 0 && filterMode === 'vocabulary' && currentMode === 'sheet') {
      // Use measured available height if available (accounts for A4Paper scaling), otherwise use calculated height
      const heightToUse = measuredAvailableHeight > 0 ? measuredAvailableHeight : vocabAvailableHeight;
      const breaks = calculatePageBreaks(vocabRowHeights, heightToUse);
      return breaks;
    }
    return [0];
  }, [vocabRowHeights, measuredAvailableHeight, vocabAvailableHeight, filterMode, currentMode]);

  // Reset heights when vocabularies or settings change
  useEffect(() => {
    setVocabRowHeights([]);
    setMeasuredAvailableHeight(0); // Reset measured height to trigger re-measurement
  }, [
    chosenVocabularies.length,
    vocabularySheet.practiceCellSize,
    vocabularySheet.showHanViet,
    vocabularySheet.showVietnameseMeaning,
    vocabularySheet.showEnglishMeaning,
    vocabularySheet.showExampleSentence,
    vocabularySheet.showExampleTranslation,
  ]);

  // Calculate pagination - different logic for vocabulary vs kanji
  const { totalPages, startIndex, pageVocabularies } = useMemo(() => {
    if (currentMode === 'sheet' && filterMode === 'vocabulary') {
      // Vocabulary sheet: use measured page breaks
      if (vocabRowHeights.length > 0) {
        // Measured heights available - use actual page breaks
        const totalPages = vocabPageBreaks.length;
        const pageIndex = Math.min(currentPage - 1, totalPages - 1);
        const startIdx = vocabPageBreaks[pageIndex];
        const endIdx = pageIndex < totalPages - 1 ? vocabPageBreaks[pageIndex + 1] : chosenVocabularies.length;
        const pageVocabs = chosenVocabularies.slice(startIdx, endIdx);

        return {
          totalPages,
          startIndex: startIdx,
          pageVocabularies: pageVocabs,
        };
      } else {
        // No measurements yet - use estimate
        const hasExampleSentences = vocabularySheet.showExampleSentence || vocabularySheet.showExampleTranslation;
        const estimatedPerPage = estimateVocabRowsPerPage(
          worksheet.boardShowHeader,
          worksheet.boardShowFooter,
          vocabularySheet.practiceCellSize,
          hasExampleSentences
        );
        const totalPages = Math.max(1, Math.ceil(chosenVocabularies.length / estimatedPerPage));
        const startIdx = (currentPage - 1) * estimatedPerPage;
        const pageVocabs = chosenVocabularies.slice(startIdx, startIdx + estimatedPerPage);

        return {
          totalPages,
          startIndex: startIdx,
          pageVocabularies: pageVocabs,
        };
      }
    } else {
      // Kanji modes (board and sheet) - use existing logic
      let cardsPerPage = 0;

      if (currentMode === 'sheet') {
        // Kanji sheet mode
        cardsPerPage = calculateTablesPerPage(
          worksheet.sheetColumnCount,
          worksheet.boardShowHeader,
          worksheet.boardShowFooter,
          debouncedExplanationLineCount
        );
      } else {
        // Board mode
        const availableWidth = 698;
        let availableHeight = 1027;
        if (worksheet.boardShowHeader) availableHeight -= 50;
        if (worksheet.boardShowFooter) availableHeight -= 40;

        const gap = 2;
        const cellSize = Math.floor((availableWidth - (worksheet.boardColumnCount - 1) * gap) / worksheet.boardColumnCount);
        const rowCount = Math.floor((availableHeight + gap) / (cellSize + gap));
        cardsPerPage = rowCount * worksheet.boardColumnCount;
      }

      const itemCount = filterMode === 'vocabulary' ? chosenVocabularies.length : chosenKanjis.length;
      const totalPages = Math.max(1, Math.ceil(itemCount / cardsPerPage));
      const startIdx = (currentPage - 1) * cardsPerPage;

      return {
        totalPages,
        startIndex: startIdx,
        pageVocabularies: [], // Not used for kanji modes
      };
    }
  }, [
    currentMode,
    filterMode,
    currentPage,
    chosenVocabularies,
    chosenKanjis,
    vocabRowHeights,
    vocabPageBreaks,
    vocabularySheet,
    worksheet,
    debouncedExplanationLineCount,
  ]);

  // Quiz Mode Rendering
  if (currentMode === 'quiz') {
    return (
      <div
        data-testid="main-view"
        className="bg-gray-700 rounded-lg p-4 flex flex-col h-full overflow-hidden"
      >
        <Quiz />
      </div>
    );
  }

  // Sheet & Board Mode Rendering
  return (
    <div
      data-testid="main-view"
      className="bg-gray-700 rounded-lg p-4 flex flex-col h-full overflow-hidden gap-3"
    >
      {/* A4 Paper Container */}
      <div className="flex-1 min-h-0">
        <A4Paper>
          {currentMode === 'board' ? (
            <div className="flex flex-col h-full" style={{ overflow: 'visible' }}>
              <BoardHeader visible={worksheet.boardShowHeader} />
              
              <div className="flex-1 overflow-hidden">
                {chosenKanjis.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-center px-8 text-3xl font-medium relative">
                    <UIWatermark />
                    <span className="relative z-10">{t('empty_state.select_kanji')}</span>
                  </div>
                ) : (
                  <BoardGrid
                    kanjis={chosenKanjis}
                    startIndex={startIndex}
                    columnCount={worksheet.boardColumnCount}
                    emptyCellsMode={worksheet.boardEmptyCellsMode}
                    grayscaleMode={worksheet.grayscaleMode}
                    showHeader={worksheet.boardShowHeader}
                    showFooter={worksheet.boardShowFooter}
                  />
                )}
              </div>
              
              <BoardFooter 
                currentPage={currentPage} 
                totalPages={totalPages}
                visible={worksheet.boardShowFooter}
                timestamp={chosenKanjis.length}
              />
            </div>
          ) : (
            // Sheet mode
            <div className="flex flex-col h-full" style={{ overflow: 'visible' }}>
              <BoardHeader visible={worksheet.boardShowHeader} />

              <div className="flex-1" style={{ overflow: filterMode === 'vocabulary' ? 'visible' : 'hidden' }}>
                {filterMode === 'vocabulary' ? (
                  // Vocabulary sheet mode
                  chosenVocabularies.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-center px-8 text-3xl font-medium relative">
                      <UIWatermark />
                      <span className="relative z-10">{t('empty_state.select_kanji')}</span>
                    </div>
                  ) : (
                    <VocabularySheetGrid
                      vocabularies={chosenVocabularies}
                      pageVocabularies={pageVocabularies}
                      showHeader={worksheet.boardShowHeader}
                      showFooter={worksheet.boardShowFooter}
                      onHeightsMeasured={setVocabRowHeights}
                      onAvailableHeightMeasured={setMeasuredAvailableHeight}
                    />
                  )
                ) : (
                  // Kanji sheet mode
                  chosenKanjis.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-center px-8 text-3xl font-medium relative">
                      <UIWatermark />
                      <span className="relative z-10">{t('empty_state.select_kanji')}</span>
                    </div>
                  ) : (
                    <SheetGrid
                      kanjis={chosenKanjis}
                      startIndex={startIndex}
                      showHeader={worksheet.boardShowHeader}
                      showFooter={worksheet.boardShowFooter}
                      explanationLineCount={debouncedExplanationLineCount}
                    />
                  )
                )}
              </div>

              <BoardFooter
                currentPage={currentPage}
                totalPages={totalPages}
                visible={worksheet.boardShowFooter}
                timestamp={filterMode === 'vocabulary' ? chosenVocabularies.length : chosenKanjis.length}
              />
            </div>
          )}
        </A4Paper>
      </div>

      {/* Paginator */}
      <div className="flex justify-center flex-shrink-0">
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

export default MainView;
