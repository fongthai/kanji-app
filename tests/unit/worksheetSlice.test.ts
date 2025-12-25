import { describe, it, expect } from 'vitest';
import worksheetReducer, {
  setBoardColumnCount,
  setSheetColumnCount,
  setMasterKanjiSize,
  setHanVietOrientation,
  setCurrentPage,
  setCurrentMode,
  setBoardEmptyCellsMode,
  toggleGrayscaleMode,
  toggleBoardShowHeader,
  toggleBoardShowFooter,
} from '../../src/features/worksheet/worksheetSlice';

describe('worksheetSlice', () => {
  const initialState = {
    boardColumnCount: 6,
    boardEmptyCellsMode: 'row' as const,
    boardShowHeader: true,
    boardShowFooter: true,
    sheetColumnCount: 6,
    masterKanjiSize: 150,
    headerText: 'Kanji Practice Worksheet',
    headerFontIndex: 0,
    hanVietOrientation: 'vertical' as const,
    currentPage: 1,
    currentMode: 'board' as const,
    grayscaleMode: false,
  };

  it('should return initial state', () => {
    expect(worksheetReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should set board column count', () => {
    const actual = worksheetReducer(initialState, setBoardColumnCount(8));
    expect(actual.boardColumnCount).toBe(8);
  });

  it('should set sheet column count', () => {
    const actual = worksheetReducer(initialState, setSheetColumnCount(10));
    expect(actual.sheetColumnCount).toBe(10);
  });

  it('should set master kanji size', () => {
    const actual = worksheetReducer(initialState, setMasterKanjiSize(170));
    expect(actual.masterKanjiSize).toBe(170);
  });

  it('should set Han Viet orientation', () => {
    const actual = worksheetReducer(initialState, setHanVietOrientation('horizontal'));
    expect(actual.hanVietOrientation).toBe('horizontal');
  });

  it('should set current page', () => {
    const actual = worksheetReducer(initialState, setCurrentPage(2));
    expect(actual.currentPage).toBe(2);
  });

  it('should set current mode and reset to page 1', () => {
    const stateOnPage2 = { ...initialState, currentPage: 2 };
    const actual = worksheetReducer(stateOnPage2, setCurrentMode('sheet'));
    expect(actual.currentMode).toBe('sheet');
    expect(actual.currentPage).toBe(1);
  });

  it('should set board empty cells mode', () => {
    const actual = worksheetReducer(initialState, setBoardEmptyCellsMode('hide'));
    expect(actual.boardEmptyCellsMode).toBe('hide');
    
    const actual2 = worksheetReducer(actual, setBoardEmptyCellsMode('page'));
    expect(actual2.boardEmptyCellsMode).toBe('page');
  });

  it('should toggle grayscale mode', () => {
    const actual = worksheetReducer(initialState, toggleGrayscaleMode());
    expect(actual.grayscaleMode).toBe(true);
    
    const actual2 = worksheetReducer(actual, toggleGrayscaleMode());
    expect(actual2.grayscaleMode).toBe(false);
  });

  it('should toggle board show header', () => {
    const actual = worksheetReducer(initialState, toggleBoardShowHeader());
    expect(actual.boardShowHeader).toBe(false);
  });

  it('should toggle board show footer', () => {
    const actual = worksheetReducer(initialState, toggleBoardShowFooter());
    expect(actual.boardShowFooter).toBe(false);
  });
});
