import type { KanjiData as Kanji } from '../features/kanji/kanjiSlice';
import type { QuizSettings, QuizQuestion, QuestionType } from '../features/quiz/quizSlice';

/**
 * Truncate long text to prevent overflow in quiz display
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get first value from comma-separated list or array
 * Used for fields like onyomi, kunyomi that can have multiple values
 */
function getFirstValue(value: string | string[] | undefined, maxLength: number = 50): string {
  if (!value) return '';
  
  if (Array.isArray(value)) {
    return truncateText(value[0] || '', maxLength);
  }
  
  // If comma-separated string, take first value
  const firstValue = value.split(',')[0].trim();
  return truncateText(firstValue, maxLength);
}

/**
 * Filter kanjis by selected level (JLPT or grade)
 */
export function filterKanjisByLevel(
  levelType: 'jlpt' | 'grade',
  selectedLevel: string[] | number[],
  allKanjis: Kanji[]
): Kanji[] {
  if (levelType === 'jlpt') {
    // Multiple JLPT level selection
    const levels = Array.isArray(selectedLevel) ? selectedLevel : [selectedLevel];
    const upperLevels = levels.map(l => String(l).toUpperCase());
    return allKanjis.filter(k => k.jlptLevel && upperLevels.includes(k.jlptLevel.toUpperCase()));
  } else if (levelType === 'grade') {
    // Multiple grade level selection
    const grades = (Array.isArray(selectedLevel) ? selectedLevel : [selectedLevel]) as number[];
    return allKanjis.filter(k => {
      // Handle both number and string gradeLevels
      if (typeof k.gradeLevel === 'number') {
        return grades.includes(k.gradeLevel);
      } else if (typeof k.gradeLevel === 'string') {
        const numVal = parseInt(k.gradeLevel, 10);
        if (!isNaN(numVal)) {
          return grades.includes(numVal);
        }
      }
      return false;
    });
  }
  return [];
}

/**
 * Select 3 wrong answers based on priority: lookalike → same radical → same onyomi → similar hanviet → random
 */
export function selectWrongAnswers(
  correctKanji: Kanji,
  questionType: QuestionType,
  kanjiPool: Kanji[],
  excludeKanji: Kanji
): string[] {
  const wrongAnswers: string[] = [];
  const used = new Set<string>();
  
  // Get correct answer to avoid duplicates
  let correctAnswer = '';
  if (questionType === 'kanjiToHanViet') correctAnswer = correctKanji.hanViet;
  else if (questionType === 'hanVietToKanji') correctAnswer = correctKanji.kanji;
  else if (questionType === 'kanjiToMeaning') correctAnswer = correctKanji.meaning;
  else if (questionType === 'kanjiToOnyomi') correctAnswer = getFirstValue(correctKanji.onyomi, 40);
  else if (questionType === 'onyomiToKanji') correctAnswer = correctKanji.kanji;
  else if (questionType === 'meaningToKanji') correctAnswer = correctKanji.kanji;
  used.add(correctAnswer);

  // Helper to add answer if valid
  const tryAdd = (answer: string): boolean => {
    if (!answer || used.has(answer) || wrongAnswers.length >= 3) return false;
    wrongAnswers.push(answer);
    used.add(answer);
    return true;
  };

  // Helper to get answer from kanji based on question type
  const getAnswer = (k: Kanji): string => {
    if (questionType === 'kanjiToHanViet') return truncateText(k.hanViet, 80);
    if (questionType === 'hanVietToKanji') return k.kanji;
    if (questionType === 'kanjiToMeaning') return truncateText(k.meaning, 80);
    if (questionType === 'kanjiToOnyomi') return getFirstValue(k.onyomi, 40);
    if (questionType === 'onyomiToKanji') return k.kanji;
    if (questionType === 'meaningToKanji') return k.kanji;
    return truncateText(k.meaning, 80);
  };

  // Filter out the correct kanji and the one being excluded
  let candidates = kanjiPool.filter(
    k => k.kanji !== correctKanji.kanji && k.kanji !== excludeKanji.kanji
  );
  
  // Special filtering for onyomi questions to avoid duplicates
  if (questionType === 'onyomiToKanji') {
    // Exclude kanjis that have the same onyomi as the correct answer
    const correctOnyomi = getFirstValue(correctKanji.onyomi, 40);
    candidates = candidates.filter(k => {
      const kanjiOnyomi = getFirstValue(k.onyomi, 40);
      return kanjiOnyomi !== correctOnyomi;
    });
  }

  // Priority 1: Lookalike kanjis
  if (correctKanji.lookalikes && Array.isArray(correctKanji.lookalikes) && correctKanji.lookalikes.length > 0) {
    const lookalikes = candidates.filter(k => 
      correctKanji.lookalikes && Array.isArray(correctKanji.lookalikes) && correctKanji.lookalikes.some((look: string) => k.kanji === look)
    );
    shuffle(lookalikes);
    for (const k of lookalikes) {
      if (tryAdd(getAnswer(k))) break;
    }
  }

  // Priority 2: Same onyomi (skip for onyomi question types to avoid confusion)
  if (wrongAnswers.length < 3 && 
      correctKanji.onyomi && 
      correctKanji.onyomi.length > 0 &&
      questionType !== 'kanjiToOnyomi' && 
      questionType !== 'onyomiToKanji') {
    const sameOnyomi = candidates.filter(k =>
      k.onyomi && k.onyomi.some((on: string) => correctKanji.onyomi.includes(on))
    );
    shuffle(sameOnyomi);
    for (const k of sameOnyomi) {
      if (tryAdd(getAnswer(k))) {
        if (wrongAnswers.length >= 3) break;
      }
    }
  }

  // Priority 4: Similar hanviet (first character match)
  if (wrongAnswers.length < 3 && correctKanji.hanViet) {
    const firstChar = correctKanji.hanViet.split(/[,\s]/)[0];
    const similarHanViet = candidates.filter(k =>
      k.hanViet && k.hanViet.startsWith(firstChar)
    );
    shuffle(similarHanViet);
    for (const k of similarHanViet) {
      if (tryAdd(getAnswer(k))) {
        if (wrongAnswers.length >= 3) break;
      }
    }
  }

  // Priority 4: Random from same category
  if (wrongAnswers.length < 3 && correctKanji.category && correctKanji.category.length > 0) {
    const sameCategory = candidates.filter(k =>
      k.category && k.category.some((cat: string) => correctKanji.category!.includes(cat))
    );
    shuffle(sameCategory);
    for (const k of sameCategory) {
      if (tryAdd(getAnswer(k))) {
        if (wrongAnswers.length >= 3) break;
      }
    }
  }

  // Priority 5: Completely random
  if (wrongAnswers.length < 3) {
    const remaining = candidates.slice();
    shuffle(remaining);
    for (const k of remaining) {
      if (tryAdd(getAnswer(k))) {
        if (wrongAnswers.length >= 3) break;
      }
    }
  }

  return wrongAnswers;
}

