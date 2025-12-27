const fs = require('fs');

const files = fs.readdirSync('public/json').filter(f => f.endsWith('.json') && f !== 'input-json-manifest.txt');

// Read all files and extract characters
const allData = {};
files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(`public/json/${file}`, 'utf8'));
    allData[file] = data.map(item => item.kanji).filter(Boolean);
  } catch (e) {
    console.log(`Error reading ${file}: ${e.message}`);
  }
});

console.log('=== FILE SUMMARY ===');
Object.keys(allData).sort().forEach(file => {
  console.log(`${file}: ${allData[file].length} characters`);
});
console.log();

// Question 1: Characters in koty-2025.json not in other files
if (allData['koty-2025.json']) {
  const kotyChars = new Set(allData['koty-2025.json']);
  const otherChars = new Set();
  Object.keys(allData).forEach(file => {
    if (file !== 'koty-2025.json') {
      allData[file].forEach(c => otherChars.add(c));
    }
  });
  
  const uniqueToKoty = [...kotyChars].filter(c => !otherChars.has(c));
  console.log('=== QUESTION 1: Characters ONLY in koty-2025.json ===');
  console.log(`Total: ${uniqueToKoty.length} characters`);
  if (uniqueToKoty.length > 0) {
    console.log('Characters:', uniqueToKoty.join(', '));
  }
  console.log();
}

// Question 2: Duplicates excluding koty-2025.json
const charToFiles = {};
Object.keys(allData).forEach(file => {
  if (file !== 'koty-2025.json') {
    allData[file].forEach(char => {
      if (!charToFiles[char]) charToFiles[char] = [];
      charToFiles[char].push(file);
    });
  }
});

const duplicates = {};
Object.keys(charToFiles).forEach(char => {
  if (charToFiles[char].length > 1) {
    duplicates[char] = charToFiles[char];
  }
});

console.log('=== QUESTION 2: Duplicates (excluding koty-2025.json) ===');
console.log(`Total duplicate characters: ${Object.keys(duplicates).length}`);
if (Object.keys(duplicates).length > 0) {
  console.log();
  Object.keys(duplicates).sort().forEach(char => {
    console.log(`${char}: ${duplicates[char].join(', ')}`);
  });
}
