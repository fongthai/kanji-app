import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IndicatorPreset } from '../../constants/indicators';
import { INDICATOR_PRESETS } from '../../constants/indicators';

export interface FontSizeSettings {
  kanjiFont: string;
  kanjiSize: number;
  hanVietFont: string;
  hanVietSize: number;
  showHanViet: boolean;
  hanVietOrientation: 'horizontal' | 'vertical'; // New: text orientation
  // New: Individual indicator toggles
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  indicatorPreset: IndicatorPreset;
}

interface DisplaySettingsState {
  inputPanel: FontSizeSettings;
  mainPanel: FontSizeSettings;
  pngQuality: 200 | 300 | 600; // DPI: Low (web), Medium (standard), HQ (print)
}
const initialState: DisplaySettingsState = {
  inputPanel: {
    kanjiFont: 'YujiMai-Regular',
    kanjiSize: 75, // Percentage scale: 60%-120%, default 75%
    hanVietFont: 'system-ui',
    hanVietSize: 80, // Percentage scale: 50%-100%, default 80%
    showHanViet: true, // Default: show Hán-Việt
    hanVietOrientation: 'vertical', // Default: vertical
    // Indicator defaults: JLPT=on, Grade=off, Frequency=on
    showJlptIndicator: true,
    showGradeIndicator: false,
    showFrequencyIndicator: true,
    indicatorPreset: 'custom' as IndicatorPreset,
  },
  mainPanel: {
    kanjiFont: 'KanjiStrokeOrders',
    kanjiSize: 90, // Percentage scale: 60%-120%, default at midpoint (90%)
    hanVietFont: 'system-ui',
    hanVietSize: 68, // Percentage scale: 50%-100%, default 68%
    showHanViet: true, // Default: show Hán-Việt
    hanVietOrientation: 'vertical', // Default: vertical
    // Indicator defaults: JLPT=on, Grade=off, Frequency=on
    showJlptIndicator: true,
    showGradeIndicator: false,
    showFrequencyIndicator: true,
    indicatorPreset: 'custom' as IndicatorPreset,
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
    setMainPanelIndicatorPreset: (state, action: PayloadAction<IndicatorPreset>) => {
      const preset = INDICATOR_PRESETS[action.payload];
      state.mainPanel.showJlptIndicator = preset.showJlpt;
      state.mainPanel.showGradeIndicator = preset.showGrade;
      state.mainPanel.showFrequencyIndicator = preset.showFrequency;
      state.mainPanel.indicatorPreset = action.payload;
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
  setInputPanelIndicatorPreset,
  toggleMainPanelShowHanViet,
  toggleMainPanelHanVietOrientation,
  toggleMainPanelShowJlptIndicator,
  toggleMainPanelShowGradeIndicator,
  toggleMainPanelShowFrequencyIndicator,
  setMainPanelIndicatorPreset,
  setPngQuality,
} = displaySettingsSlice.actions;

export default displaySettingsSlice.reducer;
