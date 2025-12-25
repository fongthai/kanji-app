import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { KanjiData } from '../features/kanji/kanjiSlice';

interface KanjiDB extends DBSchema {
  kanjis: {
    key: string; // composite key: kanji-sectionName
    value: KanjiData;
    indexes: { 'by-section': string; 'by-level': string; 'by-category': string; 'by-kanji': string };
  };
}

const DB_NAME = 'ft-kanji-database';
const DB_VERSION = 4; // Increment version to trigger migration

let dbInstance: IDBPDatabase<KanjiDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<KanjiDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<KanjiDB>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion) {
      // Delete old store if it exists
      if (db.objectStoreNames.contains('kanjis')) {
        db.deleteObjectStore('kanjis');
      }
      
      // Create new store with composite key (kanji-sectionName)
      const store = db.createObjectStore('kanjis', { keyPath: 'id' });
      store.createIndex('by-section', 'sectionName', { unique: false });
      store.createIndex('by-level', 'jlptLevel', { unique: false });
      store.createIndex('by-category', 'category', { multiEntry: true, unique: false });
      store.createIndex('by-kanji', 'kanji', { unique: false }); // Index to search by kanji character
    },
  });

  return dbInstance;
}

export async function seedKanjisFromJSON(jsonFiles: string[]): Promise<void> {
  const db = await initDB();
  
  for (const file of jsonFiles) {
    try {
      const response = await fetch(file);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: any = await response.json();
      
      // Handle both direct array and wrapped object formats
      const kanjis: any[] = Array.isArray(data) ? data : (data.kanji || []);
      
      if (kanjis.length === 0) {
        console.warn(`⚠️ Warning: ${file} contains 0 kanjis`);
        continue;
      }
      
      // Extract filename for section grouping (e.g., "n5-org" from "/json/n5-org.json")
      const filename = file.split('/').pop()?.replace('.json', '') || '';
      
      // Start a new transaction for each file
      const tx = db.transaction('kanjis', 'readwrite');
      const store = tx.objectStore('kanjis');
      
      for (let i = 0; i < kanjis.length; i++) {
        const kanji = kanjis[i];
        // Transform org file format to camelCase
        // id = composite key to allow duplicates across sections
        // orderIndex = preserve original array position
        // sectionName = filename for grouping (e.g., "n5-org")
        // jlptLevel = jlpt-level field for badge display (e.g., "N5")
        const transformed = {
          id: `${kanji.character}-${filename}`, // Composite key: kanji-sectionName
          kanji: kanji.character || '',
          sectionName: filename,
          orderIndex: i, // Preserve original position in JSON array
          jlptLevel: kanji['jlpt-level'] || '',
          gradeLevel: kanji['grade-level'] || '',
          sinoViet: kanji['han-viet'] || '',
          onyomi: kanji.onyomi || [],
          kunyomi: kanji.kunyomi || [],
          meaning: kanji['english-meaning'] || '',
          vietnameseMeaning: kanji['vietnamese-meaning'] || '',
          vietnameseMnemonic: kanji['viet-mnemonics'] || '',
          lucThu: kanji['luc-thu'] || '',
          components: kanji.components || '',
          lookalikes: kanji.lookalikes || '',
          frequency: kanji.frequency || 0,
          category: kanji.category || [],
        };
        
        store.put(transformed);
      }
      
      await tx.done;
    } catch (error) {
      console.error(`✗ FAILED to load ${file}:`, error);
      if (error instanceof Error) {
        console.error(`  Error message: ${error.message}`);
      }
    }
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
    k.sinoViet.toLowerCase().includes(lowerQuery) ||
    k.meaning.toLowerCase().includes(lowerQuery)
  );
}

export async function checkIfDataExists(): Promise<boolean> {
  const db = await initDB();
  const count = await db.count('kanjis');
  return count > 0;
}
