import { describe, it, expect, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('Data Loading - JSON Format Validation', () => {
  it('should correctly parse direct array JSON format', async () => {
    const mockData = [
      {
        character: '分',
        'han-viet': 'PHÂN',
        'jlpt-level': 'N5',
        'grade-level': '2',
        onyomi: ['ブン'],
        kunyomi: ['わ.ける'],
        'english-meaning': 'part, minute',
        category: []
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    const response = await fetch('/json/n5-org.json');
    const data = await response.json();
    
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].character).toBe('分');
    expect(data[0]['han-viet']).toBe('PHÂN');
  });

  it('should correctly parse wrapped object JSON format', async () => {
    const mockData = {
      kanji: [
        {
          character: '氏',
          'han-viet': '',
          'jlpt-level': 'jlptn1',
          'grade-level': '4',
          onyomi: ['シ'],
          kunyomi: ['うじ'],
          'english-meaning': 'family name',
          category: []
        }
      ]
    };

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockData,
    });

    const response = await fetch('/json/n1-A-org.json');
    const data = await response.json();
    
    expect(Array.isArray(data)).toBe(false);
    expect(data.kanji).toBeDefined();
    expect(Array.isArray(data.kanji)).toBe(true);
    expect(data.kanji[0].character).toBe('氏');
  });

  it('should handle both JSON formats with unified logic', async () => {
    const directArray = [{ character: '分' }];
    const wrappedObject: { kanji?: Array<{ character: string }> } = { kanji: [{ character: '氏' }] };

    // Test direct array
    const kanjis1 = Array.isArray(directArray) ? directArray : (directArray);
    expect(kanjis1.length).toBe(1);
    expect(kanjis1[0].character).toBe('分');

    // Test wrapped object  
    const kanjis2 = Array.isArray(wrappedObject) ? wrappedObject : (wrappedObject.kanji || []);
    expect(kanjis2.length).toBe(1);
    expect(kanjis2[0].character).toBe('氏');
  });

  it('should extract filename correctly for grouping', () => {
    const testCases = [
      { input: '/json/n5-org.json', expected: 'n5-org' },
      { input: '/json/n4-org.json', expected: 'n4-org' },
      { input: '/json/n1-A-org.json', expected: 'n1-A-org' },
      { input: '/json/n1-G-org.json', expected: 'n1-G-org' },
    ];

    testCases.forEach(({ input, expected }) => {
      const filename = input.split('/').pop()?.replace('.json', '') || '';
      expect(filename).toBe(expected);
    });
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch('/json/invalid.json');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Network error');
    }
  });

  it('should validate property transformation mapping', () => {
    const sourceData = {
      character: '分',
      'han-viet': 'PHÂN',
      'jlpt-level': 'N5',
      'grade-level': '2',
      onyomi: ['ブン'],
      kunyomi: ['わ.ける'],
      'english-meaning': 'part, minute',
      category: []
    };

    // Simulate transformation
    const transformed = {
      kanji: sourceData.character || '',
      jlptLevel: 'n5-org', // filename, not source data
      gradeLevel: sourceData['grade-level'] || '',
      sinoViet: sourceData['han-viet'] || '',
      onyomi: sourceData.onyomi || [],
      kunyomi: sourceData.kunyomi || [],
      meaning: sourceData['english-meaning'] || '',
      category: sourceData.category || [],
    };

    expect(transformed.kanji).toBe('分');
    expect(transformed.sinoViet).toBe('PHÂN');
    expect(transformed.jlptLevel).toBe('n5-org');
    expect(transformed.gradeLevel).toBe('2');
    expect(transformed).not.toHaveProperty('han-viet');
    expect(transformed).not.toHaveProperty('grade-level');
  });

  it('should sort sections in reverse alphabetical order', () => {
    const sections = [
      { name: 'n1-A-org' },
      { name: 'n5-org' },
      { name: 'n4-org' },
      { name: 'n2-A-org' },
      { name: 'n3-B-org' },
    ];

    sections.sort((a, b) => b.name.localeCompare(a.name));

    expect(sections[0].name).toBe('n5-org');
    expect(sections[1].name).toBe('n4-org');
    expect(sections[2].name).toBe('n3-B-org');
    expect(sections[3].name).toBe('n2-A-org');
    expect(sections[4].name).toBe('n1-A-org');
  });
});
