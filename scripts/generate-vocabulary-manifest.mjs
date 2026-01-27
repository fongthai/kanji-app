#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOCAB_DIR = path.join(__dirname, '../public/data/vocabulary');

console.log('Generating vocabulary manifest...');
console.log('Reading from:', VOCAB_DIR);

// Read all JSON files except manifest.json
const files = fs.readdirSync(VOCAB_DIR)
  .filter(f => f.endsWith('.json') && f !== 'manifest.json')
  .sort();

console.log(`Found ${files.length} vocabulary files`);

const sources = [];
let totalVocabularies = 0;

for (const file of files) {
  try {
    const filePath = path.join(VOCAB_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const vocabCount = content.vocabularies?.length || 0;
    totalVocabularies += vocabCount;

    sources.push({
      file,
      book: content.book || 'Unknown',
      unit: content.unit || 'Unknown',
      count: vocabCount
    });

    console.log(`  ✓ ${file}: ${vocabCount} vocabularies`);
  } catch (error) {
    console.error(`  ✗ Error reading ${file}:`, error.message);
  }
}

const manifest = {
  version: '2.0.0',
  generatedAt: new Date().toISOString(),
  totalVocabularies,
  totalFiles: files.length,
  sources
};

const manifestPath = path.join(VOCAB_DIR, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log('\n✓ Manifest generated successfully');
console.log(`  Total files: ${files.length}`);
console.log(`  Total vocabularies: ${totalVocabularies}`);
console.log(`  Written to: ${manifestPath}`);
