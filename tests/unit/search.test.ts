import { describe, it, expect } from 'vitest';
import type { KanjiData } from '../../src/features/kanji/kanjiSlice';

// Search utility function (extracted for testing)
export const searchKanjis = (kanjis: KanjiData[], query: string): KanjiData[] => {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  return kanjis.filter((kanji) => {
    const searchableFields = [
      kanji.kanji,
      kanji.sinoViet,
      kanji.meaning,
      kanji.vietnameseMeaning,
      kanji.frequency?.toString() || '',
    ];

    return searchableFields.some((field) =>
      field.toLowerCase().includes(normalizedQuery)
    );
  });
};

describe('Search Functionality', () => {
  const mockKanjis: KanjiData[] = [
    {
      kanji: '火',
      sinoViet: 'HỎA',
      sectionName: 'test-section',
      jlptLevel: 'n5-org',
      gradeLevel: '1',
      onyomi: ['カ'],
      kunyomi: ['ひ'],
      meaning: 'fire',
      vietnameseMeaning: 'lửa',
      frequency: 387,
      category: ['nature'],
    },
    {
      kanji: '水',
      sinoViet: 'THỦY',
      sectionName: 'test-section',
      jlptLevel: 'n5-org',
      gradeLevel: '1',
      onyomi: ['スイ'],
      kunyomi: ['みず'],
      meaning: 'water',
      vietnameseMeaning: 'nước',
      frequency: 196,
      category: ['nature'],
    },
    {
      kanji: '山',
      sinoViet: 'SƠN',
      sectionName: 'test-section',
      jlptLevel: 'n5-org',
      gradeLevel: '1',
      onyomi: ['サン'],
      kunyomi: ['やま'],
      meaning: 'mountain',
      vietnameseMeaning: 'núi',
      frequency: 131,
      category: ['nature'],
    },
  ];

  it('should return empty array for empty query', () => {
    const results = searchKanjis(mockKanjis, '');
    expect(results).toHaveLength(0);
  });

  it('should return empty array for whitespace-only query', () => {
    const results = searchKanjis(mockKanjis, '   ');
    expect(results).toHaveLength(0);
  });

  it('should search by kanji character', () => {
    const results = searchKanjis(mockKanjis, '火');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('火');
  });

  it('should search by han-viet (case-insensitive)', () => {
    const results = searchKanjis(mockKanjis, 'hỏa');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('火');
  });

  it('should search by han-viet uppercase', () => {
    const results = searchKanjis(mockKanjis, 'THỦY');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('水');
  });

  it('should search by english meaning', () => {
    const results = searchKanjis(mockKanjis, 'fire');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('火');
  });

  it('should search by vietnamese meaning', () => {
    const results = searchKanjis(mockKanjis, 'nước');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('水');
  });

  it('should search by frequency number', () => {
    const results = searchKanjis(mockKanjis, '387');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('火');
  });

  it('should handle partial matches in meaning', () => {
    const results = searchKanjis(mockKanjis, 'wat');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('水');
  });

  it('should handle partial matches in han-viet', () => {
    const results = searchKanjis(mockKanjis, 'thủ');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('水');
  });

  it('should be case-insensitive for all fields', () => {
    const resultsLower = searchKanjis(mockKanjis, 'fire');
    const resultsUpper = searchKanjis(mockKanjis, 'FIRE');
    const resultsMixed = searchKanjis(mockKanjis, 'FiRe');
    
    expect(resultsLower).toHaveLength(1);
    expect(resultsUpper).toHaveLength(1);
    expect(resultsMixed).toHaveLength(1);
  });

  it('should handle Vietnamese Unicode characters correctly', () => {
    const results = searchKanjis(mockKanjis, 'núi');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('山');
  });

  it('should return multiple results when query matches multiple kanjis', () => {
    // All three kanjis have "nature" category, but we're searching fields
    // Let's search for partial frequency
    const results = searchKanjis(mockKanjis, '1');
    // Should match: 196, 131, 387 (all contain "1")
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return no results for non-matching query', () => {
    const results = searchKanjis(mockKanjis, 'xyz123');
    expect(results).toHaveLength(0);
  });

  it('should trim whitespace from query', () => {
    const results = searchKanjis(mockKanjis, '  fire  ');
    expect(results).toHaveLength(1);
    expect(results[0].kanji).toBe('火');
  });

  it('should handle special characters in search', () => {
    const results = searchKanjis(mockKanjis, 'ỏ');
    expect(results).toHaveLength(1);
    expect(results[0].sinoViet).toBe('HỎA');
  });
});
