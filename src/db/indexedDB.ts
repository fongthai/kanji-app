import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { KanjiData } from '../features/kanji/kanjiSlice';
import type { VocabularyData } from '../types/vocabulary';

interface KanjiDB extends DBSchema {
  kanjis: {
    key: string; // composite key: kanji-sectionName
    value: KanjiData;
    indexes: { 'by-section': string; 'by-level': string; 'by-category': string; 'by-kanji': string };
  };
  vocabularies: {
    key: string; // composite key: vocabulary-book-unit
    value: VocabularyData;
    indexes: {
      'by-vocabulary': string;
      'by-level': string;
      'by-book': string;
      'by-unit': string | number;
      'by-category': string;
      'by-section': string;
    };
  };
}

// Use different database names for localhost vs production to avoid conflicts
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DB_NAME = isLocalhost ? 'ft-kanji-database-local' : 'ft-kanji-database';
const DB_VERSION = 31; // Version 31: new N3 file from vnjpclub and minor fixes for some kanjis.

let dbInstance: IDBPDatabase<KanjiDB> | null = null;

// Delete the database (for troubleshooting stuck databases)
export async function deleteDatabase(): Promise<void> {
  console.log('[IndexedDB] Deleting database:', DB_NAME);
  if (dbInstance) {
    console.log('[IndexedDB] Closing existing connection before delete');
    dbInstance.close();
    dbInstance = null;
  }
  
  // Wait a bit for the connection to fully close
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      console.log('[IndexedDB] Database deleted successfully');
      resolve();
    };
    request.onerror = () => {
      console.error('[IndexedDB] Error deleting database:', request.error);
      reject(request.error);
    };
    request.onblocked = () => {
      console.warn('[IndexedDB] Database deletion blocked - close all tabs using this database');
      // Continue anyway after 2 seconds
      setTimeout(() => {
        console.log('[IndexedDB] Proceeding despite block...');
        resolve();
      }, 2000);
    };
  });
}

