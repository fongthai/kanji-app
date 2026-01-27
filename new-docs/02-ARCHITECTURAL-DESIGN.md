# Kanji App - Architectural & Technical Design Document

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Data Models](#data-models)
7. [Component Architecture](#component-architecture)
8. [Storage Architecture](#storage-architecture)
9. [Export System Architecture](#export-system-architecture)
10. [Search System Architecture](#search-system-architecture)
11. [Performance Optimizations](#performance-optimizations)
12. [Design Decisions](#design-decisions)
13. [Technical Constraints](#technical-constraints)

---

## Architecture Overview

### High-Level Architecture

The Kanji App follows a **client-side, feature-sliced architecture** with the following principles:

- **Client-Side Only**: No backend server required, all processing happens in the browser
- **Offline-First**: IndexedDB for persistent storage, LocalStorage for preferences
- **Feature-Sliced Design**: Code organized by feature domains (kanji, worksheet, quiz, display)
- **Redux-Centric State**: Single source of truth for application state
- **Component Composition**: Reusable components with clear responsibilities
- **WYSIWYG Rendering**: Dual rendering paths (screen + export) with identical output

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Application                       │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │         Redux Store (State)                    │ │  │
│  │  │  ┌──────────┬──────────┬──────────┬─────────┐ │ │  │
│  │  │  │  kanji   │worksheet │  quiz    │ display │ │ │  │
│  │  │  │  Slice   │  Slice   │  Slice   │ Slice   │ │ │  │
│  │  │  └──────────┴──────────┴──────────┴─────────┘ │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │         Component Layer                        │ │  │
│  │  │  ┌──────────┬──────────┬──────────┬─────────┐ │ │  │
│  │  │  │  Input   │   Main   │ Control  │ Shared  │ │ │  │
│  │  │  │  Panel   │   View   │  Panel   │  UI     │ │ │  │
│  │  │  └──────────┴──────────┴──────────┴─────────┘ │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │         Utility Layer                          │ │  │
│  │  │  ┌──────────┬──────────┬──────────┬─────────┐ │ │  │
│  │  │  │  Export  │   KQL    │  Layout  │  i18n   │ │ │  │
│  │  │  │  Utils   │  Parser  │  Calc    │         │ │ │  │
│  │  │  └──────────┴──────────┴──────────┴─────────┘ │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Storage Layer                           │  │
│  │  ┌──────────────────────┬────────────────────────┐  │  │
│  │  │    IndexedDB         │   LocalStorage         │  │  │
│  │  │  - Kanji Data (10MB) │  - Settings (1-2 KB)   │  │  │
│  │  │  - 2000+ characters  │  - Quiz History        │  │  │
│  │  │  - Indexed queries   │  - Saved Queries       │  │  │
│  │  └──────────────────────┴────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7.2.4 | Build tool & dev server |
| Redux Toolkit | 2.2.7 | State management |
| Tailwind CSS | 3.4.14 | Styling |
| IndexedDB | - | Client-side database |
| i18next | 25.7.3 | Internationalization |

### Key Libraries

| Library | Purpose |
|---------|---------|
| @react-pdf/renderer | Vector-based PDF generation |
| jsPDF | Alternative PDF generation |
| html2canvas | Screen capture for PNG export |
| @dnd-kit/core | Drag-and-drop functionality |
| idb | IndexedDB wrapper |
| file-saver | File download handling |
| JSZip | ZIP file creation for multi-page PNG |
| pdfjs-dist | PDF rendering & preview |

### Development Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing |
| Playwright | E2E testing |
| ESLint | Code linting |
| TypeScript | Static type checking |

---

## System Architecture

### Feature-Sliced Architecture

The codebase follows a **feature-sliced design pattern**:

```
src/
├── app/                    # Application configuration
│   ├── store.ts           # Redux store setup
│   └── hooks.ts           # Typed Redux hooks
├── features/              # Feature modules (domain logic)
│   ├── kanji/            # Kanji data & selection
│   ├── worksheet/        # Mode & layout settings
│   ├── quiz/             # Quiz functionality
│   ├── displaySettings/  # Font & display preferences
│   ├── inputPanel/       # Kanji selection UI
│   ├── mainView/         # Mode rendering
│   ├── controlPanel/     # Settings UI
│   └── search/           # Advanced search
├── components/            # UI components
│   ├── screen/           # Screen display components
│   ├── pdf/              # PDF export components
│   └── shared/           # Reusable UI elements
├── utils/                # Utility functions
├── hooks/                # Custom React hooks
├── db/                   # IndexedDB operations
├── constants/            # Application constants
└── i18n/                 # Internationalization setup
```

### Three-Panel Layout

The UI follows a **three-panel responsive layout**:

```
Mobile (<768px):        Desktop (≥768px):
┌─────────────────┐    ┌──────┬───────────┬──────┐
│   Tab: Input    │    │Input │   Main    │Control│
│                 │    │Panel │   View    │ Panel │
│   (Swipeable)   │    │(20%) │   (1fr)   │ (20%) │
│                 │    │      │           │       │
└─────────────────┘    └──────┴───────────┴──────┘
```

**Panels**:
1. **Input Panel**: Kanji selection, search, categories
2. **Main View**: Sheet/Board/Quiz mode display
3. **Control Panel**: Settings, export, display options

---

## Data Flow

### Application Lifecycle

```
1. App Startup
   ↓
2. Check IndexedDB for Kanji Data
   ├─ Data Exists → Load into Redux Store
   └─ Data Missing → Fetch JSON → Seed IndexedDB → Load into Store
   ↓
3. Initialize Redux Store
   ├─ Load kanji data (allKanjis, chosenKanjis)
   ├─ Load settings from LocalStorage
   └─ Initialize quiz history
   ↓
4. Render Initial UI
   ├─ Input Panel: Display all kanjis
   ├─ Main View: Default to Board Mode
   └─ Control Panel: Display settings
   ↓
5. User Interactions
   ├─ Select Kanji → Update chosenKanjis → Re-render Main View
   ├─ Change Mode → Update currentMode → Switch renderer
   ├─ Adjust Settings → Update display settings → Re-render
   └─ Export → Generate PDF/PNG → Download
```

### Data Loading Flow

```
┌──────────────────────────────────────────────────────────┐
│ 1. App.tsx useEffect (on mount)                          │
│    ↓                                                      │
│ 2. checkIfDataExists() → IndexedDB query                 │
│    ↓                                                      │
│ 3. If empty:                                             │
│    - Fetch /public/data/kanji/manifest.json              │
│    - Parse file list (n5.json, n4.json, ...)            │
│    - Fetch each JSON file                                │
│    - Transform kebab-case → camelCase                    │
│    - seedKanjisFromJSON() → Store in IndexedDB          │
│    ↓                                                      │
│ 4. getAllKanjis() → Read from IndexedDB                  │
│    ↓                                                      │
│ 5. dispatch(setAllKanjis(data)) → Update Redux          │
│    ↓                                                      │
│ 6. Component renders with data                           │
└──────────────────────────────────────────────────────────┘
```

### User Interaction Flows

#### Kanji Selection Flow
```
User Clicks Kanji Card (Input Panel)
  ↓
dispatch(addKanji(kanjiData))
  ↓
kanjiSlice reducer adds to chosenKanjis array
  ↓
Redux state updated
  ↓
MainView subscribes to chosenKanjis
  ↓
MainView re-renders with new kanji
  ↓
Current mode renderer (Sheet/Board/Quiz) displays updated list
```

#### Mode Switch Flow
```
User Clicks Mode Button (Control Panel)
  ↓
dispatch(setCurrentMode('sheet' | 'board' | 'quiz'))
  ↓
worksheetSlice updates currentMode
  ↓
Save to LocalStorage
  ↓
MainView subscribes to currentMode
  ↓
MainView switches renderer:
  - 'sheet' → <SheetGrid />
  - 'board' → <BoardGrid />
  - 'quiz' → <Quiz />
```

#### Export Flow
```
User Clicks Export Button
  ↓
Open Export Modal (select format: PDF/PNG, quality)
  ↓
Calculate total pages based on:
  - chosenKanjis.length
  - currentMode settings (columns, layout)
  ↓
For each page:
  - dispatch(setCurrentPage(i))
  - Wait for render (500ms)
  - Capture page:
    * PDF: Use @react-pdf/renderer or jsPDF
    * PNG: Use html2canvas
  - Update progress bar
  ↓
Combine pages:
  - PDF: Single multi-page PDF
  - PNG: ZIP file or single image
  ↓
Download file via file-saver
  ↓
Close modal
```

#### Search Flow (KQL)
```
User Types Query in Search Tab
  ↓
Debounce 300ms
  ↓
KQL Parser tokenizes input
  ↓
Parser builds Abstract Syntax Tree (AST)
  ↓
Evaluator traverses AST with short-circuit evaluation
  ↓
Filter kanjiSlice.allKanjis
  ↓
Return top 50 results
  ↓
Display in Search Results tab
  ↓
User clicks kanji → dispatch(addKanji(kanjiData))
```

---

## State Management

### Redux Store Structure

The application uses **4 main slices**:

#### 1. kanjiSlice (`features/kanji/kanjiSlice.ts`)

```typescript
interface KanjiState {
  chosenKanjis: KanjiData[];     // User-selected kanjis
  allKanjis: KanjiData[];        // All 2000+ kanjis from DB
  searchQuery: string;           // Current search term
  loading: boolean;              // Data loading state
  error: string | null;          // Error messages
}

// Key Actions
- setAllKanjis(kanjis: KanjiData[])
- addKanji(kanji: KanjiData)
- removeKanji(kanjiId: string)
- clearChosenKanjis()
- reorderKanjis(sourceIndex: number, destinationIndex: number)
- setSearchQuery(query: string)
```

#### 2. worksheetSlice (`features/worksheet/worksheetSlice.ts`)

```typescript
interface WorksheetState {
  // Mode
  currentMode: 'sheet' | 'board' | 'quiz';
  currentPage: number;

  // Board Mode
  boardColumnCount: number;          // 4-16 (default: 6)
  boardEmptyCellsMode: 'hide' | 'page' | 'row';
  boardShowHeader: boolean;
  boardShowFooter: boolean;
  boardCenterCard: boolean;

  // Sheet Mode
  sheetColumnCount: number;          // 4-13 (default: 13)
  masterKanjiSize: number;           // 70-110% (default: 110%)
  sheetShowHanViet: boolean;
  sheetShowIndicators: boolean;
  sheetGuideOpacity: number;         // 0-100% (default: 50%)
  sheetTracingOpacity: [number, number, number]; // [40, 25, 15]

  // Header/Footer
  headerText: string;
  headerFontIndex: number;
  headerAnimationStyle: number;      // 0-4

  // Shared Settings
  hanVietOrientation: 'vertical' | 'horizontal';
  grayscaleMode: boolean;
}

// Key Actions
- setCurrentMode(mode: 'sheet' | 'board' | 'quiz')
- setCurrentPage(page: number)
- setBoardColumnCount(count: number)
- setSheetColumnCount(count: number)
- setHeaderText(text: string)
// ... and many more for each setting
```

#### 3. displaySettingsSlice (`features/displaySettings/displaySettingsSlice.ts`)

```typescript
interface DisplaySettingsState {
  inputPanel: FontSizeSettings;     // Input Panel display
  mainPanel: FontSizeSettings;      // Board Mode display
  sheetPanel: FontSizeSettings;     // Sheet Mode display
  pngQuality: 200 | 300 | 600;      // Export DPI
}

interface FontSizeSettings {
  kanjiFont: string;
  kanjiSize: number;                // 60-120%
  hanVietFont: string;
  hanVietSize: number;              // 35-65%
  showHanViet: boolean;
  hanVietOrientation: 'horizontal' | 'vertical';
  showJlptIndicator: boolean;
  showGradeIndicator: boolean;
  showFrequencyIndicator: boolean;
  indicatorPreset: IndicatorPreset;
  // Sheet mode only:
  showExplanationMeaning?: boolean;
  showExplanationMnemonic?: boolean;
}

// Key Actions
- updateInputPanelSettings(settings: Partial<FontSizeSettings>)
- updateMainPanelSettings(settings: Partial<FontSizeSettings>)
- updateSheetPanelSettings(settings: Partial<FontSizeSettings>)
- setPngQuality(quality: 200 | 300 | 600)
```

#### 4. quizSlice (`features/quiz/quizSlice.ts`)

```typescript
interface QuizState {
  settings: QuizSettings;           // Quiz configuration
  activeQuiz: ActiveQuiz | null;    // Current quiz session
  history: QuizResult[];            // Last 50 quiz results
  showSettings: boolean;
  reviewMode: boolean;
}

interface QuizSettings {
  questionType: QuestionType;       // 6 types
  numberSelection: NumberSelection; // All, Random 10/20/30/50/100
  levelFilter: LevelFilter;         // JLPT or Grade
  questionOrder: 'sequential' | 'random';
  timeLimit: 10 | 30 | 60 | null;   // Seconds or unlimited
  askFields: string[];              // Multi-select fields
}

interface ActiveQuiz {
  questions: QuizQuestion[];
  answers: (number | null)[];
  startTime: number;
  endTime: number | null;
  currentQuestionIndex: number;
  paused: boolean;
}

// Key Actions
- updateSettings(settings: Partial<QuizSettings>)
- startQuiz(questions: QuizQuestion[])
- answerQuestion(index: number, answer: number)
- nextQuestion()
- pauseQuiz()
- resumeQuiz()
- finishQuiz()
- saveToHistory(result: QuizResult)
```

### State Persistence

| Slice | Storage | Keys |
|-------|---------|------|
| kanjiSlice | IndexedDB | All kanji data |
| worksheetSlice | LocalStorage | `kanji-worksheet-mode`, `kanjiWorksheet_*` |
| displaySettingsSlice | LocalStorage | `displaySettings_*` |
| quizSlice | LocalStorage | `quiz-settings`, `quiz-active`, `quiz-history` |

---

## Data Models

### KanjiData Interface

```typescript
interface KanjiData {
  id?: string;                      // Composite: kanji-sectionName
  kanji: string;                    // 日, 月, 火
  hanViet: string;                  // NHẬT, NGUYỆT, HỎA
  sectionName: string;              // n5, n4, n3-A, n3-B, etc.
  jlptLevel: string;                // N5, N4, N3, N2, N1
  gradeLevel?: number | string;     // 1-12 (Japanese school grades)
  onyomi: string[];                 // ["ニチ", "ジツ"]
  kunyomi: string[];                // ["ひ", "-び", "-か"]
  meaning: string;                  // English: "day, sun, Japan"
  vietnameseMeaning: string;        // Vietnamese: "ngày, mặt trời"
  vietnameseMnemonic?: string;      // Learning mnemonic
  lucThu?: string;                  // Six categories (六書)
  components?: string;              // Radical components
  lookalikes?: string | string[];   // Similar kanji
  frequency?: number;               // Usage frequency rank (1-2500)
  category?: string[];              // Semantic categories
  orderIndex?: number;              // Original JSON position
}
```

### JSON Data Structure (Source)

```json
{
  "kanji": "日",
  "components": "日",
  "strokeOrderSvg": "kanji-vectors/065e5.svg",
  "hanViet": "NHẬT, NHỰT",
  "englishMeaning": "day, sun, japan, counter for days",
  "vietnameseMeaning": "ngày, mặt trời, Nhật Bản",
  "jlptLevel": "N5",
  "gradeLevel": "1",
  "onyomi": ["ニチ", "ジツ"],
  "kunyomi": ["ひ", "-び", "-か"],
  "category": ["numbers-time-date-calendar-count"],
  "lookalikes": "目, 白",
  "mnemonics": "Picture of the sun...",
  "vietMnemonics": "Hình ảnh mặt trời...",
  "frequency": 1,
  "lucThu": "象形 (Pictograph)"
}
```

---

## Component Architecture

### Component Hierarchy

```
App.tsx
├── ErrorBoundary
├── i18nextProvider
└── ReduxProvider
    ├── Header
    │   ├── Logo
    │   ├── LanguageSwitcher
    │   └── ThemeToggle
    ├── MainLayout (3-panel)
    │   ├── InputPanel
    │   │   ├── TabNavigation
    │   │   ├── TabSearch (KQL)
    │   │   ├── TabQuickFilters
    │   │   ├── TabSaved
    │   │   ├── TabHelp
    │   │   └── ChosenKanjisList
    │   │       └── KanjiCard (draggable)
    │   ├── MainView
    │   │   ├── (if mode === 'sheet')
    │   │   │   └── SheetGrid
    │   │   │       └── KanjiOuterTable[]
    │   │   │           ├── ExplanationText
    │   │   │           └── WritingTable
    │   │   │               ├── MasterCell
    │   │   │               └── PracticeCell[]
    │   │   ├── (if mode === 'board')
    │   │   │   └── BoardGrid
    │   │   │       ├── BoardHeader
    │   │   │       ├── KanjiCard[]
    │   │   │       └── BoardFooter
    │   │   └── (if mode === 'quiz')
    │   │       └── Quiz
    │   │           ├── QuizSettings
    │   │           ├── QuizCard
    │   │           ├── QuizReview
    │   │           └── QuizHistory
    │   └── ControlPanel
    │       ├── ModeSelector
    │       ├── DisplaySettings
    │       ├── LayoutSettings
    │       ├── ExportButton
    │       └── PageNavigation
    └── Footer
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **App.tsx** | Application entry, providers setup, error boundary |
| **InputPanel** | Kanji selection, search, category filtering |
| **MainView** | Mode rendering orchestration, pagination |
| **ControlPanel** | Settings UI, export controls, mode switching |
| **SheetGrid** | Sheet mode layout calculation, rendering |
| **BoardGrid** | Board mode grid calculation, responsive scaling |
| **Quiz** | Quiz flow orchestration, state management |
| **KanjiCard** | Reusable kanji display component |
| **ExportModal** | Export UI, progress tracking, file generation |

### Shared Components

```
components/shared/
├── Button.tsx
├── Modal.tsx
├── Input.tsx
├── Select.tsx
├── Checkbox.tsx
├── RadioGroup.tsx
├── Tooltip.tsx
├── Badge.tsx
├── ProgressBar.tsx
└── LoadingSpinner.tsx
```

---

## Storage Architecture

### IndexedDB Schema

**Database**: `ft-kanji-database` (version 22)

**Object Store 1**: `kanjis`
- **Key Path**: `id` (composite: `kanji-sectionName`)
- **Indexes**:
  - `by-section`: `sectionName` (n5, n4, n3-A, etc.)
  - `by-level`: `jlptLevel` (N5, N4, N3, N2, N1)
  - `by-category`: `category` (multi-entry index)
  - `by-kanji`: `kanji` (character search)

**Object Store 2**: `vocabularies`
- **Key Path**: `id` (composite: `vocabulary-book-unit`)
- **Indexes**:
  - `by-vocabulary`: `vocabulary` (Japanese word)
  - `by-level`: `jlptLevel` (N5, N4, N3, N2, N1)
  - `by-book`: `book` (Minna, Minna-II, N2-vietnamjp, etc.)
  - `by-unit`: `unit` (unit/lesson number)
  - `by-category`: `category` (multi-entry index)
  - `by-section`: `sectionName` (minna-unit-01, n2-unit-01, etc.)

**Operations** (`db/indexedDB.ts`):

```typescript
// Initialize database
initDB(): Promise<IDBDatabase>

// Seed data from JSON
seedKanjisFromJSON(manifest: string[]): Promise<void>
seedVocabulariesFromJSON(): Promise<void>

// Kanji queries
getAllKanjis(): Promise<KanjiData[]>
getKanjisByLevel(level: string): Promise<KanjiData[]>
getKanjisBySection(section: string): Promise<KanjiData[]>
searchKanjis(query: string): Promise<KanjiData[]>

// Vocabulary queries
getAllVocabularies(): Promise<VocabularyData[]>
getVocabulariesByLevel(level: string): Promise<VocabularyData[]>
getVocabulariesByBook(book: string): Promise<VocabularyData[]>
searchVocabularies(query: string): Promise<VocabularyData[]>

// Check data existence
checkIfDataExists(): Promise<boolean>
checkIfVocabulariesExist(): Promise<boolean>
```

### LocalStorage Schema

```typescript
// Settings
'kanji-worksheet-mode': 'sheet' | 'board' | 'quiz'
'kanjiWorksheet_headerText': string
'kanjiWorksheet_boardColumnCount': number
'kanjiWorksheet_sheetColumnCount': number
// ... (many more settings)

// Quiz
'quiz-settings': QuizSettings
'quiz-active': ActiveQuiz | null
'quiz-history': QuizResult[] (max 50)

// Search
'kql-recent-searches': string[] (max 10)
'kql-saved-queries': SavedQuery[] (max 10)
```

---

## Export System Architecture

### PDF Export Architecture

**Two Rendering Paths**:

1. **@react-pdf/renderer** (Primary)
   - Vector-based rendering
   - 300 DPI quality
   - Separate component tree (`components/pdf/`)
   - Precise layout control

2. **jsPDF** (Alternative)
   - Fallback for simple layouts
   - Direct canvas drawing
   - Smaller bundle size

**PDF Component Tree**:

```
PDFDocument
├── PDFPage[]
│   ├── (if mode === 'sheet')
│   │   └── PDFSheetGrid
│   │       └── PDFKanjiOuterTable[]
│   │           ├── PDFExplanationText
│   │           └── PDFWritingTable
│   ├── (if mode === 'board')
│   │   └── PDFBoardGrid
│   │       ├── PDFBoardHeader
│   │       ├── PDFKanjiCard[]
│   │       └── PDFBoardFooter
```

**Export Process**:

```typescript
// exportUtils.ts
async function exportToPDF(
  mode: Mode,
  kanjis: KanjiData[],
  settings: Settings
): Promise<void> {
  // 1. Calculate pages
  const totalPages = calculateTotalPages(kanjis, settings);

  // 2. Build PDF document
  const pdfDoc = (
    <PDFDocument>
      {Array.from({ length: totalPages }).map((_, i) => (
        <PDFPage key={i} size="A4">
          {renderModeContent(mode, getPageKanjis(i), settings)}
        </PDFPage>
      ))}
    </PDFDocument>
  );

  // 3. Render to blob
  const blob = await pdf(pdfDoc).toBlob();

  // 4. Download
  saveAs(blob, `kanji-${mode}-${Date.now()}.pdf`);
}
```

### PNG Export Architecture

**Process**:

1. **Capture**: Use html2canvas to capture DOM
2. **Scale**: Apply DPI scaling (200/300/600)
3. **Convert**: Canvas → PNG blob
4. **Package**: Single PNG or ZIP for multi-page
5. **Download**: Use file-saver

**Implementation**:

```typescript
async function exportToPNG(
  mode: Mode,
  pages: number,
  dpi: 200 | 300 | 600
): Promise<void> {
  const images: Blob[] = [];

  for (let i = 0; i < pages; i++) {
    // Navigate to page
    dispatch(setCurrentPage(i));
    await wait(500); // Wait for render

    // Capture page
    const element = document.getElementById('main-view');
    const canvas = await html2canvas(element, {
      scale: dpi / 96, // Scale for DPI
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // Convert to PNG
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    images.push(blob);
  }

  // Package and download
  if (images.length === 1) {
    saveAs(images[0], `kanji-${mode}.png`);
  } else {
    const zip = new JSZip();
    images.forEach((img, i) => {
      zip.file(`page-${i + 1}.png`, img);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `kanji-${mode}.zip`);
  }
}
```

---

## Search System Architecture

### KQL (Kanji Query Language) Parser

**Architecture**:

```
Input Query String
  ↓
Tokenizer (Lexical Analysis)
  ↓
Token Stream
  ↓
Parser (Syntax Analysis)
  ↓
Abstract Syntax Tree (AST)
  ↓
Evaluator (Semantic Analysis)
  ↓
Filtered Results
```

**Implementation** (`utils/kqlParser.ts`):

```typescript
// 1. Tokenizer
interface Token {
  type: 'FIELD' | 'OPERATOR' | 'VALUE' | 'LPAREN' | 'RPAREN';
  value: string;
  position: number;
}

function tokenize(query: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\w+:|AND|OR|NOT|\(|\)|[^\s()]+)/gi;
  let match;
  while ((match = regex.exec(query)) !== null) {
    tokens.push({
      type: getTokenType(match[0]),
      value: match[0],
      position: match.index
    });
  }
  return tokens;
}

// 2. Parser (Recursive Descent)
interface ASTNode {
  type: 'BinaryOp' | 'UnaryOp' | 'Comparison';
  operator?: string;
  left?: ASTNode;
  right?: ASTNode;
  field?: string;
  value?: string;
}

function parse(tokens: Token[]): ASTNode {
  // Recursive descent parser
  // Operator precedence: NOT > AND > OR
  return parseExpression(tokens, 0);
}

// 3. Evaluator
function evaluate(node: ASTNode, kanji: KanjiData): boolean {
  switch (node.type) {
    case 'BinaryOp':
      if (node.operator === 'AND') {
        // Short-circuit evaluation
        return evaluate(node.left, kanji) && evaluate(node.right, kanji);
      } else if (node.operator === 'OR') {
        return evaluate(node.left, kanji) || evaluate(node.right, kanji);
      }
      break;
    case 'UnaryOp':
      return !evaluate(node.right, kanji);
    case 'Comparison':
      return compareField(kanji, node.field, node.value);
  }
}

// 4. Main Search Function
function searchKanjis(query: string, allKanjis: KanjiData[]): KanjiData[] {
  const tokens = tokenize(query);
  const ast = parse(tokens);

  return allKanjis
    .filter((kanji) => evaluate(ast, kanji))
    .slice(0, 50); // Limit to 50 results
}
```

**Supported Operators**:

| Operator | Precedence | Example |
|----------|------------|---------|
| `()` | Highest | `(jlpt:N5 OR jlpt:N4)` |
| `NOT` | High | `NOT freq:>1000` |
| `AND` | Medium | `jlpt:N5 AND hanviet:NHẬT` |
| `OR` | Low | `on:コウ OR on:ゴウ` |

**Field Prefixes**:

| Prefix | Field | Example |
|--------|-------|---------|
| `char:` | kanji | `char:日` |
| `hanviet:` | hanViet | `hanviet:NHẬT` |
| `en:` | meaning | `en:sun` |
| `vn:` | vietnameseMeaning | `vn:mặt trời` |
| `on:` | onyomi | `on:ニチ` |
| `kun:` | kunyomi | `kun:ひ` |
| `com:` | components | `com:日` |
| `jlpt:` | jlptLevel | `jlpt:N5` |
| `freq:` | frequency | `freq:<500` or `freq:100-500` |

---

## Performance Optimizations

### Implemented Optimizations

1. **Lazy Loading**
   - Main view loads first page immediately
   - Subsequent pages loaded on demand
   - Reduces initial render time

2. **Debounced Search**
   - 300ms delay for KQL query execution
   - Prevents excessive re-renders during typing

3. **Memoized Calculations**
   - Layout calculations cached with `useMemo`
   - Expensive computations only re-run when dependencies change

4. **Virtual Scrolling**
   - Input Panel uses virtual list for large datasets
   - Only renders visible kanji cards

5. **Result Limiting**
   - KQL search returns max 50 results
   - Prevents UI lag with large result sets

6. **Short-Circuit Evaluation**
   - AND operator stops at first false
   - OR operator stops at first true
   - Reduces unnecessary comparisons

7. **IndexedDB Indexes**
   - Fast queries by section, level, category
   - O(log n) lookup instead of O(n) scan

8. **Font Preloading**
   - Fonts loaded before export
   - Ensures correct rendering in PDF/PNG

### Bundle Size Optimizations

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'pdf-vendor': ['@react-pdf/renderer', 'jspdf'],
          'export-vendor': ['html2canvas', 'file-saver', 'jszip']
        }
      }
    }
  }
});
```

---

## Design Decisions

### 1. Client-Side Only Architecture

**Decision**: No backend server, all processing in browser

**Rationale**:
- **Cost**: No server hosting costs
- **Privacy**: User data never leaves their device
- **Simplicity**: No API, no authentication, no database management
- **Offline**: Works without internet after initial load
- **Performance**: No network latency for kanji queries

**Trade-offs**:
- Initial load time (~5 seconds for 2000+ kanji)
- Cannot sync data across devices
- Limited to browser capabilities

### 2. IndexedDB for Kanji Storage

**Decision**: Use IndexedDB instead of in-memory or remote database

**Rationale**:
- **Persistence**: Data survives page refreshes
- **Capacity**: Can store 10+ MB of kanji data
- **Performance**: Indexed queries are fast (O(log n))
- **Offline**: No network required after initial seed

**Trade-offs**:
- Complex API (mitigated with `idb` wrapper)
- Browser compatibility (97% support)
- No cross-device sync

### 3. Redux Toolkit for State Management

**Decision**: Use Redux instead of Context API or other solutions

**Rationale**:
- **DevTools**: Excellent debugging with Redux DevTools
- **Middleware**: Easy to add persistence, logging
- **Performance**: Optimized re-renders with selectors
- **TypeScript**: Strong typing with Redux Toolkit
- **Predictability**: Single source of truth

**Trade-offs**:
- More boilerplate than Context API
- Steeper learning curve
- Bundle size (~40 KB gzipped)

### 4. Dual Rendering Paths (Screen + Export)

**Decision**: Separate components for screen display and PDF export

**Rationale**:
- **WYSIWYG**: Screen display matches exported PDF exactly
- **Optimization**: Screen components use CSS, PDF uses @react-pdf/renderer
- **Quality**: Vector PDFs maintain sharpness at any zoom
- **Flexibility**: Different layouts for screen (responsive) vs. PDF (fixed A4)

**Trade-offs**:
- Code duplication (mitigated with shared logic)
- Maintenance overhead (keep both in sync)

### 5. KQL Query Language

**Decision**: Build custom query language instead of using filters/dropdowns

**Rationale**:
- **Power**: Combine multiple criteria with logical operators
- **Speed**: Faster than clicking through multiple dropdowns
- **Flexibility**: Supports complex queries (e.g., `(jlpt:N5 OR jlpt:N4) AND freq:<500`)
- **Learning**: Users can learn incrementally (simple queries first)

**Trade-offs**:
- Learning curve (mitigated with auto-complete and help tab)
- Parser complexity (673 lines)
- Error handling (need clear error messages)

### 6. A4 Paper Size Standard

**Decision**: Design for A4 (not US Letter or custom sizes)

**Rationale**:
- **Global**: A4 is ISO 216 standard (used in 95% of countries)
- **Educational**: Most schools/institutions use A4
- **Simplicity**: Single size simplifies layout calculations
- **WYSIWYG**: Fixed size enables precise screen preview

**Trade-offs**:
- Not ideal for US users (Letter size is 8.5×11")
- Cannot customize page size (future feature)

### 7. Feature-Sliced Architecture

**Decision**: Organize code by feature (kanji, quiz, worksheet) instead of type (components, actions, reducers)

**Rationale**:
- **Scalability**: Easy to add new features without file sprawl
- **Cohesion**: Related code lives together
- **Ownership**: Clear boundaries for code ownership
- **Discoverability**: Easy to find all code for a feature

**Trade-offs**:
- Less familiar than traditional MVC
- Requires discipline to maintain boundaries

---

## Technical Constraints

### Browser Compatibility

- **Minimum**: Chrome 90, Firefox 88, Safari 14, Edge 90
- **Required APIs**: IndexedDB, LocalStorage, Canvas, ES2020
- **Optional**: Service Worker (for PWA)

### Performance Targets

- **Initial Load**: < 5 seconds (includes 2000+ kanji)
- **Mode Switch**: < 500ms
- **Kanji Selection**: < 100ms
- **Search**: < 300ms (debounced)
- **Export**: < 10 seconds per 10 pages

### Storage Limits

- **IndexedDB**: ~13 MB total
  - Kanji data: ~10 MB (2,000+ characters across 14 files)
  - Vocabulary data: ~3 MB (6,789 entries across 145 files)
    - Optimized: redundant fields removed from vocabulary items
    - `book`, `unit`, `id`, `orderIndex` only stored at file level
- **LocalStorage**: 2 KB (settings, quiz history)
- **Total**: ~15 MB

### A4 Dimensions

**Screen (96 DPI)**:
- Width: 794px
- Height: 1123px
- Ratio: 0.707

**PDF (points, 72 DPI base)**:
- Width: 595pt
- Height: 842pt

**PNG Export (300 DPI)**:
- Width: 2480px
- Height: 3508px

### JLPT Level Breakdown

- **N5**: 80 kanji
- **N4**: 122 kanji
- **N3**: ~360 kanji
- **N2**: ~360 kanji
- **N1**: ~1000+ kanji
- **Total**: ~2000+ kanji

---

## Conclusion

The Kanji App architecture prioritizes:

1. **Client-Side Simplicity**: No backend, no deployment complexity
2. **Performance**: Fast searches, lazy loading, memoization
3. **Quality**: WYSIWYG rendering, vector PDFs, high-DPI PNGs
4. **Flexibility**: Powerful KQL search, extensive customization
5. **Maintainability**: Feature-sliced design, TypeScript, Redux Toolkit

The architecture supports all three modes (Quiz, Sheet, Board) with shared state management, common components, and unified export system. The design decisions balance complexity, performance, and user experience while maintaining a manageable codebase.
