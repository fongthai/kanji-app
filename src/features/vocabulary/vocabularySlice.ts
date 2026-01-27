/**
 * Vocabulary Slice
 *
 * Redux state management for vocabulary learning features
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VocabularyData } from '../../types/vocabulary';

export interface VocabularyState {
  allVocabularies: VocabularyData[]; // All loaded vocabularies
  chosenVocabularies: VocabularyData[]; // User-selected vocabularies
  searchQuery: string; // Search input
  loading: boolean; // Loading state
  error: string | null; // Error message
}

const initialState: VocabularyState = {
  allVocabularies: [],
  chosenVocabularies: [],
  searchQuery: '',
  loading: false,
  error: null,
};

export const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    // Set all vocabularies from IndexedDB
    setAllVocabularies: (state, action: PayloadAction<VocabularyData[]>) => {
      state.allVocabularies = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add a vocabulary to chosen list (if not already present)
    addChosenVocabulary: (state, action: PayloadAction<VocabularyData>) => {
      const exists = state.chosenVocabularies.find(v => v.id === action.payload.id);
      if (!exists) {
        state.chosenVocabularies.push(action.payload);
      }
    },

    // Remove a vocabulary from chosen list
    removeChosenVocabulary: (state, action: PayloadAction<string>) => {
      state.chosenVocabularies = state.chosenVocabularies.filter(
        v => v.id !== action.payload
      );
    },

    // Set the entire chosen vocabularies list (bulk operation)
    setChosenVocabularies: (state, action: PayloadAction<VocabularyData[]>) => {
      state.chosenVocabularies = action.payload;
    },

    // Reorder chosen vocabularies (drag & drop support)
    reorderChosenVocabularies: (
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) => {
      const { oldIndex, newIndex } = action.payload;
      const [removed] = state.chosenVocabularies.splice(oldIndex, 1);
      state.chosenVocabularies.splice(newIndex, 0, removed);
    },

    // Clear all chosen vocabularies
    clearChosenVocabularies: (state) => {
      state.chosenVocabularies = [];
    },

    // Set search query
    setVocabularySearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Set loading state
    setVocabularyLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error message
    setVocabularyError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setAllVocabularies,
  addChosenVocabulary,
  removeChosenVocabulary,
  setChosenVocabularies,
  reorderChosenVocabularies,
  clearChosenVocabularies,
  setVocabularySearchQuery,
  setVocabularyLoading,
  setVocabularyError,
} = vocabularySlice.actions;

export default vocabularySlice.reducer;
