import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KanjiData } from '../../features/kanji/kanjiSlice';

const styles = StyleSheet.create({
  container: {
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
  },
  placeholderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#d1d5db',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
  },
});

interface PDFKanjiVocabularySectionProps {
  kanji: KanjiData;
  availableWidth: number;
  availableHeight: number;
}

/**
 * PDFKanjiVocabularySection - PDF version of vocabulary section
 *
 * Purpose: Placeholder for kanji vocabulary in PDF exports
 * Future: Will display actual vocabulary data
 */
export function PDFKanjiVocabularySection({
  kanji,
  availableWidth,
  availableHeight,
}: PDFKanjiVocabularySectionProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: availableWidth,
          height: availableHeight,
        },
      ]}
    >
      {/* Placeholder content */}
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Vocabulary section</Text>
        <Text style={styles.placeholderSubtext}>(Coming soon)</Text>
      </View>
    </View>
  );
}
