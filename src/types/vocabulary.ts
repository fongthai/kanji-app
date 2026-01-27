/**
 * Vocabulary Data Types
 *
 * TypeScript interfaces for vocabulary learning features
 */

export interface VocabularyData {
  id?: string; // Composite: `${vocabulary}-${book}-${unit}`
  vocabulary: string; // Japanese word (e.g., "洗濯", "食べる")
  furigana: string; // Furigana reading (e.g., "せんたく", "たべる")
  hanViet: string; // Han-Viet reading (e.g., "TẨY TRẠC")
  vietnameseMeaning: string; // Vietnamese translation
  englishMeaning: string; // English translation
  explanation?: string; // Additional explanation or usage notes
  jlptLevel: string; // "N5" | "N4" | "N3" | "N2" | "N1"
  category?: string[]; // Tags for categorization
  book: string; // Source: "Minna", "N2-vietnamjp", etc.
  unit: string | number; // Lesson/Bai number (e.g., "1", "15")
  sectionName?: string; // e.g., "minna-lesson-01", "n2-A" (from file-level metadata)
  displayName?: string; // e.g., "Minna Lesson 1", "N2 A" (for UI display)
  exampleSentencesInJapanese?: string[]; // Example sentences (array)
  exampleSentencesVietnameseTranslate?: string[]; // Example translations (VN, array)
  exampleSentencesEnglishTranslate?: string[]; // Example translations (EN, array)
  orderIndex?: number; // Original position in JSON file
}

export interface VocabularySection {
  sectionName: string; // e.g., "minna", "n2", "n3"
  displayName: string; // e.g., "Minna no Nihongo", "JLPT N2"
  description: string; // Description of the vocabulary source
  source: string; // Data source attribution
  count: number; // Number of vocabularies in this section
  vocabularies: VocabularyData[];
}

export interface VocabularyManifest {
  version: string; // Manifest version
  generatedAt: string; // ISO timestamp
  totalVocabularies: number; // Total count across all sources
  sources: {
    file: string; // JSON filename
    sectionName: string;
    displayName: string;
    count: number;
    lessons: number;
    levels: string[];
  }[];
}
