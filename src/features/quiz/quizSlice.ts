import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { KanjiData as Kanji } from '../kanji/kanjiSlice';

export type QuestionType = 'kanjiToHanViet' | 'hanVietToKanji' | 'kanjiToMeaning' | 'kanjiToOnyomi' | 'onyomiToKanji' | 'meaningToKanji';
export type LevelType = 'jlpt' | 'grade';
export type QuestionOrder = 'sequential' | 'random';
export type NumberSelection = 'all' | 'random-10' | 'random-20' | 'random-30' | 'random-50' | 'random-100';
export type ShowField = 'kanji' | 'hanViet' | 'onyomi' | 'vietnamese' | 'english';
export type AskField = 'kanji' | 'hanViet' | 'onyomi' | 'vietnamese' | 'english';

export interface QuizSettings {
  numberSelection: NumberSelection;
  includeKanji: boolean;
  includeVocabulary: boolean;
  levelType: LevelType;
  selectedJlptLevels: string[]; // ['n5', 'n4', 'n3', 'n2', 'n1'] for JLPT tab
  selectedGradeLevels: number[]; // [1, 2, 3, ...12] for Grade tab
  showField: ShowField;
  askField: AskField;
  askFields: AskField[]; // Multi-select when showField is 'kanji'
  questionOrder: QuestionOrder;
  maxTimePerQuestion: 10 | 30 | 60 | 0; // 0 = unlimited
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  questionText: string; // The kanji or han-viet to display
  questionKanji: Kanji; // Reference to full kanji object
  options: string[]; // 4 options (A, B, C, D)
  correctIndex: number; // 0-3
}

export interface UserAnswer {
  questionId: string;
  selectedIndex: number | null; // null = timeout
  timeSpent: number; // milliseconds
  correct: boolean;
}

export interface ActiveQuiz {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: UserAnswer[];
  startTime: number;
  paused: boolean;
}

export interface QuizResult {
  id: string;
  timestamp: number;
  completedAt: number;
  settings: QuizSettings;
  questions: QuizQuestion[];
  answers: UserAnswer[];
  score: number; // 0-10
  percentage: number; // 0-100
}

interface QuizState {
  settings: QuizSettings;
  activeQuiz: ActiveQuiz | null;
  history: QuizResult[];
  showSettings: boolean;
  reviewMode: boolean;
}

const defaultSettings: QuizSettings = {
  numberSelection: 'random-10',
  includeKanji: true,
  includeVocabulary: false,
  levelType: 'jlpt',
  selectedJlptLevels: ['n5'],
  selectedGradeLevels: [1, 2, 3],
  showField: 'kanji',
  askField: 'hanViet',
  askFields: ['hanViet'],
  questionOrder: 'sequential',
  maxTimePerQuestion: 30,
};

// Load settings from localStorage
const loadSettings = (): QuizSettings => {
  try {
    const saved = localStorage.getItem('quiz-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load quiz settings:', error);
  }
  return defaultSettings;
};

// Load active quiz from localStorage
const loadActiveQuiz = (): ActiveQuiz | null => {
  try {
    const saved = localStorage.getItem('quiz-active');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load active quiz:', error);
  }
  return null;
};

// Load quiz history from localStorage
const loadHistory = (): QuizResult[] => {
  try {
    const saved = localStorage.getItem('quiz-history');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load quiz history:', error);
  }
  return [];
};

