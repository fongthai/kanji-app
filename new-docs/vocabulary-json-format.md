# Vocabulary JSON Format

## File Structure

```json
{
  "description": "string - Description of this vocabulary set",
  "book": "string - Book/source name  - REQUIRED - (e.g., 'Minna no Nihongo I', 'N3-vietnamjp')",
  "unit": "string - Unit/lesson identifier  - REQUIRED -  (e.g., 'Minna Unit 1', '1')",
  "vocabularies": [
    // Array of vocabulary objects (see below)
  ]
}
```

## Vocabulary Object Structure

Each vocabulary object in the `vocabularies` array:

```typescript
{
  "vocabulary": "string - REQUIRED - The Japanese vocabulary word",
  "furigana": "string - REQUIRED - Hiragana reading",
  "hanViet": "string - Han-Viet reading (uppercase, e.g., 'NAM TÍNH')",
  "vietnameseMeaning": "string - Vietnamese translation",
  "explanation": "string - Additional explanation or notes",
  "englishMeaning": "string - English translation",
  "jlptLevel": "string - JLPT level (e.g., 'N5', 'N4', 'N3', 'N2', 'N1')",
  "category": ["array of strings - Categories (e.g., 'jlpt', 'n3', 'minna', 'textbook')"],
  "exampleSentencesInJapanese": ["array of strings - Japanese example sentences"],
  "exampleSentencesInJapaneseHiragana": ["array of strings - Hiragana/furigana version of example sentences"],
  "exampleSentencesVietnameseTranslate": ["array of strings - Vietnamese translations of examples"],
  "exampleSentencesEnglishTranslate": ["array of strings - English translations of examples"]
}
```

**IMPORTANT:**
- All array fields (`category`, `exampleSentencesInJapanese`, `exampleSentencesInJapaneseHiragana`, `exampleSentencesVietnameseTranslate`, `exampleSentencesEnglishTranslate`) MUST be arrays, never strings
- If no data, use empty array `[]`, NOT empty string `""`
- String fields can be empty strings `""` if no data
- `vocabulary` and `furigana` are required and cannot be empty

## Complete Example

```json
{
  "description": "Vocabulary from Minna no Nihongo Lesson 1",
  "book": "Minna no Nihongo I",
  "unit": "Minna Unit 1",
  "vocabularies": [
    {
      "vocabulary": "男性",
      "furigana": "だんせい",
      "hanViet": "NAM TÍNH",
      "vietnameseMeaning": "nam giới, đàn ông, giới tính nam",
      "explanation": "Used to refer to male gender or men in general",
      "englishMeaning": "male, man, masculine gender",
      "jlptLevel": "N3",
      "category": [
        "jlpt",
        "n3",
        "mimikara"
      ],
      "exampleSentencesInJapanese": [
        "理想の{男性／女性}と結婚する"
      ],
      "exampleSentencesInJapaneseHiragana": [
        "りそうの{だんせい／じょせい}とけっこんする"
      ],
      "exampleSentencesVietnameseTranslate": [
        "Kết hôn với người đàn ông/ phụ nữ lý tưởng."
      ],
      "exampleSentencesEnglishTranslate": [
        "Get married to an ideal man/woman."
      ]
    },
    {
      "vocabulary": "わたし",
      "furigana": "わたし",
      "hanViet": "",
      "vietnameseMeaning": "tôi",
      "explanation": "",
      "englishMeaning": "I, me",
      "jlptLevel": "N5",
      "category": [
        "minna",
        "N5"
      ],
      "exampleSentencesInJapanese": [],
      "exampleSentencesInJapaneseHiragana": [],
      "exampleSentencesVietnameseTranslate": [],
      "exampleSentencesEnglishTranslate": []
    },
    {
      "vocabulary": "あの人",
      "furigana": "あのひと",
      "hanViet": "NHÂN",
      "vietnameseMeaning": "người kia",
      "explanation": "",
      "englishMeaning": "that person",
      "jlptLevel": "N5",
      "category": [
        "minna",
        "N5"
      ],
      "exampleSentencesInJapanese": [
        "あの人は先生です。"
      ],
      "exampleSentencesInJapaneseHiragana": [
        "あのひとはせんせいです。"
      ],
      "exampleSentencesVietnameseTranslate": [
        "Người kia là giáo viên."
      ],
      "exampleSentencesEnglishTranslate": [
        "That person is a teacher."
      ]
    }
  ]
}
```

## Validation Rules

1. **Required fields:** `vocabulary`, `furigana`
2. **Array fields:** Must always be arrays, even if empty
3. **Example sentences:** All four arrays (`exampleSentencesInJapanese`, `exampleSentencesInJapaneseHiragana`, `exampleSentencesVietnameseTranslate`, `exampleSentencesEnglishTranslate`) should have matching lengths
4. **Category:** At least one category recommended
5. **JLPT Level:** Use standard format: N5, N4, N3, N2, or N1
6. **Han-Viet:** Uppercase if provided
