import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IndicatorPreset } from '../../constants/indicators';
import { INDICATOR_PRESETS } from '../../constants/indicators';

export interface FontSizeSettings {
  kanjiFont: string;
  kanjiSize: number;
  hanVietFont: string;
  hanVietSize: number;
  showHanViet: boolean;
  showVietnameseMeaning: boolean; // NEW: Extended indicators - Vietnamese meaning (Board mode)
  showEnglishMeaning: boolean; // NEW: Extended indicators - English meaning (Board mode)
  hanVietOrientation: 'horizontal' | 'vertical'; // New: text orientation
  // New: Individual indicator toggles
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  indicatorPreset: IndicatorPreset;
  // Explanation flags (only used in sheetPanel, optional for others)
  showExplanationMeaning?: boolean;
  showExplanationMnemonic?: boolean;
}

interface VocabularySheetSettings {
  vocabularyFont: string; // Font for vocabulary text
  showHanViet: boolean;
  showVietnameseMeaning: boolean;
  showEnglishMeaning: boolean;
  showExplanation: boolean; // Show explanation (additional notes)
  showExampleSentence: boolean; // Show Japanese example sentence
  showExampleTranslation: boolean; // Show translated example sentence (VI or EN based on language)
  practiceCellSize: number; // Cell size in pixels (30-60, default: 40)
}

interface DisplaySettingsState {
  inputPanel: FontSizeSettings;
  mainPanel: FontSizeSettings; // Used for Board mode
  sheetPanel: FontSizeSettings; // Used for Sheet mode
  vocabularySheet: VocabularySheetSettings; // Vocabulary sheet settings
  pngQuality: 200 | 300 | 600; // DPI: Low (web), Medium (standard), HQ (print)
}
const initialState: DisplaySettingsState = {
  inputPanel: {
    kanjiFont: 'KleeOne-Regular',
    kanjiSize: 75, // Percentage scale: 60%-120%, default 75%
    hanVietFont: 'system-ui',
    hanVietSize: 58, // Percentage scale: 35%-65%, default 58%
    showHanViet: true, // Default: show Hán-Việt
    showVietnameseMeaning: false, // Default: hide Vietnamese (Input Panel)
    showEnglishMeaning: false, // Default: hide English (Input Panel)
    hanVietOrientation: 'horizontal', // Default: horizontal
    // Indicator defaults: JLPT=on, Grade=off, Frequency=on
    showJlptIndicator: true,
    showGradeIndicator: false,
    showFrequencyIndicator: true,
    indicatorPreset: 'custom' as IndicatorPreset,
  },
  mainPanel: {
    kanjiFont: 'KanjiStrokeOrders',
    kanjiSize: 100, // Percentage scale: 60%-120%, default 100%
    hanVietFont: 'system-ui',
    hanVietSize: 58, // Percentage scale: 35%-65%, default 58%
    showHanViet: true, // Default: show Hán-Việt
    showVietnameseMeaning: true, // Default: show Vietnamese (Board mode)
    showEnglishMeaning: true, // Default: show English (Board mode)
    hanVietOrientation: 'horizontal', // Default: horizontal
    // Indicator defaults: JLPT=on, Grade=off, Frequency=on
    showJlptIndicator: true,
    showGradeIndicator: false,
    showFrequencyIndicator: true,
    indicatorPreset: 'custom' as IndicatorPreset,
  },
  sheetPanel: {
    kanjiFont: 'KanjiStrokeOrders',
    kanjiSize: 110, // Percentage scale: 70%-110%, default 110%
    hanVietFont: 'system-ui',
    hanVietSize: 58, // Percentage scale: 35%-65%, default 58%
    showHanViet: true, // Default: show Hán-Việt
    showVietnameseMeaning: false, // Default: hide Vietnamese (Sheet mode)
    showEnglishMeaning: false, // Default: hide English (Sheet mode)
    hanVietOrientation: 'horizontal', // Default: horizontal
    // Indicator defaults: JLPT=on, Grade=off, Frequency=on
    showJlptIndicator: true,
    showGradeIndicator: false,
    showFrequencyIndicator: true,
    indicatorPreset: 'custom' as IndicatorPreset,
    // Explanation defaults: Meaning on, Mnemonic off (matches 'study' preset)
    showExplanationMeaning: true,
    showExplanationMnemonic: false,
  },
  vocabularySheet: {
    vocabularyFont: 'NotoSansJP-Regular', // Default font for vocabulary text
    showHanViet: true,
    showVietnameseMeaning: true,
    showEnglishMeaning: true,
    showExplanation: true, // Default: show explanation
    showExampleSentence: true, // Default: show example sentences
    showExampleTranslation: true, // Default: show translations
    practiceCellSize: 40, // Default: 40px per cell
  },
  pngQuality: 300, // Default: Medium quality (300 DPI)
};

