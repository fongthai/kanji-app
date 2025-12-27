import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { KanjiData } from '../features/kanji/kanjiSlice';

interface KanjiDB extends DBSchema {
  kanjis: {
    key: string; // composite key: kanji-sectionName
    value: KanjiData;
    indexes: { 'by-section': string; 'by-level': string; 'by-category': string; 'by-kanji': string };
  };
}

// Use different database names for localhost vs production to avoid conflicts
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DB_NAME = isLocalhost ? 'ft-kanji-database-local' : 'ft-kanji-database';
const DB_VERSION = 6; // Increment version to force clean recreation

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
      upgrade(db) {
        console.log('[IndexedDB] Running upgrade from version', db.version);
        // Delete old store if it exists
        if (db.objectStoreNames.contains('kanjis')) {
          console.log('[IndexedDB] Deleting old kanjis store');
          db.deleteObjectStore('kanjis');
        }
        
        // Create new store with composite key (kanji-sectionName)
        console.log('[IndexedDB] Creating new kanjis store');
        const store = db.createObjectStore('kanjis', { keyPath: 'id' });
        store.createIndex('by-section', 'sectionName', { unique: false });
        store.createIndex('by-level', 'jlptLevel', { unique: false });
        store.createIndex('by-category', 'category', { multiEntry: true, unique: false });
        store.createIndex('by-kanji', 'kanji', { unique: false }); // Index to search by kanji character
        console.log('[IndexedDB] Store created with indexes');
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
          id: `${kanji.kanji}-${filename}`, // Composite key: kanji-sectionName
          kanji: kanji.kanji || '',
          sectionName: filename,
          orderIndex: i, // Preserve original position in JSON array
          jlptLevel: kanji.jlptLevel || '',
          gradeLevel: kanji.gradeLevel || '',
          hanViet: kanji.hanViet || '',
          onyomi: kanji.onyomi || [],
          kunyomi: kanji.kunyomi || [],
          meaning: kanji.englishMeaning || '',
          vietnameseMeaning: kanji.vietnameseMeaning || '',
          vietnameseMnemonic: kanji.vietMnemonics || '',
          lucThu: kanji.lucThu || '',
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
    k.hanViet.toLowerCase().includes(lowerQuery) ||
    k.meaning.toLowerCase().includes(lowerQuery)
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
