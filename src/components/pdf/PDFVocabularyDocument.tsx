/**
 * PDF Vocabulary Document Component
 *
 * Renders vocabulary sheets as vector-based PDF using @react-pdf/renderer
 */

import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import type { VocabularyData } from '../../types/vocabulary';
import { PDFWatermark } from './PDFWatermark';
import { shouldShowWatermark } from '../../utils/featureControl';
import { WATERMARK_OPACITY_SHEET } from '../../constants/watermark';
import {
  A4_HEIGHT_PT,
  PDF_MARGIN_TOP,
  PDF_MARGIN_RIGHT,
  PDF_MARGIN_BOTTOM,
  PDF_MARGIN_LEFT,
  PDF_HEADER_HEIGHT,
  PDF_FOOTER_HEIGHT,
} from '../../constants/pdfDimensions';
import { FOOTER_TEXT } from '../../constants/appText';

// Get base URL for asset paths
const BASE_URL = import.meta.env.BASE_URL;

// Register Japanese fonts
Font.register({
  family: 'NotoSansJP-Regular',
  src: `${BASE_URL}fonts/NotoSansJP-Regular.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

// Register KanjiStrokeOrders font for tracing
Font.register({
  family: 'KanjiStrokeOrders',
  src: `${BASE_URL}fonts/KanjiStrokeOrders.ttf`,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

// Register hyphenation callback
Font.registerHyphenationCallback(word => [word]);

// Styles for vocabulary PDF
const styles = StyleSheet.create({
  page: {
    paddingTop: PDF_MARGIN_TOP,
    paddingRight: PDF_MARGIN_RIGHT,
    paddingBottom: PDF_MARGIN_BOTTOM,
    paddingLeft: PDF_MARGIN_LEFT,
    fontFamily: 'NotoSansJP-Regular',
  },
  header: {
    height: PDF_HEADER_HEIGHT,
    borderBottom: '1 solid #333',
    marginBottom: 8,
    paddingBottom: 4,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: PDF_MARGIN_BOTTOM,
    left: PDF_MARGIN_LEFT,
    right: PDF_MARGIN_RIGHT,
    height: PDF_FOOTER_HEIGHT,
    borderTop: '1 solid #ccc',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666',
  },
  vocabRow: {
    flexDirection: 'row',
    border: '1 solid #ddd',
    minHeight: 45,
  },
  infoSection: {
    width: '70%',
    padding: 6,
    flexDirection: 'column',
    justifyContent: 'center',
    borderRight: '1 solid #ddd',
  },
  practiceSection: {
    width: '30%',
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  rowNumber: {
    fontSize: 7,
    color: '#999',
    position: 'absolute',
    top: -2,
    left: -18,
  },
  vocabHeaderLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  vocabulary: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hiragana: {
    fontSize: 9,
    color: '#333',
  },
  hanViet: {
    fontSize: 7,
    color: '#0066cc',
  },
  exampleSentence: {
    fontSize: 7,
    color: '#333',
    marginTop: 4,
    paddingLeft: 4,
    borderLeft: '2 solid #66b3ff',
  },
  exampleTranslation: {
    fontSize: 7,
    color: '#555',
    marginTop: 2,
    paddingLeft: 4,
  },
  meaning: {
    fontSize: 7,
    color: '#555',
  },
  practiceCell: {
    width: 22,
    height: 22,
    border: '1 dashed #999',
  },
  practiceBlankLine: {
    width: '90%',
    borderBottom: '1 dashed #999',
  },
});

interface PDFVocabularyDocumentProps {
  vocabularies: VocabularyData[];
  showHeader: boolean;
  showFooter: boolean;
  headerText: string;
  vocabularyFont: string; // Font family for vocabulary text
  showHanViet: boolean;
  showVietnameseMeaning: boolean;
  showEnglishMeaning: boolean;
  showExplanation: boolean;
  showExampleSentence: boolean;
  showExampleTranslation: boolean;
  practiceCellSize: number; // Cell size in points (30-60)
  currentLanguage: string; // 'vi' or 'en'
}

export function PDFVocabularyDocument({
  vocabularies,
  showHeader,
  showFooter,
  headerText,
  vocabularyFont,
  showHanViet,
  showVietnameseMeaning,
  showEnglishMeaning,
  showExplanation,
  showExampleSentence,
  showExampleTranslation,
  practiceCellSize,
  currentLanguage,
}: PDFVocabularyDocumentProps) {
  // Calculate available height
  let availableHeight = A4_HEIGHT_PT - PDF_MARGIN_TOP - PDF_MARGIN_BOTTOM;
  if (showHeader) availableHeight -= PDF_HEADER_HEIGHT;
  if (showFooter) availableHeight -= PDF_FOOTER_HEIGHT;

  // Calculate row height based on practice area (2 rows of cells + gaps + padding)
  const practiceAreaHeight = practiceCellSize * 2 + 4; // 2 rows + gap
  const rowHeight = practiceAreaHeight + 12; // Add padding
  const rowsPerPage = Math.floor(availableHeight / rowHeight);

  // Split vocabularies into pages
  const pages: VocabularyData[][] = [];
  for (let i = 0; i < vocabularies.length; i += rowsPerPage) {
    pages.push(vocabularies.slice(i, i + rowsPerPage));
  }

  // Render 2×1 grid of practice rectangles for a vocabulary (2 rows, 1 rectangle per row)
  const renderPracticeGrid = (charCount: number, vocabText: string) => {
    const rectangleWidth = charCount * practiceCellSize;

    // Render cells with guide lines and optional tracing text (one character per cell)
    const renderCellsWithTracing = (includeTracing: boolean = false) => (
      Array.from({ length: charCount }, (_, i) => (
        <View key={i} style={{ width: practiceCellSize, height: practiceCellSize, borderRight: i < charCount - 1 ? '1 solid #ddd' : 'none', position: 'relative' }}>
          {/* Guide lines */}
          <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1 dashed #ccc', transform: 'translateY(-0.5)' }} />
          <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1 dashed #ccc', transform: 'translateX(-0.5)' }} />

          {/* Tracing text - one character per cell */}
          {includeTracing && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.35
            }}>
              <Text style={{
                fontSize: practiceCellSize * 0.7,
                color: '#666666',
                lineHeight: 1,
                transform: 'translateY(-10%)',
                fontFamily: 'KanjiStrokeOrders'
              }}>
                {vocabText[i]}
              </Text>
            </View>
          )}
        </View>
      ))
    );

    return (
      <View style={{ flexDirection: 'column', gap: 2 }}>
        {/* Row 1: First rectangle with tracing */}
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <View style={{ width: rectangleWidth, height: practiceCellSize, border: '1 solid #999', flexDirection: 'row' }}>
            {renderCellsWithTracing(true)}
          </View>
        </View>
        {/* Row 2: Second rectangle (empty) */}
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <View style={{ width: rectangleWidth, height: practiceCellSize, border: '1 solid #999', flexDirection: 'row' }}>
            {renderCellsWithTracing(false)}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Document>
      {pages.map((pageVocabs, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header */}
          {showHeader && (
            <View style={styles.header}>
              <Text style={styles.headerText}>{headerText || 'Vocabulary Practice Sheet'}</Text>
            </View>
          )}

          {/* Vocabulary Rows */}
          <View>
            {pageVocabs.map((vocab, rowIndex) => {
              const globalRowNumber = pageIndex * rowsPerPage + rowIndex + 1;
              const charCount = vocab.vocabulary.length;
              const rectangleWidth = charCount * practiceCellSize;
              const practiceAreaWidth = rectangleWidth + 4; // 1 rectangle per row + padding

              // Determine which translations to use based on current language (arrays) - ensure arrays
              const exampleTranslations = currentLanguage === 'vi'
                ? (Array.isArray(vocab.exampleSentencesVietnameseTranslate) ? vocab.exampleSentencesVietnameseTranslate : [])
                : (Array.isArray(vocab.exampleSentencesEnglishTranslate) ? vocab.exampleSentencesEnglishTranslate : []);

              // Get example sentences (array) - ensure it's actually an array
              const exampleSentences = Array.isArray(vocab.exampleSentencesInJapanese) ? vocab.exampleSentencesInJapanese : [];

              return (
                <View key={vocab.id} style={{ position: 'relative', marginBottom: 2 }}>
                  {/* Row number - positioned outside the box */}
                  <Text style={styles.rowNumber}>{globalRowNumber}</Text>

                  {/* Main row container */}
                  <View style={{ ...styles.vocabRow, minHeight: rowHeight }}>
                    {/* Info Section (dynamic width) */}
                    <View style={{ ...styles.infoSection, flex: 1 }}>
                      {/* Vocabulary, Han-Viet, and Furigana on same line */}
                      <View style={styles.vocabHeaderLine}>
                        <Text style={{ ...styles.vocabulary, fontFamily: vocabularyFont }}>{vocab.vocabulary}</Text>
                        {showHanViet && vocab.hanViet && (
                          <Text style={styles.hanViet}>{vocab.hanViet}</Text>
                        )}
                        <Text style={styles.hiragana}>{vocab.furigana}</Text>
                      </View>

                      {showVietnameseMeaning && (
                        <Text style={styles.meaning}>
                          {vocab.vietnameseMeaning || '-'}
                          {showExplanation && vocab.explanation && (
                            <>
                              {vocab.vietnameseMeaning?.endsWith('.') ? ' ' : '. '}
                              {vocab.explanation}
                            </>
                          )}
                        </Text>
                      )}

                      {showEnglishMeaning && vocab.englishMeaning && (
                        <Text style={styles.meaning}>
                          {vocab.englishMeaning}
                        </Text>
                      )}

                      {/* Example sentences in Japanese (if enabled and exists) */}
                      {showExampleSentence && exampleSentences.length > 0 && exampleSentences.map((sentence, idx) => (
                        <Text key={idx} style={styles.exampleSentence}>
                          {sentence}
                        </Text>
                      ))}

                      {/* Example sentence translations (if enabled and exists) */}
                      {showExampleTranslation && exampleTranslations.length > 0 && exampleTranslations.map((translation, idx) => (
                        <Text key={idx} style={styles.exampleTranslation}>
                          {translation}
                        </Text>
                      ))}
                    </View>

                    {/* Practice Section (dynamic width based on character count) */}
                    <View style={{ width: practiceAreaWidth, padding: 4, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center' }}>
                      {renderPracticeGrid(charCount, vocab.vocabulary)}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Footer */}
          {showFooter && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {FOOTER_TEXT}
              </Text>
              <Text style={styles.footerText}>
                Page {pageIndex + 1} / {pages.length}
              </Text>
            </View>
          )}

          {/* Watermark */}
          {shouldShowWatermark() && <PDFWatermark opacity={WATERMARK_OPACITY_SHEET} />}
        </Page>
      ))}
    </Document>
  );
}