const displaySettingsSlice = createSlice({
  name: 'displaySettings',
  initialState,
  reducers: {
    setInputPanelKanjiFont: (state, action: PayloadAction<string>) => {
      state.inputPanel.kanjiFont = action.payload;
    },
    setInputPanelKanjiSize: (state, action: PayloadAction<number>) => {
      state.inputPanel.kanjiSize = action.payload;
    },
    setInputPanelHanVietFont: (state, action: PayloadAction<string>) => {
      state.inputPanel.hanVietFont = action.payload;
    },
    setInputPanelHanVietSize: (state, action: PayloadAction<number>) => {
      state.inputPanel.hanVietSize = action.payload;
    },
    setMainPanelKanjiFont: (state, action: PayloadAction<string>) => {
      state.mainPanel.kanjiFont = action.payload;
    },
    setMainPanelKanjiSize: (state, action: PayloadAction<number>) => {
      state.mainPanel.kanjiSize = action.payload;
    },
    setMainPanelHanVietFont: (state, action: PayloadAction<string>) => {
      state.mainPanel.hanVietFont = action.payload;
    },
    setMainPanelHanVietSize: (state, action: PayloadAction<number>) => {
      state.mainPanel.hanVietSize = action.payload;
    },
    toggleInputPanelShowHanViet: (state) => {
      state.inputPanel.showHanViet = !state.inputPanel.showHanViet;
    },
    toggleInputPanelHanVietOrientation: (state) => {
      state.inputPanel.hanVietOrientation = state.inputPanel.hanVietOrientation === 'vertical' ? 'horizontal' : 'vertical';
    },
    toggleInputPanelShowJlptIndicator: (state) => {
      state.inputPanel.showJlptIndicator = !state.inputPanel.showJlptIndicator;
      state.inputPanel.indicatorPreset = 'custom';
    },
    toggleInputPanelShowGradeIndicator: (state) => {
      state.inputPanel.showGradeIndicator = !state.inputPanel.showGradeIndicator;
      state.inputPanel.indicatorPreset = 'custom';
    },
    toggleInputPanelShowFrequencyIndicator: (state) => {
      state.inputPanel.showFrequencyIndicator = !state.inputPanel.showFrequencyIndicator;
      state.inputPanel.indicatorPreset = 'custom';
    },
    setInputPanelIndicatorPreset: (state, action: PayloadAction<IndicatorPreset>) => {
      const preset = INDICATOR_PRESETS[action.payload];
      state.inputPanel.showJlptIndicator = preset.showJlpt;
      state.inputPanel.showGradeIndicator = preset.showGrade;
      state.inputPanel.showFrequencyIndicator = preset.showFrequency;
      state.inputPanel.indicatorPreset = action.payload;
    },
    toggleMainPanelShowHanViet: (state) => {
      state.mainPanel.showHanViet = !state.mainPanel.showHanViet;
    },
    toggleMainPanelHanVietOrientation: (state) => {
      state.mainPanel.hanVietOrientation = state.mainPanel.hanVietOrientation === 'vertical' ? 'horizontal' : 'vertical';
    },
    toggleMainPanelShowJlptIndicator: (state) => {
      state.mainPanel.showJlptIndicator = !state.mainPanel.showJlptIndicator;
      state.mainPanel.indicatorPreset = 'custom';
    },
    toggleMainPanelShowGradeIndicator: (state) => {
      state.mainPanel.showGradeIndicator = !state.mainPanel.showGradeIndicator;
      state.mainPanel.indicatorPreset = 'custom';
    },
    toggleMainPanelShowFrequencyIndicator: (state) => {
      state.mainPanel.showFrequencyIndicator = !state.mainPanel.showFrequencyIndicator;
      state.mainPanel.indicatorPreset = 'custom';
    },
    // NEW: Extended indicators for Board mode
    toggleMainPanelShowVietnameseMeaning: (state) => {
      state.mainPanel.showVietnameseMeaning = !state.mainPanel.showVietnameseMeaning;
      state.mainPanel.indicatorPreset = 'custom';
    },
    toggleMainPanelShowEnglishMeaning: (state) => {
      state.mainPanel.showEnglishMeaning = !state.mainPanel.showEnglishMeaning;
      state.mainPanel.indicatorPreset = 'custom';
    },
    // NEW: Extended indicators for Input Panel
    toggleInputPanelShowVietnameseMeaning: (state) => {
      state.inputPanel.showVietnameseMeaning = !state.inputPanel.showVietnameseMeaning;
      state.inputPanel.indicatorPreset = 'custom';
    },
    toggleInputPanelShowEnglishMeaning: (state) => {
      state.inputPanel.showEnglishMeaning = !state.inputPanel.showEnglishMeaning;
      state.inputPanel.indicatorPreset = 'custom';
    },
    // NEW: Extended indicators for Sheet Panel
    toggleSheetPanelShowVietnameseMeaning: (state) => {
      state.sheetPanel.showVietnameseMeaning = !state.sheetPanel.showVietnameseMeaning;
      state.sheetPanel.indicatorPreset = 'custom';
    },
    toggleSheetPanelShowEnglishMeaning: (state) => {
      state.sheetPanel.showEnglishMeaning = !state.sheetPanel.showEnglishMeaning;
      state.sheetPanel.indicatorPreset = 'custom';
    },
    setMainPanelIndicatorPreset: (state, action: PayloadAction<IndicatorPreset>) => {
      const preset = INDICATOR_PRESETS[action.payload];
      state.mainPanel.showJlptIndicator = preset.showJlpt;
      state.mainPanel.showGradeIndicator = preset.showGrade;
      state.mainPanel.showFrequencyIndicator = preset.showFrequency;
      state.mainPanel.indicatorPreset = action.payload;
    },
    // Sheet Panel actions
    setSheetPanelKanjiFont: (state, action: PayloadAction<string>) => {
      state.sheetPanel.kanjiFont = action.payload;
    },
    setSheetPanelKanjiSize: (state, action: PayloadAction<number>) => {
      state.sheetPanel.kanjiSize = action.payload;
    },
    setSheetPanelHanVietFont: (state, action: PayloadAction<string>) => {
      state.sheetPanel.hanVietFont = action.payload;
    },
    setSheetPanelHanVietSize: (state, action: PayloadAction<number>) => {
      state.sheetPanel.hanVietSize = action.payload;
    },
    toggleSheetPanelShowHanViet: (state) => {
      state.sheetPanel.showHanViet = !state.sheetPanel.showHanViet;
    },
    toggleSheetPanelHanVietOrientation: (state) => {
      state.sheetPanel.hanVietOrientation = state.sheetPanel.hanVietOrientation === 'vertical' ? 'horizontal' : 'vertical';
    },
    toggleSheetPanelShowJlptIndicator: (state) => {
      state.sheetPanel.showJlptIndicator = !state.sheetPanel.showJlptIndicator;
      state.sheetPanel.indicatorPreset = 'custom';
    },
    toggleSheetPanelShowGradeIndicator: (state) => {
      state.sheetPanel.showGradeIndicator = !state.sheetPanel.showGradeIndicator;
      state.sheetPanel.indicatorPreset = 'custom';
    },
    toggleSheetPanelShowFrequencyIndicator: (state) => {
      state.sheetPanel.showFrequencyIndicator = !state.sheetPanel.showFrequencyIndicator;
      state.sheetPanel.indicatorPreset = 'custom';
    },
    toggleSheetPanelShowExplanationMeaning: (state) => {
      state.sheetPanel.showExplanationMeaning = !state.sheetPanel.showExplanationMeaning;
      state.sheetPanel.indicatorPreset = 'custom';
    },
    toggleSheetPanelShowExplanationMnemonic: (state) => {
      state.sheetPanel.showExplanationMnemonic = !state.sheetPanel.showExplanationMnemonic;
      state.sheetPanel.indicatorPreset = 'custom';
    },
    setSheetPanelIndicatorPreset: (state, action: PayloadAction<IndicatorPreset>) => {
      const preset = INDICATOR_PRESETS[action.payload];
      state.sheetPanel.showJlptIndicator = preset.showJlpt;
      state.sheetPanel.showGradeIndicator = preset.showGrade;
      state.sheetPanel.showFrequencyIndicator = preset.showFrequency;
      // Also set explanation flags (Sheet mode specific)
      if (preset.showExplanationMeaning !== undefined) {
        state.sheetPanel.showExplanationMeaning = preset.showExplanationMeaning;
      }
      if (preset.showExplanationMnemonic !== undefined) {
        state.sheetPanel.showExplanationMnemonic = preset.showExplanationMnemonic;
      }
      state.sheetPanel.indicatorPreset = action.payload;
    },
    // Vocabulary sheet actions
    setVocabSheetFont: (state, action: PayloadAction<string>) => {
      state.vocabularySheet.vocabularyFont = action.payload;
    },
    toggleVocabShowHanViet: (state) => {
      state.vocabularySheet.showHanViet = !state.vocabularySheet.showHanViet;
    },
    toggleVocabShowVietnameseMeaning: (state) => {
      state.vocabularySheet.showVietnameseMeaning = !state.vocabularySheet.showVietnameseMeaning;
    },
    toggleVocabShowEnglishMeaning: (state) => {
      state.vocabularySheet.showEnglishMeaning = !state.vocabularySheet.showEnglishMeaning;
    },
    toggleVocabShowExplanation: (state) => {
      state.vocabularySheet.showExplanation = !state.vocabularySheet.showExplanation;
    },
    toggleVocabShowExampleSentence: (state) => {
      state.vocabularySheet.showExampleSentence = !state.vocabularySheet.showExampleSentence;
    },
    toggleVocabShowExampleTranslation: (state) => {
      state.vocabularySheet.showExampleTranslation = !state.vocabularySheet.showExampleTranslation;
    },
    setVocabPracticeCellSize: (state, action: PayloadAction<number>) => {
      // Clamp value between 30 and 60
      state.vocabularySheet.practiceCellSize = Math.max(30, Math.min(60, action.payload));
    },
    setPngQuality: (state, action: PayloadAction<200 | 300 | 600>) => {
      state.pngQuality = action.payload;
    },
  },
});