const initialState: QuizState = {
  settings: loadSettings(),
  activeQuiz: loadActiveQuiz(),
  history: loadHistory(),
  showSettings: true,
  reviewMode: false,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // Settings actions
    updateSettings: (state, action: PayloadAction<Partial<QuizSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setNumberSelection: (state, action: PayloadAction<NumberSelection>) => {
      state.settings.numberSelection = action.payload;
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setIncludeKanji: (state, action: PayloadAction<boolean>) => {
      state.settings.includeKanji = action.payload;
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setIncludeVocabulary: (state, action: PayloadAction<boolean>) => {
      state.settings.includeVocabulary = action.payload;
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setLevelType: (state, action: PayloadAction<LevelType>) => {
      state.settings.levelType = action.payload;
      // Reset to appropriate defaults when switching tabs
      if (action.payload === 'jlpt') {
        state.settings.selectedJlptLevels = ['n5'];
      } else if (action.payload === 'grade') {
        state.settings.selectedGradeLevels = [1, 2, 3];
      }
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setSelectedJlptLevels: (state, action: PayloadAction<string[]>) => {
      state.settings.selectedJlptLevels = action.payload;
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    toggleJlptLevel: (state, action: PayloadAction<string>) => {
      const level = action.payload;
      const index = state.settings.selectedJlptLevels.indexOf(level);
      if (index > -1) {
        state.settings.selectedJlptLevels.splice(index, 1);
      } else {
        state.settings.selectedJlptLevels.push(level);
      }
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setSelectedGradeLevels: (state, action: PayloadAction<number[]>) => {
      state.settings.selectedGradeLevels = action.payload;
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    toggleGradeLevel: (state, action: PayloadAction<number>) => {
      const level = action.payload;
      const index = state.settings.selectedGradeLevels.indexOf(level);
      if (index > -1) {
        state.settings.selectedGradeLevels.splice(index, 1);
      } else {
        state.settings.selectedGradeLevels.push(level);
      }
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setMaxTimePerQuestion: (state, action: PayloadAction<10 | 30 | 60 | 0>) => {
      state.settings.maxTimePerQuestion = action.payload;
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setShowField: (state, action: PayloadAction<ShowField>) => {
      state.settings.showField = action.payload;
      // Auto-adjust askField to ensure one must be 'kanji'
      if (action.payload !== 'kanji' && state.settings.askField !== 'kanji') {
        state.settings.askField = 'kanji';
      }
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setAskField: (state, action: PayloadAction<AskField>) => {
      state.settings.askField = action.payload;
      // Auto-adjust showField to ensure one must be 'kanji'
      if (action.payload !== 'kanji' && state.settings.showField !== 'kanji') {
        state.settings.showField = 'kanji';
      }
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    toggleAskField: (state, action: PayloadAction<AskField>) => {
      const index = state.settings.askFields.indexOf(action.payload);
      if (index === -1) {
        state.settings.askFields.push(action.payload);
      } else if (state.settings.askFields.length > 1) {
        // Don't allow deselecting all fields
        state.settings.askFields.splice(index, 1);
      }
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    toggleQuestionType: (state, _action: PayloadAction<QuestionType>) => {
      // Deprecated - kept for backward compatibility
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    setQuestionOrder: (state, action: PayloadAction<QuestionOrder>) => {
      state.settings.questionOrder = action.payload;
      localStorage.setItem('quiz-settings', JSON.stringify(state.settings));
    },

    // UI actions
    setShowSettings: (state, action: PayloadAction<boolean>) => {
      state.showSettings = action.payload;
    },

    setReviewMode: (state, action: PayloadAction<boolean>) => {
      state.reviewMode = action.payload;
    },

    // Quiz actions
    startQuiz: (state, _action: PayloadAction<{ allKanjis: Kanji[] }>) => {
      // Question generation happens in QuizSettings component before calling this action
      // This action receives pre-generated questions
      // For now, we'll generate questions here temporarily
      state.activeQuiz = {
        questions: [], // Will be populated by component
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
        paused: false,
      };
      state.showSettings = false;
      state.reviewMode = false;
      localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
    },

    setQuizQuestions: (state, action: PayloadAction<QuizQuestion[]>) => {
      if (state.activeQuiz) {
        state.activeQuiz.questions = action.payload;
        localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
      }
    },

    submitAnswer: (state, action: PayloadAction<UserAnswer>) => {
      if (state.activeQuiz) {
        state.activeQuiz.answers.push(action.payload);
        localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
      }
    },

    nextQuestion: (state) => {
      if (state.activeQuiz && state.activeQuiz.currentIndex < state.activeQuiz.questions.length - 1) {
        state.activeQuiz.currentIndex += 1;
        localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
      }
    },

    previousQuestion: (state) => {
      if (state.activeQuiz && state.activeQuiz.currentIndex > 0) {
        state.activeQuiz.currentIndex -= 1;
        localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
      }
    },

    pauseQuiz: (state) => {
      if (state.activeQuiz) {
        state.activeQuiz.paused = true;
        localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
      }
    },

    resumeQuiz: (state) => {
      if (state.activeQuiz) {
        state.activeQuiz.paused = false;
        localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
      }
    },

    completeQuiz: (state) => {
      if (state.activeQuiz) {
        // Calculate score
        const correct = state.activeQuiz.answers.filter(a => a.correct).length;
        const total = state.activeQuiz.questions.length;
        const score = (correct / total) * 10;
        const percentage = (correct / total) * 100;

        // Create result
        const result: QuizResult = {
          id: `quiz-${Date.now()}`,
          timestamp: Date.now(),
          completedAt: Date.now(),
          settings: state.settings,
          questions: state.activeQuiz.questions,
          answers: state.activeQuiz.answers,
          score: Math.round(score * 10) / 10, // Round to 1 decimal
          percentage: Math.round(percentage),
        };

        // Add to history
        state.history.unshift(result);
        
        // Keep only last 50 quizzes
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50);
        }
        
        localStorage.setItem('quiz-history', JSON.stringify(state.history));
        
        // Enter review mode and clear active quiz
        state.reviewMode = true;
        state.activeQuiz = null;
        
        // Clear active quiz from localStorage
        localStorage.removeItem('quiz-active');
      }
    },

    abandonQuiz: (state) => {
      state.activeQuiz = null;
      state.reviewMode = false;
      state.showSettings = true;
      localStorage.removeItem('quiz-active');
    },

    restartQuiz: (state) => {
      if (state.history.length > 0) {
        const lastResult = state.history[0];
        // Recreate activeQuiz from last completed quiz
        state.activeQuiz = {
          questions: lastResult.questions,
          currentIndex: 0,
          answers: [],
          startTime: Date.now(),
          paused: false,
        };
        // Ensure review mode is off
        state.reviewMode = false;
        // Save to localStorage
        localStorage.setItem('quiz-active', JSON.stringify(state.activeQuiz));
      }
    },

    quitAndCalculate: (state) => {
      if (state.activeQuiz) {
        // Calculate score ONLY based on answered questions (up to currentIndex - 1)
        // Don't count current and remaining questions
        const answeredQuestionsCount = state.activeQuiz.answers.length;
        const correctCount = state.activeQuiz.answers.filter(a => a.correct).length;
        
        // Score based only on answered questions, not total questions
        const score = answeredQuestionsCount > 0 ? (correctCount / answeredQuestionsCount) * 10 : 0;
        const percentage = answeredQuestionsCount > 0 ? (correctCount / answeredQuestionsCount) * 100 : 0;

        // Create result
        const result: QuizResult = {
          id: `quiz-${Date.now()}`,
          timestamp: state.activeQuiz.startTime,
          completedAt: Date.now(),
          settings: state.settings,
          questions: state.activeQuiz.questions,
          answers: state.activeQuiz.answers,
          score: Math.round(score * 10) / 10,
          percentage: Math.round(percentage),
        };

        // Add to history
        state.history.unshift(result);
        
        // Keep only last 50 quizzes
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50);
        }
        
        localStorage.setItem('quiz-history', JSON.stringify(state.history));
        
        // Enter review mode
        state.reviewMode = true;
        state.activeQuiz = null;
        
        // Clear active quiz from localStorage
        localStorage.removeItem('quiz-active');
      }
    },

    clearHistory: (state) => {
      state.history = [];
      localStorage.removeItem('quiz-history');
    },
  },
});

export const {
  updateSettings,
  setNumberSelection,
  setIncludeKanji,
  setIncludeVocabulary,
  setLevelType,
  setSelectedJlptLevels,
  toggleJlptLevel,
  setSelectedGradeLevels,
  toggleGradeLevel,
  setMaxTimePerQuestion,
  setShowField,
  setAskField,
  toggleAskField,
  toggleQuestionType,
  setQuestionOrder,
  setShowSettings,
  setReviewMode,
  startQuiz,
  setQuizQuestions,
  submitAnswer,
  nextQuestion,
  previousQuestion,
  pauseQuiz,
  resumeQuiz,
  completeQuiz,
  abandonQuiz,
  quitAndCalculate,
  restartQuiz,
  clearHistory,
} = quizSlice.actions;

export default quizSlice.reducer;