export async function initDB(): Promise<IDBPDatabase<KanjiDB>> {
  if (dbInstance) {
    console.log('[IndexedDB] Reusing existing database instance');
    return dbInstance;
  }

  console.log('[IndexedDB] Opening database:', DB_NAME, 'version:', DB_VERSION);
  
  // Check for old version and force delete if found
  try {
    const existingDbs = await window.indexedDB.databases();
    const ourDb = existingDbs.find(db => db.name === DB_NAME);
    if (ourDb && ourDb.version && ourDb.version < DB_VERSION) {
      console.log('[IndexedDB] Found old database version', ourDb.version, ', FORCE DELETING before opening version', DB_VERSION);
      try {
        await deleteDatabase();
        console.log('[IndexedDB] Old database deleted, proceeding with fresh creation');
        // Wait a bit after deletion
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (deleteError) {
        console.error('[IndexedDB] Could not delete old database:', deleteError);
        // Continue anyway - openDB might handle the upgrade
      }
    }
  } catch (e) {
    // Some browsers don't support databases() method
    console.log('[IndexedDB] Unable to check existing databases');
  }
  
  try {
    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database open timeout after 5 seconds')), 5000)
    );
    
    const openPromise = openDB<KanjiDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        console.log('[IndexedDB] Running upgrade from version', oldVersion, 'to', DB_VERSION);

        // Create kanji store if it doesn't exist (version 0 or corrupted)
        if (!db.objectStoreNames.contains('kanjis')) {
          console.log('[IndexedDB] Creating kanjis store');
          const kanjiStore = db.createObjectStore('kanjis', { keyPath: 'id' });
          kanjiStore.createIndex('by-section', 'sectionName', { unique: false });
          kanjiStore.createIndex('by-level', 'jlptLevel', { unique: false });
          kanjiStore.createIndex('by-category', 'category', { multiEntry: true, unique: false });
          kanjiStore.createIndex('by-kanji', 'kanji', { unique: false });
          console.log('[IndexedDB] Kanjis store created with indexes');
        }

        // Add vocabularies store (new in version 7)
        if (!db.objectStoreNames.contains('vocabularies')) {
          console.log('[IndexedDB] Creating vocabularies store');
          const vocabStore = db.createObjectStore('vocabularies', { keyPath: 'id' });
          vocabStore.createIndex('by-vocabulary', 'vocabulary', { unique: false });
          vocabStore.createIndex('by-level', 'jlptLevel', { unique: false });
          vocabStore.createIndex('by-book', 'book', { unique: false });
          vocabStore.createIndex('by-unit', 'unit', { unique: false });
          vocabStore.createIndex('by-category', 'category', { multiEntry: true, unique: false });
          vocabStore.createIndex('by-section', 'sectionName', { unique: false });
          console.log('[IndexedDB] Vocabularies store created with indexes');
        }

        // Handle vocabulary data upgrades
        if (oldVersion > 0 && oldVersion < 31 && db.objectStoreNames.contains('vocabularies')) {
          // Clear vocabulary data for any version < 31
          // Version 26: Updated field names (exampleSentencesVietnameseTranslate, exampleSentencesEnglishTranslate)
          // Version 27: Updated book field values in vocabulary data (N3 Mimikara files)
          // Version 28: Added new vocabulary file (Tu_Vung_Shinkanzen_N3.json)
          // Version 29: Split N3-Shinkanzen.json into 21 group files (50 vocabs each)
          console.log(`[IndexedDB] Upgrading to version 31 from ${oldVersion}: clearing all vocabulary data for fresh reload with updated files`);
          const tx = (db as any).transaction;
          const vocabStore = tx.objectStore('vocabularies');

          // Add missing indexes if needed (kept for backward compatibility)
          if (!vocabStore.indexNames.contains('by-section')) {
            vocabStore.createIndex('by-section', 'sectionName', { unique: false });
            console.log('[IndexedDB] by-section index created');
          }

          vocabStore.clear();
          console.log('[IndexedDB] Vocabulary data cleared - will reload with new vocabulary file on next fetch');
        }
      },
      blocked() {
        console.warn('[IndexedDB] Database upgrade blocked - another tab may be open');
      },
      blocking() {
        console.warn('[IndexedDB] This connection is blocking a database upgrade');
        if (dbInstance) {
          dbInstance.close();
          dbInstance = null;
        }
      },
      terminated() {
        console.error('[IndexedDB] Database connection was unexpectedly terminated');
        dbInstance = null;
      },
    });
    
    dbInstance = await Promise.race([openPromise, timeout]);
    
    console.log('[IndexedDB] Database opened successfully');
    return dbInstance;
  } catch (error) {
    console.error('[IndexedDB] Error opening database:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('[IndexedDB] Database is blocked. Attempting to delete and recreate...');
      try {
        await deleteDatabase();
        console.log('[IndexedDB] Database deleted. Please refresh the page to recreate it.');
        throw new Error('Database was stuck and has been deleted. Please refresh the page.');
      } catch (deleteError) {
        console.error('[IndexedDB] Failed to delete database:', deleteError);
        throw new Error('Database is blocked. Please manually delete it: Open DevTools Console and run:\nindexedDB.deleteDatabase("ft-kanji-database")\nThen refresh the page.');
      }
    }
    throw error;
  }
}

/**
 * Fetch JSON files in parallel chunks to optimize network usage
 * @param files Array of file paths to fetch
 * @param chunkSize Number of concurrent fetches (default: 10)
 * @returns Array with success/failure status per file
 */
async function fetchJSONFilesInChunks(
  files: string[],
  chunkSize: number = 10
): Promise<Array<{ file: string; data?: any; error?: Error }>> {
  const results: Array<{ file: string; data?: any; error?: Error }> = [];

  // Split files into chunks
  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);

    // Fetch chunk in parallel with allSettled for graceful error handling
    const chunkResults = await Promise.allSettled(
      chunk.map(async (file) => {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return { file, data };
      })
    );

    // Convert settled promises to result format
    chunkResults.forEach((result, index) => {
      const file = chunk[index];
      if (result.status === 'fulfilled') {
        results.push({ file, data: result.value.data });
      } else {
        results.push({ file, error: result.reason });
      }
    });
  }

  return results;
}

/**
 * Write data to IndexedDB in batches to reduce transaction overhead
 * @param db Database instance
 * @param storeName Name of the object store
 * @param batches Array of file data with items
 * @param batchSize Number of files per transaction
 * @param transformer Function to transform each item before insertion
 */