export const {
  setInputPanelKanjiFont,
  setInputPanelKanjiSize,
  setInputPanelHanVietFont,
  setInputPanelHanVietSize,
  setMainPanelKanjiFont,
  setMainPanelKanjiSize,
  setMainPanelHanVietFont,
  setMainPanelHanVietSize,
  toggleInputPanelShowHanViet,
  toggleInputPanelHanVietOrientation,
  toggleInputPanelShowJlptIndicator,
  toggleInputPanelShowGradeIndicator,
  toggleInputPanelShowFrequencyIndicator,
  toggleInputPanelShowVietnameseMeaning,
  toggleInputPanelShowEnglishMeaning,
  setInputPanelIndicatorPreset,
  toggleMainPanelShowHanViet,
  toggleMainPanelHanVietOrientation,
  toggleMainPanelShowJlptIndicator,
  toggleMainPanelShowGradeIndicator,
  toggleMainPanelShowFrequencyIndicator,
  toggleMainPanelShowVietnameseMeaning,
  toggleMainPanelShowEnglishMeaning,
  setMainPanelIndicatorPreset,
  setSheetPanelKanjiFont,
  setSheetPanelKanjiSize,
  setSheetPanelHanVietFont,
  setSheetPanelHanVietSize,
  toggleSheetPanelShowHanViet,
  toggleSheetPanelHanVietOrientation,
  toggleSheetPanelShowJlptIndicator,
  toggleSheetPanelShowGradeIndicator,
  toggleSheetPanelShowFrequencyIndicator,
  toggleSheetPanelShowVietnameseMeaning,
  toggleSheetPanelShowEnglishMeaning,
  toggleSheetPanelShowExplanationMeaning,
  toggleSheetPanelShowExplanationMnemonic,
  setSheetPanelIndicatorPreset,
  setVocabSheetFont,
  toggleVocabShowHanViet,
  toggleVocabShowVietnameseMeaning,
  toggleVocabShowEnglishMeaning,
  toggleVocabShowExplanation,
  toggleVocabShowExampleSentence,
  toggleVocabShowExampleTranslation,
  setVocabPracticeCellSize,
  setPngQuality,
} = displaySettingsSlice.actions;

export default displaySettingsSlice.reducer;
