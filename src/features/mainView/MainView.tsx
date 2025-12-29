import { useAppSelector } from '../../app/hooks';
import { A4Paper } from '../../components/screen/A4Paper';
import { Paginator } from '../../components/shared/Paginator';
import { BoardGrid } from '../../components/screen/BoardGrid';
import { SheetGrid, calculateTablesPerPage } from '../../components/screen/SheetGrid';
import { BoardHeader } from '../../components/screen/BoardHeader';
import { BoardFooter } from '../../components/screen/BoardFooter';
import { useState, useEffect } from 'react';

function MainView() {
  const chosenKanjis = useAppSelector((state) => state.kanji.chosenKanjis);
  const currentMode = useAppSelector((state) => state.worksheet.currentMode);
  const currentPage = useAppSelector((state) => state.worksheet.currentPage);
  const worksheet = useAppSelector((state) => state.worksheet);
  const sheetPanel = useAppSelector((state) => state.displaySettings.sheetPanel);

  // Calculate immediate explanation line count
  const immediateExplanationLineCount = (sheetPanel.showExplanationMnemonic ?? false) ? 3 :
                                        (sheetPanel.showExplanationMeaning ?? true) ? 2 : 1;
  
  // Debounced explanation line count for layout calculations (300ms delay)
  const [debouncedExplanationLineCount, setDebouncedExplanationLineCount] = useState<1 | 2 | 3>(immediateExplanationLineCount);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Re-confirm checkbox values after delay
      const confirmedLineCount = (sheetPanel.showExplanationMnemonic ?? false) ? 3 :
                                 (sheetPanel.showExplanationMeaning ?? true) ? 2 : 1;
      setDebouncedExplanationLineCount(confirmedLineCount);
    }, 300);

    return () => clearTimeout(timer);
  }, [sheetPanel.showExplanationMnemonic, sheetPanel.showExplanationMeaning]);

  // Calculate cards per page for board mode
  const calculateCardsPerPage = () => {
    if (currentMode === 'sheet') {
      // Sheet mode: calculate tables per page using debounced value
      return calculateTablesPerPage(
        worksheet.sheetColumnCount,
        worksheet.boardShowHeader,
        worksheet.boardShowFooter,
        debouncedExplanationLineCount
      );
    }
    
    // Board mode calculations
    const availableWidth = 698;
    let availableHeight = 1027;
    
    // Subtract header height if visible (50px)
    if (worksheet.boardShowHeader) {
      availableHeight -= 50;
    }
    
    // Subtract footer height if visible (40px)
    if (worksheet.boardShowFooter) {
      availableHeight -= 40;
    }
    
    const gap = 2;
    
    const cellSize = Math.floor((availableWidth - (worksheet.boardColumnCount - 1) * gap) / worksheet.boardColumnCount);
    
    // Calculate rows with proper gap handling (no gap after last row)
    const rowCount = Math.floor((availableHeight + gap) / (cellSize + gap));
    return rowCount * worksheet.boardColumnCount;
  };

  const cardsPerPage = calculateCardsPerPage();
  const totalPages = Math.max(1, Math.ceil(chosenKanjis.length / cardsPerPage));
  const startIndex = (currentPage - 1) * cardsPerPage;

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
                  <div className="flex items-center justify-center h-full text-gray-500 text-center px-8">
                    Select kanji from the Input Panel to generate worksheet
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
              
              <div className="flex-1" style={{ overflow: 'auto' }}>
                {chosenKanjis.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-center px-8">
                    Select kanji from the Input Panel to generate practice worksheet
                  </div>
                ) : (
                  <SheetGrid
                    kanjis={chosenKanjis}
                    startIndex={startIndex}
                    showHeader={worksheet.boardShowHeader}
                    showFooter={worksheet.boardShowFooter}
                    explanationLineCount={debouncedExplanationLineCount}
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