async function writeBatchToIndexedDB<T extends KanjiData | VocabularyData>(
  db: IDBPDatabase<KanjiDB>,
  storeName: 'kanjis' | 'vocabularies',
  batches: Array<{ file: string; items: any[] }>,
  batchSize: number,
  transformer: (item: any, file: string, index: number) => T
): Promise<void> {
  // Group files into transaction batches
  for (let i = 0; i < batches.length; i += batchSize) {
    const batch = batches.slice(i, i + batchSize);

    // Create single transaction for this batch
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Process all files in this batch
    for (const { file, items } of batch) {
      for (let j = 0; j < items.length; j++) {
        try {
          const transformed = transformer(items[j], file, j);
          await store.put(transformed as any);
        } catch (error) {
          console.error(`✗ Failed to write item ${j} from ${file}:`, error);
          // Continue with next item (don't fail entire batch)
        }
      }
    }

    await tx.done;
  }
}

export async function seedKanjisFromJSON(
  jsonFiles: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const startTime = performance.now();
  console.log(`[Kanji] Starting parallel fetch of ${jsonFiles.length} files...`);

  const db = await initDB();

  // Parallel fetch all files in chunks of 10
  const fetchResults = await fetchJSONFilesInChunks(jsonFiles, 10);

  // Separate successful and failed fetches
  const successful: Array<{ file: string; items: any[] }> = [];
  const failed: Array<{ file: string; error: Error }> = [];

  fetchResults.forEach((result) => {
    if (result.data) {
      // Handle both direct array and wrapped object formats
      const kanjis: any[] = Array.isArray(result.data) ? result.data : (result.data.kanji || []);

      if (kanjis.length === 0) {
        console.warn(`⚠️ Warning: ${result.file} contains 0 kanjis`);
      } else {
        successful.push({ file: result.file, items: kanjis });
      }
    } else if (result.error) {
      failed.push({ file: result.file, error: result.error });
    }
  });

  // Log failures
  failed.forEach((f) => {
    console.error(`✗ FAILED to load ${f.file}:`, f.error);
    if (f.error instanceof Error) {
      console.error(`  Error message: ${f.error.message}`);
    }
  });

  console.log(`[Kanji] Fetched ${successful.length}/${jsonFiles.length} files successfully`);
  console.log(`[Kanji] Starting batched write to IndexedDB...`);

  // Batched writes (5 files per transaction)
  await writeBatchToIndexedDB(
    db,
    'kanjis',
    successful,
    5,
    (kanji, file, index) => {
      // Extract filename for section grouping (e.g., "n5" from "/data/kanji/n5.json")
      const filename = file.split('/').pop()?.replace('.json', '') || '';

      // Transform org file format to camelCase
      return {
        id: `${kanji.kanji}-${filename}`, // Composite key: kanji-sectionName
        kanji: kanji.kanji || '',
        sectionName: filename,
        orderIndex: index, // Preserve original position in JSON array
        jlptLevel: kanji.jlptLevel || '',
        gradeLevel: kanji.gradeLevel || '',
        hanViet: kanji.hanViet || '',
        onyomi: kanji.onyomi || [],
        kunyomi: kanji.kunyomi || [],
        englishMeaning: kanji.englishMeaning || '',
        vietnameseMeaning: kanji.vietnameseMeaning || '',
        vietnameseMnemonic: kanji.vietMnemonics || '',
        lucThu: kanji.lucThu || '',
        components: kanji.components || '',
        lookalikes: kanji.lookalikes || '',
        frequency: kanji.frequency || 0,
        category: kanji.category || [],
      };
    }
  );

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`[Kanji] ✓ Loaded ${successful.length} files in ${duration}s (${failed.length} failed)`);

  if (onProgress) {
    onProgress(successful.length, jsonFiles.length);
  }
}

export async function getAllKanjis(): Promise<KanjiData[]> {
  const db = await initDB();
  return db.getAll('kanjis');
}

export async function getKanjisByLevel(level: string): Promise<KanjiData[]> {
  const db = await initDB();
  return db.getAllFromIndex('kanjis', 'by-level', level);
}

export async function searchKanjis(query: string): Promise<KanjiData[]> {
  const db = await initDB();
  const allKanjis = await db.getAll('kanjis');

  const lowerQuery = query.toLowerCase();
  return allKanjis.filter(k =>
    k.kanji.includes(query) ||
    k.hanViet.join(', ').toLowerCase().includes(lowerQuery) ||
    k.englishMeaning.join(', ').toLowerCase().includes(lowerQuery)
  );
}

