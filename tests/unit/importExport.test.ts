import { describe, it, expect } from 'vitest';
import type { KanjiData } from '../../src/features/kanji/kanjiSlice';

// Test utility function for parsing import text
function parseImportText(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Test utility function for matching kanjis
function matchKanjis(kanjiChars: string[], allKanjis: KanjiData[]): KanjiData[] {
  return kanjiChars
    .map(kanjiChar => allKanjis.find(k => k.kanji === kanjiChar))
    .filter((k): k is NonNullable<typeof k> => k !== undefined);
}

// Test utility function for export format
function formatExport(kanjis: KanjiData[]): string {
  return kanjis.map(k => k.kanji).join('\n');
}

describe('Import/Export Logic', () => {
  const mockKanjis: KanjiData[] = [
    {
      kanji: '日',
      sinoViet: 'nhật',
      jlptLevel: 'n5',
      onyomi: ['ニチ', 'ジツ'],
      kunyomi: ['ひ'],
      meaning: 'day, sun',
      sectionName: 'n5-org',
      vietnameseMeaning: 'ngày, mặt trời'
    },
    {
      kanji: '月',
      sinoViet: 'nguyệt',
      jlptLevel: 'n5',
      onyomi: ['ゲツ', 'ガツ'],
      kunyomi: ['つき'],
      meaning: 'month, moon',
      sectionName: 'n5-org',
      vietnameseMeaning: 'tháng, mặt trăng'
    },
    {
      kanji: '火',
      sinoViet: 'hỏa',
      jlptLevel: 'n5',
      onyomi: ['カ'],
      kunyomi: ['ひ'],
      meaning: 'fire',
      sectionName: 'n5-org',
      vietnameseMeaning: 'lửa'
    }
  ];

  describe('parseImportText', () => {
    it('should parse single kanji per line', () => {
      const text = '日\n月\n火';
      const result = parseImportText(text);
      expect(result).toEqual(['日', '月', '火']);
    });

    it('should trim whitespace from each line', () => {
      const text = '  日  \n  月  \n  火  ';
      const result = parseImportText(text);
      expect(result).toEqual(['日', '月', '火']);
    });

    it('should filter out empty lines', () => {
      const text = '日\n\n月\n\n\n火\n';
      const result = parseImportText(text);
      expect(result).toEqual(['日', '月', '火']);
    });

    it('should handle Windows line endings', () => {
      const text = '日\r\n月\r\n火';
      const result = parseImportText(text);
      expect(result).toEqual(['日', '月', '火']);
    });

    it('should return empty array for empty string', () => {
      const result = parseImportText('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      const result = parseImportText('   \n  \n   ');
      expect(result).toEqual([]);
    });
  });

  describe('matchKanjis', () => {
    it('should match all valid kanjis', () => {
      const kanjiChars = ['日', '月', '火'];
      const result = matchKanjis(kanjiChars, mockKanjis);
      expect(result).toHaveLength(3);
      expect(result.map(k => k.kanji)).toEqual(['日', '月', '火']);
    });

    it('should filter out non-matching kanjis', () => {
      const kanjiChars = ['日', '月', '火', '水', '木'];
      const result = matchKanjis(kanjiChars, mockKanjis);
      expect(result).toHaveLength(3);
      expect(result.map(k => k.kanji)).toEqual(['日', '月', '火']);
    });

    it('should return empty array when no matches found', () => {
      const kanjiChars = ['水', '木', '金'];
      const result = matchKanjis(kanjiChars, mockKanjis);
      expect(result).toEqual([]);
    });

    it('should handle duplicate kanjis in input', () => {
      const kanjiChars = ['日', '日', '月'];
      const result = matchKanjis(kanjiChars, mockKanjis);
      expect(result).toHaveLength(3);
      expect(result.map(k => k.kanji)).toEqual(['日', '日', '月']);
    });

    it('should return empty array for empty input', () => {
      const result = matchKanjis([], mockKanjis);
      expect(result).toEqual([]);
    });
  });

  describe('formatExport', () => {
    it('should format kanjis as one per line', () => {
      const result = formatExport(mockKanjis);
      expect(result).toBe('日\n月\n火');
    });

    it('should handle single kanji', () => {
      const result = formatExport([mockKanjis[0]]);
      expect(result).toBe('日');
    });

    it('should return empty string for empty array', () => {
      const result = formatExport([]);
      expect(result).toBe('');
    });

    it('should only export kanji characters, not metadata', () => {
      const result = formatExport(mockKanjis);
      expect(result).not.toContain('nhật');
      expect(result).not.toContain('n5');
      expect(result).not.toContain('meaning');
    });
  });

  describe('Round-trip (export then import)', () => {
    it('should preserve kanjis after export and import', () => {
      const exported = formatExport(mockKanjis);
      const parsed = parseImportText(exported);
      const imported = matchKanjis(parsed, mockKanjis);
      
      expect(imported).toHaveLength(mockKanjis.length);
      expect(imported.map(k => k.kanji)).toEqual(mockKanjis.map(k => k.kanji));
    });
  });
});
