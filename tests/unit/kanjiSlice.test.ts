import { describe, it, expect } from 'vitest';
import kanjiReducer, {
  addKanji,
  removeKanji,
  setAllKanjis,
  clearChosenKanjis,
  reorderChosenKanjis,
} from '../../src/features/kanji/kanjiSlice';
import { testKanjis } from '../fixtures/testKanjis';

describe('kanjiSlice', () => {
  const initialState = {
    chosenKanjis: [],
    allKanjis: [],
    searchQuery: '',
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(kanjiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should add a kanji to chosenKanjis', () => {
    const kanji = testKanjis[0];
    const actual = kanjiReducer(initialState, addKanji(kanji));
    expect(actual.chosenKanjis).toHaveLength(1);
    expect(actual.chosenKanjis[0]).toEqual(kanji);
  });

  it('should not add duplicate kanji', () => {
    const kanji = testKanjis[0];
    const stateWithKanji = kanjiReducer(initialState, addKanji(kanji));
    const actual = kanjiReducer(stateWithKanji, addKanji(kanji));
    expect(actual.chosenKanjis).toHaveLength(1);
  });

  it('should remove a kanji from chosenKanjis', () => {
    const kanji = testKanjis[0];
    const stateWithKanji = kanjiReducer(initialState, addKanji(kanji));
    const actual = kanjiReducer(stateWithKanji, removeKanji(kanji.kanji));
    expect(actual.chosenKanjis).toHaveLength(0);
  });

  it('should set all kanjis', () => {
    const actual = kanjiReducer(initialState, setAllKanjis(testKanjis));
    expect(actual.allKanjis).toHaveLength(testKanjis.length);
    expect(actual.allKanjis).toEqual(testKanjis);
  });

  it('should clear all chosen kanjis', () => {
    const stateWithKanjis = {
      ...initialState,
      chosenKanjis: testKanjis,
    };
    const actual = kanjiReducer(stateWithKanjis, clearChosenKanjis());
    expect(actual.chosenKanjis).toHaveLength(0);
  });

  it('should reorder chosen kanjis', () => {
    const stateWithKanjis = {
      ...initialState,
      chosenKanjis: [testKanjis[0], testKanjis[1], testKanjis[2]],
    };
    // Move first kanji to last position
    const actual = kanjiReducer(stateWithKanjis, reorderChosenKanjis({ oldIndex: 0, newIndex: 2 }));
    expect(actual.chosenKanjis[0].kanji).toBe(testKanjis[1].kanji);
    expect(actual.chosenKanjis[1].kanji).toBe(testKanjis[2].kanji);
    expect(actual.chosenKanjis[2].kanji).toBe(testKanjis[0].kanji);
  });

  it('should reorder chosen kanjis backwards', () => {
    const stateWithKanjis = {
      ...initialState,
      chosenKanjis: [testKanjis[0], testKanjis[1], testKanjis[2]],
    };
    // Move last kanji to first position
    const actual = kanjiReducer(stateWithKanjis, reorderChosenKanjis({ oldIndex: 2, newIndex: 0 }));
    expect(actual.chosenKanjis[0].kanji).toBe(testKanjis[2].kanji);
    expect(actual.chosenKanjis[1].kanji).toBe(testKanjis[0].kanji);
    expect(actual.chosenKanjis[2].kanji).toBe(testKanjis[1].kanji);
  });
});