/**
 * Generate quiz questions based on settings
 */
export function generateQuestions(
  settings: QuizSettings,
  allKanjis: Kanji[],
  preFilteredKanjis?: Kanji[]
): QuizQuestion[] {
  let filteredKanjis: Kanji[];

  // If preFilteredKanjis is provided, use those directly (for quick quiz from sections)
  if (preFilteredKanjis && preFilteredKanjis.length > 0) {
    filteredKanjis = preFilteredKanjis;
  } else {
    // Filter kanjis by level
    let levelSelection: string[] | number[];
    if (settings.levelType === 'jlpt') {
      levelSelection = settings.selectedJlptLevels;
    } else {
      levelSelection = settings.selectedGradeLevels;
    }

    filteredKanjis = filterKanjisByLevel(
      settings.levelType,
      levelSelection,
      allKanjis
    );
  }

  // Filter kanjis to only those with required fields for showField/askFields
  const requiredFields = [settings.showField, ...settings.askFields];
  filteredKanjis = filteredKanjis.filter(k => {
    for (const field of requiredFields) {
      if (field === 'kanji') continue; // Kanji always exists
      if (field === 'hanViet' && (!k.hanViet || k.hanViet.trim() === '')) return false;
      if (field === 'onyomi' && (!k.onyomi || k.onyomi.length === 0 || !k.onyomi[0])) return false;
      if (field === 'vietnamese' && (!k.vietnameseMeaning || k.vietnameseMeaning.trim() === '')) return false;
      if (field === 'english' && (!k.meaning || k.meaning.trim() === '')) return false;
    }
    return true;
  });

  if (filteredKanjis.length === 0) {
    return [];
  }

  // Apply number selection
  let selectedKanjis: Kanji[];
  if (settings.numberSelection === 'all') {
    selectedKanjis = filteredKanjis;
  } else {
    const num = settings.numberSelection === 'random-10' ? 10
              : settings.numberSelection === 'random-20' ? 20
              : settings.numberSelection === 'random-30' ? 30
              : settings.numberSelection === 'random-50' ? 50
              : 100;
    const shuffled = shuffle([...filteredKanjis]);
    selectedKanjis = shuffled.slice(0, Math.min(num, filteredKanjis.length));
  }

  // Apply question order
  if (settings.questionOrder === 'random') {
    selectedKanjis = shuffle([...selectedKanjis]);
  }

  // Generate questions based on showField/askFields (cycle through askFields)
  const questions: QuizQuestion[] = [];
  const questionSet = new Set<string>(); // Track question uniqueness
  
  for (let i = 0; i < selectedKanjis.length; i++) {
    const askField = settings.askFields[i % settings.askFields.length];
    const question = createQuestionFromFields(selectedKanjis[i], settings.showField, askField, filteredKanjis);
    
    // Create a unique key for this question to avoid duplicates
    const questionKey = `${question.questionText}-${question.type}`;
    
    if (!questionSet.has(questionKey)) {
      questions.push(question);
      questionSet.add(questionKey);
    }
  }

  return questions;
}

