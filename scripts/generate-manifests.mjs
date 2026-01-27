#!/usr/bin/env node

/**
 * Generate all manifest files (kanji and vocabulary)
 * This script is run automatically before each build
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📝 Generating manifest files...\n');

try {
  // Generate kanji manifest
  console.log('→ Generating kanji manifest...');
  execSync('node scripts/generate-kanji-manifest.mjs', {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });

  // Generate vocabulary manifest
  console.log('\n→ Generating vocabulary manifest...');
  execSync('node scripts/generate-vocabulary-manifest.mjs', {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });

  console.log('\n✅ All manifests generated successfully!\n');
} catch (error) {
  console.error('\n❌ Error generating manifests:', error.message);
  process.exit(1);
}
