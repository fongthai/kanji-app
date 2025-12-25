import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface KanjiData {
  id?: string; // Composite key: kanji-sectionName (optional for backward compatibility)
  kanji: string;
  sinoViet: string;
  sectionName: string;
  jlptLevel: string;
  gradeLevel?: number | string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string;
  vietnameseMeaning: string;
  vietnameseMnemonic?: string;
  lucThu?: string;
  components?: string;
  lookalikes?: string;
  frequency?: number;
  category?: string[];
  orderIndex?: number; // Preserve original position in JSON file
}

interface KanjiState {
  chosenKanjis: KanjiData[];
  allKanjis: KanjiData[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: KanjiState = {
  chosenKanjis: [],
  allKanjis: [],
  searchQuery: '',
  loading: false,
  error: null,
};

const kanjiSlice = createSlice({
  name: 'kanji',
  initialState,
  reducers: {
    addKanji: (state, action: PayloadAction<KanjiData>) => {
      const exists = state.chosenKanjis.find(k => k.kanji === action.payload.kanji);
      if (!exists) {
        state.chosenKanjis.push(action.payload);
      }
    },
    removeKanji: (state, action: PayloadAction<string>) => {
      state.chosenKanjis = state.chosenKanjis.filter(k => k.kanji !== action.payload);
    },
    setAllKanjis: (state, action: PayloadAction<KanjiData[]>) => {
      state.allKanjis = action.payload;
    },
    clearChosenKanjis: (state) => {
      state.chosenKanjis = [];
    },
    setChosenKanjis: (state, action: PayloadAction<KanjiData[]>) => {
      state.chosenKanjis = action.payload;
    },
    reorderChosenKanjis: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
      const { oldIndex, newIndex } = action.payload;
      const [movedKanji] = state.chosenKanjis.splice(oldIndex, 1);
      state.chosenKanjis.splice(newIndex, 0, movedKanji);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { addKanji, removeKanji, setAllKanjis, clearChosenKanjis, setChosenKanjis, reorderChosenKanjis, setSearchQuery } = kanjiSlice.actions;
export default kanjiSlice.reducer;
