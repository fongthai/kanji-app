import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KANJI_SOURCE_DIR = path.join(__dirname, '../public/data/kanji');
const KANJI_TARGET_DIR = path.join(__dirname, '../public/data/kanji');

async function generateManifest() {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(KANJI_TARGET_DIR)) {
    fs.mkdirSync(KANJI_TARGET_DIR, { recursive: true });
  }

  // Get list of kanji JSON files (exclude manifest.json itself)
  const files = fs.readdirSync(KANJI_SOURCE_DIR)
    .filter(f => f.endsWith('.json') && f !== 'manifest.json')
    .sort();

  const sources = [];
  let totalKanjis = 0;

  for (const file of files) {
    const filePath = path.join(KANJI_SOURCE_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const kanjis = Array.isArray(content) ? content : (content.kanji || []);

    // Generate display name from filename
    let displayName = file.replace('.json', '');

    // Transform common patterns
    if (displayName.match(/^n\d+$/)) {
      // n5, n4, etc. -> JLPT N5, JLPT N4
      displayName = displayName.replace(/^n(\d+)$/, 'JLPT N$1');
    } else if (displayName.match(/^n\d+-[A-Z]$/)) {
      // n1-A, n2-B, etc. -> JLPT N1 Part A, JLPT N2 Part B
      displayName = displayName.replace(/^n(\d+)-([A-Z])$/, 'JLPT N$1 Part $2');
    } else if (displayName.includes('koty')) {
      // koty-2025 -> Kanji of the Year 2025
      displayName = displayName.replace(/koty-?(\d+)?/, (match, year) =>
        year ? `Kanji of the Year ${year}` : 'Kanji of the Year'
      );
    }

    sources.push({
      file,
      displayName,
      count: kanjis.length
    });

    totalKanjis += kanjis.length;
  }

  const manifest = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalFiles: files.length,
    totalKanjis,
    sources
  };

  fs.writeFileSync(
    path.join(KANJI_TARGET_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`✓ Generated manifest.json with ${files.length} files, ${totalKanjis} kanjis`);
  console.log(`\nManifest location: ${path.join(KANJI_TARGET_DIR, 'manifest.json')}`);
  console.log('\nSources:');
  sources.forEach(s => {
    console.log(`  - ${s.file.padEnd(20)} ${s.displayName.padEnd(25)} (${s.count} kanjis)`);
  });

  return manifest;
}

generateManifest().catch(err => {
  console.error('Error generating manifest:', err);
  process.exit(1);
});
