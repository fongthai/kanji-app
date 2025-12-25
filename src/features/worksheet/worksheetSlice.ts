import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_HEADER_TEXT } from '../../constants/appText';

interface WorksheetState {
  // Board mode settings
  boardColumnCount: number;
  boardEmptyCellsMode: 'hide' | 'page' | 'row'; // hide, show full page, or show until last row
  boardShowHeader: boolean;
  boardShowFooter: boolean;
  
  // Sheet mode settings
  sheetColumnCount: number;
  masterKanjiSize: number;
  
  // Header/Footer settings (global across all modes)
  headerText: string;
  headerFontIndex: number; // Index into font list from fonts-manifest-for-non-kanji.txt
  headerAnimationStyle: number; // 0=Gradient Shimmer, 1=Wave Pattern, 2=Holographic, 3=Sparkle, 4=Neon Glow
  
  // Shared settings
  hanVietOrientation: 'vertical' | 'horizontal';
  currentPage: number;
  currentMode: 'sheet' | 'board';
  grayscaleMode: boolean;
}

// Load header text from localStorage or use default
const loadHeaderText = (): string => {
  try {
    const saved = localStorage.getItem('kanjiWorksheet_headerText');
    // Migrate old default text to new default
    if (saved === 'Kanji Practice Worksheet') {
      localStorage.setItem('kanjiWorksheet_headerText', DEFAULT_HEADER_TEXT);
      return DEFAULT_HEADER_TEXT;
    }
    return saved || DEFAULT_HEADER_TEXT;
  } catch {
    return DEFAULT_HEADER_TEXT;
  }
};

const initialState: WorksheetState = {
  // Board mode defaults
  boardColumnCount: 6,
  boardEmptyCellsMode: 'row',
  boardShowHeader: true,
  boardShowFooter: true,
  
  // Sheet mode defaults
  sheetColumnCount: 6,
  masterKanjiSize: 150,
  
  // Header/Footer defaults
  headerText: loadHeaderText(),
  headerFontIndex: 0, // Default to first font (system-ui)
  headerAnimationStyle: Math.floor(Math.random() * 5), // Random animation (0-4)
  
  // Shared defaults
  hanVietOrientation: 'vertical',
  currentPage: 1,
  currentMode: 'board',
  grayscaleMode: false,
};

const worksheetSlice = createSlice({
  name: 'worksheet',
  initialState,
  reducers: {
    // Board mode actions
    setBoardColumnCount: (state, action: PayloadAction<number>) => {
      state.boardColumnCount = action.payload;
      state.currentPage = 1; // Reset to page 1 when column count changes
    },
    setBoardEmptyCellsMode: (state, action: PayloadAction<'hide' | 'page' | 'row'>) => {
      state.boardEmptyCellsMode = action.payload;
    },
    toggleBoardShowHeader: (state) => {
      state.boardShowHeader = !state.boardShowHeader;
    },
    toggleBoardShowFooter: (state) => {
      state.boardShowFooter = !state.boardShowFooter;
    },
    
    // Sheet mode actions
    setSheetColumnCount: (state, action: PayloadAction<number>) => {
      state.sheetColumnCount = action.payload;
    },
    setMasterKanjiSize: (state, action: PayloadAction<number>) => {
      state.masterKanjiSize = action.payload;
    },
    
    // Shared actions
    setHanVietOrientation: (state, action: PayloadAction<'vertical' | 'horizontal'>) => {
      state.hanVietOrientation = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setCurrentMode: (state, action: PayloadAction<'sheet' | 'board'>) => {
      state.currentMode = action.payload;
      state.currentPage = 1; // Reset to first page when switching modes
    },
    toggleGrayscaleMode: (state) => {
      state.grayscaleMode = !state.grayscaleMode;
    },
    
    // Header/Footer actions
    setHeaderText: (state, action: PayloadAction<string>) => {
      state.headerText = action.payload;
      // Persist to localStorage
      try {
        localStorage.setItem('kanjiWorksheet_headerText', action.payload);
      } catch (e) {
        console.warn('Failed to save header text to localStorage:', e);
      }
    },
    cycleHeaderFont: (state, action: PayloadAction<number>) => {
      // action.payload is the total number of fonts available
      state.headerFontIndex = (state.headerFontIndex + 1) % action.payload;
    },
    cycleHeaderAnimation: (state) => {
      // Cycle through 5 animation styles (0-4)
      state.headerAnimationStyle = (state.headerAnimationStyle + 1) % 5;
    },
  },
});

export const {
  setBoardColumnCount,
  setBoardEmptyCellsMode,
  toggleBoardShowHeader,
  toggleBoardShowFooter,
  setSheetColumnCount,
  setMasterKanjiSize,
  setHanVietOrientation,
  setCurrentPage,
  setCurrentMode,
  toggleGrayscaleMode,
  setHeaderText,
  cycleHeaderFont,
  cycleHeaderAnimation,
} = worksheetSlice.actions;

export default worksheetSlice.reducer;