export async function checkIfDataExists(): Promise<boolean> {
  try {
    console.log('[IndexedDB] Initializing DB...');
    const db = await initDB();
    console.log('[IndexedDB] DB initialized, counting records...');
    const count = await db.count('kanjis');
    console.log('[IndexedDB] Record count:', count);
    return count > 0;
  } catch (error) {
    console.error('[IndexedDB] Error in checkIfDataExists:', error);
    throw error;
  }
}

// ===== Vocabulary Functions =====

/**
 * Validate and normalize vocabulary data structure
 * Ensures all expected fields exist and are the correct type
 */
function validateAndNormalizeVocabulary(vocab: any): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Required fields
  if (!vocab.vocabulary || typeof vocab.vocabulary !== 'string') {
    warnings.push(`Missing or invalid 'vocabulary' field`);
    return { valid: false, warnings };
  }

  if (!vocab.furigana || typeof vocab.furigana !== 'string') {
    warnings.push(`Missing or invalid 'furigana' field for "${vocab.vocabulary}"`);
  }

  // Ensure array fields are actually arrays (not strings or other types)
  const arrayFields = [
    'exampleSentencesInJapanese',
    'exampleSentencesVietnameseTranslate',
    'exampleSentencesEnglishTranslate',
    'category'
  ];

  for (const field of arrayFields) {
    if (vocab[field] !== undefined && vocab[field] !== null) {
      if (!Array.isArray(vocab[field])) {
        warnings.push(`Field '${field}' should be an array but got ${typeof vocab[field]} for "${vocab.vocabulary}"`);
        // Convert to array or set to empty array
        if (typeof vocab[field] === 'string') {
          vocab[field] = [vocab[field]]; // Convert string to array
        } else {
          vocab[field] = []; // Set to empty array
        }
      }
    } else {
      // Initialize missing array fields
      vocab[field] = [];
    }
  }

  // Ensure string fields exist
  const stringFields = ['hanViet', 'vietnameseMeaning', 'englishMeaning', 'explanation', 'jlptLevel'];
  for (const field of stringFields) {
    if (vocab[field] === undefined || vocab[field] === null) {
      vocab[field] = '';
    } else if (typeof vocab[field] !== 'string') {
      vocab[field] = String(vocab[field]);
    }
  }

  return { valid: true, warnings };
}

