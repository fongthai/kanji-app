import type { KanjiData } from '../../src/features/kanji/kanjiSlice';

/**
 * Test fixture with carefully selected kanji that cover edge cases:
 * - Short readings (日)
 * - Long readings (行)
 * - Multiple meanings
 * - Different JLPT levels
 * - Various character complexities
 */
export const testKanjis: KanjiData[] = [
  {
    kanji: '日',
    hanViet: 'NHẬT',
    sectionName: 'test-section',
    jlptLevel: 'N5',
    gradeLevel: 1,
    onyomi: ['ニチ', 'ジツ'],
    kunyomi: ['ひ', '-び', '-か'],
    meaning: 'sun, day',
    vietnameseMeaning: 'mặt trời, ngày',
    category: ['numbers_time'],
  },
  {
    kanji: '行',
    hanViet: 'HÀNH, HẠNH, HÀNG,항, 항, ハンフ',
    sectionName: 'test-section',
    jlptLevel: 'N5',
    gradeLevel: 2,
    onyomi: ['コウ', 'ギョウ', 'アン'],
    kunyomi: ['い-く', 'ゆ-く', 'おこな-う'],
    meaning: 'to go; to do',
    vietnameseMeaning: 'đi, làm',
    category: ['verbs_basic'],
  },
  {
    kanji: '人',
    hanViet: 'NHÂN',
    sectionName: 'test-section',
    jlptLevel: 'N5',
    gradeLevel: 1,
    onyomi: ['ジン', 'ニン'],
    kunyomi: ['ひと', '-り', '-と'],
    meaning: 'person',
    vietnameseMeaning: 'người',
    category: ['people_family'],
  },
  {
    kanji: '大',
    hanViet: 'ĐẠI, THÁI, ĐẠI',
    sectionName: 'test-section',
    jlptLevel: 'N5',
    gradeLevel: 1,
    onyomi: ['ダイ', 'タイ'],
    kunyomi: ['おお-きい', '-おお-いに'],
    meaning: 'large, big',
    vietnameseMeaning: 'lớn',
    category: ['adjectives'],
  },
  {
    kanji: '見',
    hanViet: 'KIẾN',
    sectionName: 'test-section',
    jlptLevel: 'N5',
    gradeLevel: 1,
    onyomi: ['ケン'],
    kunyomi: ['み-る', 'み-える', 'み-せる'],
    meaning: 'to see',
    vietnameseMeaning: 'nhìn, thấy',
    category: ['verbs_basic'],
  },
];

/**
 * Get a random subset of test kanji
 */
export function getRandomKanjis(count: number = 3): KanjiData[] {
  const shuffled = [...testKanjis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, testKanjis.length));
}

/**
 * Get kanji with intentionally long text to test overflow
 */
export function getOverflowTestKanji(): KanjiData {
  return {
    kanji: '行',
    hanViet: 'HÀNH, HẠNH, HÀNG,항, 항, ハンフ',
    sectionName: 'test-section',
    jlptLevel: 'N5',
    gradeLevel: 2,
    onyomi: ['コウ', 'ギョウ', 'アン', 'コウ', 'ギョウ'],
    kunyomi: ['い-く', 'ゆ-く', 'おこな-う', 'い-く', 'ゆ-く'],
    meaning: 'to go; to walk; to move; to travel; to perform an action; to conduct business; very long meaning to test overflow in the UI rendering',
    vietnameseMeaning: 'đi; đi bộ; di chuyển; du lịch; thực hiện hành động; kiểm doanh',
    category: ['verbs_basic', 'test_category'],
  };
}
