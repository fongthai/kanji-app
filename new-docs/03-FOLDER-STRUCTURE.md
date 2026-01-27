# Kanji App - Folder Structure & File Organization

## Table of Contents

1. [Project Root Structure](#project-root-structure)
2. [Source Code Structure](#source-code-structure)
3. [Public Assets Structure](#public-assets-structure)
4. [Documentation Structure](#documentation-structure)
5. [Configuration Files](#configuration-files)
6. [Files/Folders to Exclude from Public Repo](#filesfolders-to-exclude-from-public-repo)
7. [Recommended .gitignore](#recommended-gitignore)

---

## Project Root Structure

```
kanji-app/
├── .DS_Store                    # ❌ macOS system file (exclude)
├── docs/                        # 📚 Comprehensive documentation (24 files)
├── index.html                   # 📄 HTML entry point
├── new-docs/                    # 📚 New documentation structure
├── node_modules/                # ❌ NPM dependencies (exclude)
├── package-lock.json            # 📦 Locked dependency versions
├── package.json                 # 📦 Project metadata & dependencies
├── postcss.config.js            # ⚙️ PostCSS configuration (Tailwind)
├── public/                      # 🌐 Static assets (served as-is)
├── README.md                    # 📖 Project overview & setup
├── scripts/                     # 🛠️ Build & utility scripts
├── SECURITY.md                  # 🔒 Security policy
├── src/                         # 💻 Source code
├── tailwind.config.js           # 🎨 Tailwind CSS configuration
├── to-do/                       # ❌ Personal task tracking (exclude)
├── tsconfig.app.json            # ⚙️ TypeScript config (app)
├── tsconfig.json                # ⚙️ TypeScript config (base)
├── tsconfig.node.json           # ⚙️ TypeScript config (node)
├── vite.config.ts               # ⚙️ Vite build configuration
└── vitest.config.ts             # ⚙️ Vitest test configuration
```

### Root-Level Files Explained

| File/Folder | Purpose | Include in Repo |
|-------------|---------|-----------------|
| **index.html** | HTML entry point, loads Vite app | ✅ Yes |
| **package.json** | Project metadata, dependencies, scripts | ✅ Yes |
| **package-lock.json** | Locked dependency versions | ✅ Yes |
| **README.md** | Project overview, setup instructions | ✅ Yes |
| **SECURITY.md** | Security policy & vulnerability reporting | ✅ Yes |
| **tailwind.config.js** | Tailwind CSS customization | ✅ Yes |
| **postcss.config.js** | PostCSS plugins (Tailwind, autoprefixer) | ✅ Yes |
| **vite.config.ts** | Vite build tool configuration | ✅ Yes |
| **vitest.config.ts** | Vitest test runner configuration | ✅ Yes |
| **tsconfig.json** | TypeScript compiler options (base) | ✅ Yes |
| **tsconfig.app.json** | TypeScript config for application code | ✅ Yes |
| **tsconfig.node.json** | TypeScript config for Node.js scripts | ✅ Yes |
| **.DS_Store** | macOS system file | ❌ No |
| **node_modules/** | NPM dependencies (auto-installed) | ❌ No |
| **to-do/** | Personal task tracking | ❌ No |

---

## Source Code Structure

```
src/
├── app/                         # Redux store configuration
│   ├── store.ts                 # Redux store setup
│   └── hooks.ts                 # Typed Redux hooks (useAppDispatch, useAppSelector)
│
├── assets/                      # Static assets (images, icons)
│   ├── react.svg
│   └── vite.svg
│
├── components/                  # UI components
│   ├── pdf/                     # PDF export components (@react-pdf/renderer)
│   │   ├── PDFDocument.tsx
│   │   ├── PDFPage.tsx
│   │   ├── PDFBoardGrid.tsx
│   │   ├── PDFSheetGrid.tsx
│   │   └── PDFKanjiCard.tsx
│   ├── screen/                  # Screen display components
│   │   ├── BoardGrid.tsx
│   │   ├── SheetGrid.tsx
│   │   ├── KanjiOuterTable.tsx
│   │   ├── WritingTable.tsx
│   │   ├── MasterCell.tsx
│   │   ├── PracticeCell.tsx
│   │   └── ExplanationText.tsx
│   └── shared/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Checkbox.tsx
│       └── Badge.tsx
│
├── constants/                   # Application constants
│   ├── boardDimensions.ts       # A4 dimensions, DPI constants
│   ├── indicators.ts            # JLPT/Grade color codes
│   └── appText.ts               # Static text constants
│
├── db/                          # IndexedDB operations
│   └── indexedDB.ts             # Database init, CRUD operations
│
├── features/                    # Feature-sliced modules
│   ├── controlPanel/            # Settings & controls UI
│   │   ├── ControlPanel.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── DisplaySettings.tsx
│   │   ├── LayoutSettings.tsx
│   │   └── ExportButton.tsx
│   │
│   ├── displaySettings/         # Font & display preferences
│   │   └── displaySettingsSlice.ts
│   │
│   ├── inputPanel/              # Kanji selection interface
│   │   ├── InputPanel.tsx
│   │   ├── KanjiCard.tsx
│   │   ├── ChosenKanjisList.tsx
│   │   └── CategoryFilter.tsx
│   │
│   ├── kanji/                   # Kanji data & selection logic
│   │   ├── kanjiSlice.ts
│   │   └── kanjiSelectors.ts
│   │
│   ├── mainView/                # Dual-mode rendering
│   │   ├── MainView.tsx
│   │   └── PageNavigation.tsx
│   │
│   ├── quiz/                    # Quiz mode implementation
│   │   ├── quizSlice.ts
│   │   ├── Quiz.tsx
│   │   ├── QuizSettings.tsx
│   │   ├── QuizCard.tsx
│   │   ├── QuizReview.tsx
│   │   └── QuizHistory.tsx
│   │
│   ├── search/                  # Advanced search with KQL
│   │   ├── TabSearch.tsx
│   │   ├── QuickFiltersTab.tsx
│   │   ├── SavedTab.tsx
│   │   └── HelpTab.tsx
│   │
│   └── worksheet/               # Mode & layout settings
│       └── worksheetSlice.ts
│
├── hooks/                       # Custom React hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useKeyPress.ts
│
├── i18n/                        # Internationalization setup
│   └── config.ts                # i18next configuration
│
├── utils/                       # Helper functions
│   ├── exportUtils.ts           # PDF/PNG export (1152 lines)
│   ├── kqlParser.ts             # KQL query parser (673 lines)
│   ├── layoutCalculations.ts   # A4 layout calculations
│   ├── fontUtils.ts             # Font loading & management
│   └── kql/                     # KQL parser modules
│       ├── tokenizer.ts
│       ├── parser.ts
│       └── evaluator.ts
│
├── App.tsx                      # Root component
├── App.css                      # Global styles
├── main.tsx                     # Application entry point
├── index.css                    # Tailwind imports
└── vite-env.d.ts                # Vite type definitions
```

### Source Folders Explained

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| **app/** | Redux store configuration | `store.ts`, `hooks.ts` |
| **assets/** | Static images & icons | `react.svg`, `vite.svg` |
| **components/** | UI components (pdf, screen, shared) | All `.tsx` components |
| **constants/** | Application constants | Dimensions, colors, text |
| **db/** | IndexedDB operations | `indexedDB.ts` |
| **features/** | Feature-sliced modules | 8 feature domains |
| **hooks/** | Custom React hooks | `useDebounce`, `useLocalStorage` |
| **i18n/** | Internationalization | i18next config |
| **utils/** | Helper functions | Export, KQL parser, layout |

---

## Public Assets Structure

```
public/
├── data/                        # Application data
│   └── vocabulary/              # Vocabulary data (145 JSON files)
│       ├── manifest.json        # Vocabulary manifest
│       ├── minna-unit-01.json   # Minna I, Unit 1 (49 vocab)
│       ├── minna-unit-02.json   # Minna I, Unit 2 (47 vocab)
│       ├── ...
│       ├── minna-unit-25.json   # Minna I, Unit 25 (17 vocab)
│       ├── minna-unit-26.json   # Minna II, Unit 26 (50 vocab)
│       ├── ...
│       ├── minna-unit-50.json   # Minna II, Unit 50 (46 vocab)
│       ├── n2-unit-01.json      # JLPT N2, Unit 1 (50 vocab)
│       ├── ...
│       ├── n2-unit-27.json      # JLPT N2, Unit 27 (3 vocab)
│       ├── n3-unit-01.json      # JLPT N3, Unit 1 (50 vocab)
│       ├── ...
│       ├── n3-unit-31.json      # JLPT N3, Unit 31 (5 vocab)
│       ├── n4-unit-01.json      # JLPT N4, Unit 1 (50 vocab)
│       ├── ...
│       ├── n4-unit-11.json      # JLPT N4, Unit 11 (14 vocab)
│       ├── n5-unit-01.json      # JLPT N5, Unit 1 (50 vocab)
│       ├── ...
│       └── n5-unit-08.json      # JLPT N5, Unit 8 (10 vocab)
│
├── fonts/                       # Font manifests
│   ├── font-manifest.json       # Font metadata
│   └── kanji-fonts.json         # Kanji font list
│
└── locales/                     # Translation files
    ├── en/                      # English translations
    │   └── translation.json
    └── vi/                      # Vietnamese translations
        └── translation.json
```

### Public Folders Explained

| Folder | Purpose | Include in Repo |
|--------|---------|-----------------|
| **fonts/** | Font metadata & manifests | ✅ Yes |
| **data/kanji/** | Kanji data (14 JSON files + manifest) | ✅ Yes |
| **data/vocabulary/** | Vocabulary data (145 JSON files + manifest) | ✅ Yes |
| **locales/** | Translation files (en, vi) | ✅ Yes |

**Note**: All files in `public/` are served as-is and should be included in the repository. The `data/kanji/` folder contains ~10 MB of kanji data (14 files), and the `data/vocabulary/` folder contains ~3 MB of vocabulary data (6,789 entries across 145 files, optimized to remove redundant fields).

---

## Vocabulary Data Structure

The `public/data/vocabulary/` folder contains 145 JSON files organized by textbook and JLPT level:

### File Organization

```
public/data/vocabulary/
├── manifest.json                 # Vocabulary manifest (file list, counts)
├── minna-unit-01.json            # Minna no Nihongo I, Unit 1 (49 vocab)
├── minna-unit-02.json            # Minna no Nihongo I, Unit 2 (47 vocab)
├── ...
├── minna-unit-25.json            # Minna no Nihongo I, Unit 25 (17 vocab)
├── minna-unit-26.json            # Minna no Nihongo II, Unit 26 (50 vocab)
├── ...
├── minna-unit-50.json            # Minna no Nihongo II, Unit 50 (46 vocab)
├── n2-unit-01.json               # JLPT N2, Unit 1 (50 vocab)
├── ...
├── n2-unit-27.json               # JLPT N2, Unit 27 (3 vocab)
├── n3-unit-01.json               # JLPT N3, Unit 1 (50 vocab)
├── ...
├── n3-unit-31.json               # JLPT N3, Unit 31 (5 vocab)
├── n4-unit-01.json               # JLPT N4, Unit 1 (50 vocab)
├── ...
├── n4-unit-11.json               # JLPT N4, Unit 11 (14 vocab)
├── n5-unit-01.json               # JLPT N5, Unit 1 (50 vocab)
├── ...
└── n5-unit-08.json               # JLPT N5, Unit 8 (10 vocab)
```

### Book Organization

| Book | Files | Entries | Unit Range |
|------|-------|---------|------------|
| **Minna no Nihongo I** | 25 | ~1,135 | Units 1-25 |
| **Minna no Nihongo II** | 25 | ~1,135 | Units 26-50 |
| **JLPT N2** | 27 | ~1,303 | Units 1-27 |
| **JLPT N3** | 31 | ~1,555 | Units 1-31 |
| **JLPT N4** | 11 | ~514 | Units 1-11 |
| **JLPT N5** | 8 | ~410 | Units 1-8 |
| **N3 Mimikara** | 17 | 841 | Groups 1-17 (50 vocab/group) |
| **Mimikara N3 (other)** | 1 | 17 | Mixed vocabulary |
| **Total** | **145** | **6,789** | - |

### Vocabulary JSON File Format

Each vocabulary file follows this structure:

```json
{
  "sectionName": "minna-unit-01",
  "displayName": "Minna Unit 1",
  "description": "Vocabulary from Minna no Nihongo Lesson 1",
  "book": "Minna",
  "unit": "1",
  "vocabularies": [
    {
      "vocabulary": "わたし",
      "furigana": "わたし",
      "hanViet": "",
      "vietnameseMeaning": "tôi",
      "englishMeaning": "I, me",
      "jlptLevel": "N5",
      "category": ["minna", "textbook"],
      "exampleSentencesInJapanese": "",
      "exampleSentencesVietnameseTranslate": "",
      "exampleSentencesEnglishTranslate": ""
    }
  ]
}
```

**Note**: The `book`, `unit`, `id`, and `orderIndex` fields are **NOT** stored in individual vocabulary items to reduce file size. These fields are automatically added to each vocabulary item when the data is loaded into IndexedDB, using the file-level metadata.

### Field Descriptions

#### File-Level Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `sectionName` | string | ✅ Yes | Unique section identifier | `"minna-unit-01"` |
| `displayName` | string | ✅ Yes | Human-readable section name | `"Minna Unit 1"` |
| `description` | string | ✅ Yes | Section description | `"Vocabulary from Minna no Nihongo Lesson 1"` |
| `book` | string | ✅ Yes | Book identifier | `"Minna"`, `"Minna-II"`, `"N2-vietnamjp"` |
| `unit` | string | ✅ Yes | Unit/lesson number | `"1"`, `"26"` |
| `vocabularies` | array | ✅ Yes | Array of vocabulary entries | See vocabulary entry fields below |

#### Vocabulary Entry Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `vocabulary` | string | ✅ Yes | Japanese word | `"わたし"`, `"食べる"` |
| `furigana` | string | ✅ Yes | Furigana reading | `"わたし"`, `"たべる"` |
| `hanViet` | string | ✅ Yes | Han-Viet reading (can be empty) | `"NGÃ"`, `"THỰC"` |
| `vietnameseMeaning` | string | ✅ Yes | Vietnamese translation (can be empty) | `"tôi"`, `"ăn"` |
| `englishMeaning` | string | ✅ Yes | English translation (can be empty) | `"I, me"`, `"to eat"` |
| `jlptLevel` | string | ✅ Yes | JLPT level | `"N5"`, `"N4"`, `"N3"`, `"N2"`, `"N1"` |
| `category` | array | ❌ No | Categorization tags | `["minna", "textbook"]` |
| `exampleSentencesInJapanese` | string | ✅ Yes | Example sentence in Japanese (can be empty) | `"私は学生です。"` |
| `exampleSentencesVietnameseTranslate` | array | ✅ Yes | Example sentence Vietnamese translation (can be empty) | `"Tôi là sinh viên."` |
| `exampleSentencesEnglishTranslate` | array | ✅ Yes | Example sentence English translation (can be empty) | `"I am a student."` |

**Fields Added Automatically During Load** (not stored in JSON files):
- `book`: Copied from file-level `book` field
- `unit`: Copied from file-level `unit` field
- `id`: Generated as `${vocabulary}-${book}-${unit}`
- `orderIndex`: Position in the vocabularies array
- `sectionName`: Copied from file-level `sectionName` field
- `displayName`: Copied from file-level `displayName` field

### Book Identifier Values

| Book ID | Display Name | Description |
|---------|--------------|-------------|
| `"Minna"` | Minna no Nihongo I | Units 1-25 from Minna no Nihongo textbook |
| `"Minna-II"` | Minna no Nihongo II | Units 26-50 from Minna no Nihongo textbook |
| `"N2-vietnamjp"` | JLPT N2 | JLPT N2 vocabulary from vietnamjp source |
| `"N3-vietnamjp"` | JLPT N3 | JLPT N3 vocabulary from vietnamjp source |
| `"N4-vietnamjp"` | JLPT N4 | JLPT N4 vocabulary from vietnamjp source |
| `"N5-vietnamjp"` | JLPT N5 | JLPT N5 vocabulary from vietnamjp source |
| `"N3-mimikara-group-by-50"` | N3 Mimikara | N3 vocabulary from Mimikara Oboeru textbook (17 groups, 50 vocab each) |
| `"N3 Mimikara"` | Mimikara N3 | Mixed N3 vocabulary from Mimikara source |

### Naming Conventions

- **Minna files**: `minna-unit-{NN}.json` (e.g., `minna-unit-01.json`, `minna-unit-26.json`)
- **JLPT files**: `{level}-unit-{NN}.json` (e.g., `n2-unit-01.json`, `n5-unit-08.json`)
- **N3 Mimikara grouped files**: `N3-mimi-kara-grouped-by50-group-{NN}.json` (e.g., `N3-mimi-kara-grouped-by50-group-01.json`)
- **Other Mimikara files**: `mimikara-{level}.json` (e.g., `mimikara-n3.json`)
- **Unit numbers**: Always 2-digit format (01, 02, ..., 50)

### Example Files

**Minna no Nihongo I (minna-unit-01.json):**
```json
{
  "sectionName": "minna-unit-01",
  "displayName": "Minna Unit 1",
  "description": "Vocabulary from Minna no Nihongo Lesson 1",
  "book": "Minna",
  "unit": "1",
  "vocabularies": [
    { "vocabulary": "わたし", "furigana": "わたし", ... },
    { "vocabulary": "あなた", "furigana": "あなた", ... }
  ]
}
```

**JLPT N2 (n2-unit-01.json):**
```json
{
  "sectionName": "n2-unit-01",
  "displayName": "N2 Unit 01",
  "description": "JLPT N2 vocabulary set 01",
  "book": "N2-vietnamjp",
  "vocabularies": [
    { "vocabulary": "思い込む", "furigana": "おもいこむ", ... },
    { "vocabulary": "受け止める", "furigana": "うけとめる", ... }
  ]
}
```

---

## Documentation Structure

```
docs/
├── 20250107-quiz-mode-implementation.md
├── 20251218-refactor-to-use-react-pdf-renderer/
├── 20251226-questions-before-implement-sheet-mode.md
├── 20251227-advanced-search-ui-options.md
├── advance-search-feature-EN.md
├── advance-search-feature-VI.md
├── board-mode.md
├── categories-list.txt
├── CATEGORY_VALUES.md
├── changelog.txt
├── color-coded.md
├── CONTROL-PANEL-REDESIGN.md
├── file-structures.md
├── github-pages-OR-others.md
├── how-to-deploy-to-gh-pages.md
├── IMPLEMENTATION_SUMMARY.md
├── MODE-SPECIFIC-SETTINGS-IMPLEMENTATION.md
├── project-requirements.md
├── README.md
├── SEARCH_CUSTOMIZATION.md
├── SHEET mode document.md
├── ui-containers.md
├── ui-mermaid.md
└── ui-mockups.md
```

### Documentation Files Explained

| File | Purpose | Include in Repo |
|------|---------|-----------------|
| **README.md** | Documentation index | ✅ Yes |
| **project-requirements.md** | Feature requirements | ✅ Yes |
| **board-mode.md** | Board mode specification | ✅ Yes |
| **SHEET mode document.md** | Sheet mode specification | ✅ Yes |
| **advance-search-feature-*.md** | KQL documentation | ✅ Yes |
| **IMPLEMENTATION_SUMMARY.md** | Implementation notes | ✅ Yes |
| **how-to-deploy-to-gh-pages.md** | Deployment guide | ✅ Yes |
| **changelog.txt** | Version history | ✅ Yes |
| **color-coded.md** | JLPT color system | ✅ Yes |
| **CATEGORY_VALUES.md** | Category reference | ✅ Yes |
| All other files | Technical specs, UI mockups | ✅ Yes |

**Recommendation**: Keep all documentation files in the repository for maintainability and onboarding.

---

## Configuration Files

| File | Purpose | Include in Repo |
|------|---------|-----------------|
| **vite.config.ts** | Vite build tool config | ✅ Yes |
| **vitest.config.ts** | Test runner config | ✅ Yes |
| **tailwind.config.js** | Tailwind CSS customization | ✅ Yes |
| **postcss.config.js** | PostCSS plugins | ✅ Yes |
| **tsconfig.json** | TypeScript base config | ✅ Yes |
| **tsconfig.app.json** | TypeScript app config | ✅ Yes |
| **tsconfig.node.json** | TypeScript node config | ✅ Yes |
| **package.json** | NPM package metadata | ✅ Yes |
| **package-lock.json** | Locked dependency versions | ✅ Yes |

---

## Files/Folders to Exclude from Public Repo

### System Files

| File/Folder | Reason |
|-------------|--------|
| **.DS_Store** | macOS system file, auto-generated |
| **Thumbs.db** | Windows thumbnail cache |
| **desktop.ini** | Windows folder settings |

### Build Artifacts

| File/Folder | Reason |
|-------------|--------|
| **node_modules/** | NPM dependencies (300+ MB), auto-installed via `npm install` |
| **dist/** | Build output (auto-generated via `npm run build`) |
| **.vite/** | Vite cache |
| **.turbo/** | Turbo cache (if using Turborepo) |

### Environment & Secrets

| File/Folder | Reason |
|-------------|--------|
| **.env** | Environment variables (may contain secrets) |
| **.env.local** | Local environment overrides |
| **.env.production** | Production secrets |
| **secrets.json** | Any secrets/credentials |

### IDE & Editor Files

| File/Folder | Reason |
|-------------|--------|
| **.vscode/** | VS Code settings (personal preferences) |
| **.idea/** | IntelliJ IDEA settings |
| **\*.swp, \*.swo** | Vim swap files |
| **\*.sublime-\*** | Sublime Text files |

### Personal Folders

| File/Folder | Reason |
|-------------|--------|
| **to-do/** | Personal task tracking, not relevant to public users |
| **scratch/** | Temporary development files |
| **temp/** | Temporary files |

### Logs & Debug Files

| File/Folder | Reason |
|-------------|--------|
| **\*.log** | Log files |
| **npm-debug.log\*** | NPM debug logs |
| **yarn-debug.log\*** | Yarn debug logs |
| **yarn-error.log\*** | Yarn error logs |

### Test Coverage & Reports

| File/Folder | Reason |
|-------------|--------|
| **coverage/** | Test coverage reports (auto-generated) |
| **.nyc_output/** | Code coverage data |
| **playwright-report/** | Playwright test reports |

---

## Recommended .gitignore

Create a `.gitignore` file in the project root with the following content:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build artifacts
dist/
build/
.vite/
.turbo/

# Environment variables & secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
secrets.json

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Test coverage & reports
coverage/
.nyc_output/
playwright-report/
test-results/

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE & Editor files
.vscode/
.idea/
*.swp
*.swo
*.sublime-workspace
*.sublime-project

# Personal folders
to-do/
scratch/
temp/
private/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# TypeScript cache
*.tsbuildinfo
```

---

## Folder Structure Best Practices

### 1. Feature-Sliced Design

The `src/features/` folder follows **feature-sliced architecture**:

```
features/
├── kanji/           # Kanji domain (data, selection)
├── worksheet/       # Worksheet domain (mode, layout)
├── quiz/            # Quiz domain (settings, flow)
├── displaySettings/ # Display domain (fonts, sizes)
├── inputPanel/      # Input UI domain
├── mainView/        # Main view domain
├── controlPanel/    # Control UI domain
└── search/          # Search domain
```

**Benefits**:
- Clear boundaries between domains
- Easy to add new features
- Scalable as app grows
- Easy to find related code

### 2. Component Organization

The `src/components/` folder separates concerns:

```
components/
├── pdf/      # PDF export components (@react-pdf/renderer)
├── screen/   # Screen display components (HTML/CSS)
└── shared/   # Reusable UI components (buttons, modals)
```

**Why separate pdf/ and screen/?**
- Different rendering APIs (React PDF vs. React DOM)
- Different constraints (fixed A4 vs. responsive)
- Prevents mixing concerns

### 3. Utilities Organization

The `src/utils/` folder groups helpers by domain:

```
utils/
├── exportUtils.ts          # Export logic (PDF/PNG)
├── kqlParser.ts            # KQL parser (large file)
├── layoutCalculations.ts  # Layout math
├── fontUtils.ts            # Font management
└── kql/                    # KQL submodules
    ├── tokenizer.ts
    ├── parser.ts
    └── evaluator.ts
```

**Large files** (>500 lines) should be split into submodules if possible.

### 4. Public Assets Organization

The `public/` folder is served as-is:

```
public/
├── fonts/     # Font metadata
├── json/      # Kanji data (10+ MB)
└── locales/   # Translations
```

**Do NOT put**:
- Source code (goes in `src/`)
- Build artifacts (goes in `dist/`)
- Large binary files (>50 MB)

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **React Components** | PascalCase | `KanjiCard.tsx` |
| **Redux Slices** | camelCase + Slice suffix | `kanjiSlice.ts` |
| **Utilities** | camelCase + Utils suffix | `exportUtils.ts` |
| **Constants** | camelCase | `boardDimensions.ts` |
| **Hooks** | camelCase + use prefix | `useDebounce.ts` |
| **Types** | PascalCase + .types suffix | `kanji.types.ts` |
| **Tests** | Same as source + .test suffix | `kqlParser.test.ts` |

---

## Summary

### ✅ INCLUDE in Public Repo

- All source code (`src/`)
- Public assets (`public/`)
- Documentation (`docs/`, `new-docs/`)
- Configuration files (`*.config.js`, `tsconfig.json`)
- Package files (`package.json`, `package-lock.json`)
- README, SECURITY, and root-level docs

### ❌ EXCLUDE from Public Repo

- `node_modules/` (auto-installed)
- `dist/` (auto-generated)
- `.DS_Store` (OS files)
- `.env` (secrets)
- `to-do/` (personal tasks)
- IDE settings (`.vscode/`, `.idea/`)
- Logs and coverage reports

### 📏 Total Size Estimates

- **Source code**: ~5 MB
- **Public assets**: ~10 MB (mostly JSON data)
- **Documentation**: ~1 MB
- **Total (excluding node_modules)**: ~16 MB
- **node_modules (excluded)**: ~300+ MB

---

**Recommendation**: Use the provided `.gitignore` to ensure clean, minimal repository while preserving all essential files.