export async function seedVocabulariesFromJSON(
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const startTime = performance.now();
  const db = await initDB();
  const allWarnings: Array<{ file: string; warnings: string[] }> = [];

  try {
    // Load manifest to get list of vocabulary files
    const manifestResponse = await fetch('/data/vocabulary/manifest.json');
    if (!manifestResponse.ok) {
      throw new Error(`Failed to load vocabulary manifest: ${manifestResponse.status}`);
    }

    const manifest = await manifestResponse.json();
    console.log(`[Vocabulary] Starting parallel fetch of ${manifest.sources.length} files...`);

    // Build file paths from manifest sources
    const filePaths = manifest.sources.map((source: any) => `/data/vocabulary/${source.file}`);

    // Parallel fetch all files in chunks of 10
    const fetchResults = await fetchJSONFilesInChunks(filePaths, 10);

    // Process fetch results and prepare for batched writes
    const successful: Array<{ file: string; items: any[]; metadata: { book: string; unit: string } }> = [];
    const failed: Array<{ file: string; error: Error }> = [];

    fetchResults.forEach((result) => {
      if (result.data) {
        const vocabularies = result.data.vocabularies || [];

        if (vocabularies.length === 0) {
          console.warn(`⚠️ Warning: ${result.file} contains 0 vocabularies`);
        } else {
          // Extract file-level metadata
          const book = result.data.book;
          const unit = result.data.unit;

          successful.push({
            file: result.file,
            items: vocabularies,
            metadata: { book, unit },
          });
        }
      } else if (result.error) {
        failed.push({ file: result.file, error: result.error });
      }
    });

    // Log failures
    failed.forEach((f) => {
      console.error(`✗ FAILED to load ${f.file}:`, f.error);
      allWarnings.push({ file: f.file, warnings: [`Failed to load: ${f.error}`] });
    });

    console.log(`[Vocabulary] Fetched ${successful.length}/${manifest.sources.length} files successfully`);
    console.log(`[Vocabulary] Starting batched write to IndexedDB...`);

    let totalLoaded = 0;
    let totalSkipped = 0;

    // Batched writes (8 files per transaction)
    const batchSize = 8;
    for (let i = 0; i < successful.length; i += batchSize) {
      const batch = successful.slice(i, i + batchSize);

      // Create single transaction for this batch
      const tx = db.transaction('vocabularies', 'readwrite');
      const store = tx.objectStore('vocabularies');

      // Process all files in this batch
      for (const { file, items, metadata } of batch) {
        const fileWarnings: string[] = [];

        for (const vocab of items) {
          // Validate and normalize vocabulary data
          const { valid, warnings } = validateAndNormalizeVocabulary(vocab);

          if (!valid) {
            console.error(`✗ Skipping invalid vocabulary in ${file}:`, warnings);
            fileWarnings.push(...warnings);
            totalSkipped++;
            continue;
          }

          if (warnings.length > 0) {
            fileWarnings.push(...warnings);
          }

          // Copy file-level metadata to vocabulary object
          vocab.book = metadata.book;
          vocab.unit = metadata.unit;

          // Ensure ID is set using file-level book and unit
          if (!vocab.id) {
            vocab.id = `${vocab.vocabulary}-${metadata.book}-${metadata.unit}`;
          }

          try {
            await store.put(vocab);
            totalLoaded++;
          } catch (error) {
            console.error(`✗ Failed to write vocabulary from ${file}:`, error);
            totalSkipped++;
          }
        }

        if (fileWarnings.length > 0) {
          allWarnings.push({ file, warnings: fileWarnings });
        }
      }

      await tx.done;

      // Report progress
      if (onProgress) {
        onProgress(i + batch.length, successful.length);
      }
    }

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`[Vocabulary] ✓ Loaded ${totalLoaded} vocabularies from ${successful.length} files in ${duration}s (${totalSkipped} skipped, ${failed.length} failed)`);

    // Show warning popup if there were any data issues
    if (allWarnings.length > 0) {
      const warningMessage = `⚠️ Data Quality Issues Detected\n\n` +
        `Some vocabulary files have missing or malformed fields:\n\n` +
        allWarnings.slice(0, 5).map(w => `• ${w.file}: ${w.warnings.slice(0, 2).join(', ')}`).join('\n') +
        (allWarnings.length > 5 ? `\n\n...and ${allWarnings.length - 5} more files` : '') +
        `\n\nThe app will continue to work, but some vocabulary entries may display incorrectly.\n\n` +
        `Please check the browser console for detailed warnings.`;

      // Show alert after a short delay to ensure UI is ready
      setTimeout(() => {
        alert(warningMessage);
      }, 1000);
    }
  } catch (error) {
    console.error('[IndexedDB] Error seeding vocabularies:', error);
    throw error;
  }
}

export async function getAllVocabularies(): Promise<VocabularyData[]> {
  const db = await initDB();
  return db.getAll('vocabularies');
}

export async function getVocabulariesByLevel(level: string): Promise<VocabularyData[]> {
  const db = await initDB();
  return db.getAllFromIndex('vocabularies', 'by-level', level);
}

export async function getVocabulariesByBook(book: string): Promise<VocabularyData[]> {
  const db = await initDB();
  return db.getAllFromIndex('vocabularies', 'by-book', book);
}

export async function getVocabulariesBySection(sectionName: string): Promise<VocabularyData[]> {
  const db = await initDB();
  return db.getAllFromIndex('vocabularies', 'by-section', sectionName);
}

export async function searchVocabularies(query: string): Promise<VocabularyData[]> {
  const db = await initDB();
  const allVocabs = await db.getAll('vocabularies');

  const lowerQuery = query.toLowerCase();
  return allVocabs.filter(v =>
    v.vocabulary.includes(query) ||
    v.furigana.includes(query) ||
    v.hanViet.toLowerCase().includes(lowerQuery) ||
    v.vietnameseMeaning.toLowerCase().includes(lowerQuery) ||
    v.englishMeaning.toLowerCase().includes(lowerQuery)
  );
}

export async function checkIfVocabulariesExist(): Promise<boolean> {
  try {
    const db = await initDB();
    const count = await db.count('vocabularies');
    console.log('[IndexedDB] Vocabulary record count:', count);
    return count > 0;
  } catch (error) {
    console.error('[IndexedDB] Error in checkIfVocabulariesExist:', error);
    throw error;
  }
}