/**
 * Get field value from kanji based on field name
 */
function getFieldValue(kanji: Kanji, field: 'kanji' | 'hanViet' | 'onyomi' | 'vietnamese' | 'english'): string {
  switch (field) {
    case 'kanji':
      return kanji.kanji;
    case 'hanViet':
      return truncateText(kanji.hanViet, 80);
    case 'onyomi':
      return getFirstValue(kanji.onyomi, 40);
    case 'vietnamese':
      return truncateText(kanji.vietnameseMeaning || kanji.meaning, 80);
    case 'english':
      return truncateText(kanji.meaning, 80);
    default:
      return '';
  }
}

/**
 * Create a question based on showField and askField
 */
function createQuestionFromFields(
  kanji: Kanji,
  showField: 'kanji' | 'hanViet' | 'onyomi' | 'vietnamese' | 'english',
  askField: 'kanji' | 'hanViet' | 'onyomi' | 'vietnamese' | 'english',
  kanjiPool: Kanji[]
): QuizQuestion {
  const questionText = getFieldValue(kanji, showField);
  const correctAnswer = getFieldValue(kanji, askField);

  // Convert to legacy question type for compatibility
  let legacyType: QuestionType = 'kanjiToHanViet';
  if (showField === 'kanji' && askField === 'hanViet') legacyType = 'kanjiToHanViet';
  else if (showField === 'hanViet' && askField === 'kanji') legacyType = 'hanVietToKanji';
  else if (showField === 'kanji' && (askField === 'vietnamese' || askField === 'english')) legacyType = 'kanjiToMeaning';
  else if ((showField === 'vietnamese' || showField === 'english') && askField === 'kanji') legacyType = 'meaningToKanji';
  else if (showField === 'kanji' && askField === 'onyomi') legacyType = 'kanjiToOnyomi';
  else if (showField === 'onyomi' && askField === 'kanji') legacyType = 'onyomiToKanji';

  // Get 3 wrong answers using field-based selection
  const wrongAnswers = selectWrongAnswersForFields(kanji, askField, kanjiPool);
  
  // Combine and shuffle options
  const options = [correctAnswer, ...wrongAnswers];
  const shuffledOptions = shuffle(options);
  
  // Find correct index after shuffling
  const correctIndex = shuffledOptions.indexOf(correctAnswer);

  return {
    id: `${Date.now()}-${Math.random()}`,
    type: legacyType,
    questionText,
    questionKanji: kanji,
    options: shuffledOptions as [string, string, string, string],
    correctIndex: correctIndex as 0 | 1 | 2 | 3,
  };
}

/**
 * Select 3 wrong answers for field-based questions
 */
function selectWrongAnswersForFields(
  correctKanji: Kanji,
  askField: 'kanji' | 'hanViet' | 'onyomi' | 'vietnamese' | 'english',
  kanjiPool: Kanji[]
): string[] {
  const wrongAnswers: string[] = [];
  const used = new Set<string>();
  
  const correctAnswer = getFieldValue(correctKanji, askField);
  used.add(correctAnswer);

  const tryAdd = (answer: string): boolean => {
    if (!answer || used.has(answer) || wrongAnswers.length >= 3) return false;
    wrongAnswers.push(answer);
    used.add(answer);
    return true;
  };

  // Filter candidates and shuffle
  let candidates = kanjiPool.filter(k => k.kanji !== correctKanji.kanji);
  
  // For onyomi answers, avoid duplicates
  if (askField === 'onyomi') {
    const correctOnyomi = getFirstValue(correctKanji.onyomi, 40);
    candidates = candidates.filter(k => {
      const kanjiOnyomi = getFirstValue(k.onyomi, 40);
      return kanjiOnyomi !== correctOnyomi;
    });
  }

  // Priority 1: Lookalike kanjis (if asking for kanji)
  if (askField === 'kanji' && correctKanji.lookalikes && Array.isArray(correctKanji.lookalikes)) {
    const lookalikes = candidates.filter(k => 
      Array.isArray(correctKanji.lookalikes) && correctKanji.lookalikes.some((look: string) => k.kanji === look)
    );
    shuffle(lookalikes);
    for (const k of lookalikes) {
      if (tryAdd(getFieldValue(k, askField))) {
        if (wrongAnswers.length >= 3) return wrongAnswers;
      }
    }
  }

  // Priority 2: Same category
  if (wrongAnswers.length < 3 && correctKanji.category && correctKanji.category.length > 0) {
    const sameCategory = candidates.filter(k =>
      k.category && k.category.some((cat: string) => correctKanji.category!.includes(cat))
    );
    shuffle(sameCategory);
    for (const k of sameCategory) {
      if (tryAdd(getFieldValue(k, askField))) {
        if (wrongAnswers.length >= 3) return wrongAnswers;
      }
    }
  }

  // Priority 3: Random
  shuffle(candidates);
  for (const k of candidates) {
    if (tryAdd(getFieldValue(k, askField))) {
      if (wrongAnswers.length >= 3) return wrongAnswers;
    }
  }

  return wrongAnswers;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
