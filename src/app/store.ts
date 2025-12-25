import { configureStore } from '@reduxjs/toolkit';
import kanjiReducer from '../features/kanji/kanjiSlice';
import worksheetReducer from '../features/worksheet/worksheetSlice';
import displaySettingsReducer from '../features/displaySettings/displaySettingsSlice';

export const store = configureStore({
  reducer: {
    kanji: kanjiReducer,
    worksheet: worksheetReducer,
    displaySettings: displaySettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
