# Kanji App - Release Notes & Changelog

## Table of Contents

1. [Version 1.0.0 (Current Release)](#version-100---current-release)
2. [Development History](#development-history)
3. [Versioning Strategy](#versioning-strategy)
4. [How to Update](#how-to-update)
5. [Release Schedule](#release-schedule)

---

## Version 1.0.0 - Current Release

**Release Date**: January 8, 2025

**Status**: Production-ready, stable release

### 🎉 Major Features

#### Three Complete Modes
- **Quiz Mode**: Interactive assessment with 6 question types, time limits, scoring, and history tracking
- **Sheet Mode**: Writing practice worksheets with master cells, guide lines, and tracing
- **Board Mode**: Flashcard-style reference grids with responsive layout

#### Comprehensive Kanji Database
- 2000+ kanji characters (JLPT N5-N1)
- Full metadata: Hán Việt, meanings, readings, components, mnemonics, frequency
- 70+ semantic categories
- Japanese school grades (1-12)

#### Advanced Search (KQL)
- Kanji Query Language with 9 field prefixes
- Logical operators: AND, OR, NOT, ()
- Comparison operators: <, >, <=, >=, min-max
- Auto-complete suggestions
- Saved queries (max 10)

#### Professional Export
- PDF export (vector-based, 300 DPI)
- PNG export (raster-based, 200/300/600 DPI)
- Multi-page support with automatic pagination
- WYSIWYG guarantee (screen matches export)

#### Full Internationalization
- Bilingual UI (English & Vietnamese)
- Language switcher
- Complete translations for all modes

### 📦 What's Included

**Core Functionality**:
- [x] Three modes: Quiz, Sheet, Board
- [x] 2000+ kanji with comprehensive metadata
- [x] Advanced search (KQL)
- [x] Professional PDF/PNG export
- [x] Responsive design (mobile-first)
- [x] Offline capabilities (IndexedDB + PWA-ready)

**Customization**:
- [x] 5 kanji fonts (KanjiStrokeOrders, Noto Serif/Sans JP, Meiryo, MS Gothic)
- [x] Font size adjustment (60-120% for kanji, 35-65% for Hán Việt)
- [x] JLPT level color-coding
- [x] Indicator toggles (JLPT, Grade, Frequency)
- [x] Header animations (5 styles)
- [x] Grayscale mode for exports

**Developer Features**:
- [x] TypeScript (full type safety)
- [x] Redux Toolkit (state management)
- [x] Feature-sliced architecture
- [x] Unit tests (Vitest)
- [x] E2E tests (Playwright)
- [x] Comprehensive documentation

### 🐛 Known Issues

- Export may be slow for 50+ pages (workaround: export in batches)
- First load takes ~5 seconds (downloading kanji data)
- Some mobile browsers may have font rendering issues

### 📝 Migration Notes

This is the first production release. No migration needed.

---

## Development History

### v1.0.0 (January 8, 2025) - Production Release

**🎉 Quiz Mode (Phase 1 - Core Functionality)**
- ✅ Implemented Quiz Mode with full state management
- ✅ Created Redux quiz slice (settings, active quiz, history)
- ✅ Built QuizSettings component with level selection, question count, time limits
- ✅ Implemented QuizCard component with countdown timer and keyboard shortcuts
- ✅ Created QuizReview component with detailed statistics
- ✅ Added smart question generator (wrong answers from lookalikes, same onyomi, etc.)
- ✅ Integrated Quiz mode into Control Panel
- ✅ Added complete English and Vietnamese translations
- ✅ Implemented localStorage persistence (max 50 quiz history)

**Release Date**: January 7, 2025

---

### v0.9.0 (January 3, 2025) - Pre-release

**🔧 Board Mode Export Fixes**
- Fixed Board mode PDF/PNG export proportional scaling issue
- Implemented consistent scaling from screen pixels to PDF points
- Added PDF_SCALE_FACTOR constant (595pt/698px = ~0.8524)
- Board mode PDFs now match on-screen layout capacity
- Fixed overflow issue causing unnecessary extra pages
- Applied proportional scaling to header, footer, gap, padding
- Updated PDFBoardPage component with proper constants

**Release Date**: January 3, 2025

---

### v0.8.0 (January 2, 2025) - Pre-release

**🎨 Grayscale Mode & Export Improvements**
- Implemented comprehensive grayscale mode for PDF/PNG exports
- Added grayscale toggle affecting headers, kanji, and indicators
- PDF headers: purple background (color) vs black border (grayscale)
- PDF indicators: white background with black border/text in grayscale
- On-screen Sheet mode: master kanji uses JLPT-level colors
- Fixed Board mode PDF header font (NotoSansJP fallback)
- Updated all PDF components with conditional grayscale styling
- Better PDF/PNG layout with improved Vietnamese font handling
- Added new header fonts: Bangers, MPLUSRounded1c, Vollkorn-ExtraBold
- Improved ExplanationText component with text truncation
- Enhanced BoardHeader styling

**Release Date**: January 2, 2025

---

### v0.7.0 (December 30, 2024) - Pre-release

**📝 Sheet Mode (Complete Implementation)**
- Implemented PNG export for Sheet mode (200/300/600 DPI)
- Created complete Sheet mode UI with master cell and practice cells
- Added explanation text display (Hán Việt, meanings, mnemonics)
- Implemented MasterCell component with guide lines and indicators
- Created PracticeCell component with guide lines and tracing
- Built WritingTable layout (2×2 master cell + practice cells)
- Added KanjiOuterTable wrapper
- Implemented SheetGrid for multiple kanji display
- Enhanced FontSizeControl for different panel ranges
- Added Sheet Panel display settings (separate from Board)
- Improved ExplanationText with multi-line support
- Updated Control Panel with Sheet-specific controls
- Added sheet mode settings to worksheetSlice
- Created PDF export components for Sheet mode
- Implemented PDF export function (exportSheetToPDFVector)
- Added PNG export function (exportSheetToPNG)
- Updated MainView to render Sheet mode with A4Paper scaling

**Release Date**: December 30, 2024

---

### v0.6.0 (December 28, 2024) - Pre-release

**🔍 Search Improvements**
- Fixed KQL autocomplete bug (suggestions now append instead of replace)
- Added JLPT comparison operator support (jlpt:>N3, jlpt:<=N4)
- Fixed JLPT comparison logic (N1 harder than N2)

**Release Date**: December 28, 2024

---

### v0.5.0 (December 27, 2024) - Pre-release

**🚀 Advanced Search (KQL)**
- Implemented Kanji Query Language (KQL) for advanced search
- 9 field prefixes: char:, hanviet:, en:, vn:, on:, kun:, com:, jlpt:, freq:
- 4 logical operators: AND, OR, NOT, ()
- 5 comparison operators: <, >, <=, >=, min-max
- Auto-complete suggestions
- Saved queries (max 10)
- Recent searches (last 10)

**🐛 Bug Fixes**
- Fixed PNG export to use actual header title
- Separated IndexedDB names for production and localhost
- Fixed font loading issue with whitespace in filenames
- Changed JSON data from kebab-case to camelCase

**Release Date**: December 27, 2024

---

### v0.4.0 (December 25, 2024) - Pre-release

**🎄 Export & Deployment Fixes**
- Fixed PNG export with correct A4 dimensions and font sizes
- Separated font manifests (kanji fonts vs header fonts)
- Fixed PDF and asset paths to use BASE_URL for GitHub Pages
- Fixed TypeScript compilation errors
- Fixed base path for GitHub Pages deployment

**Release Date**: December 25, 2024

---

### v0.3.0 (December 24, 2024) - Pre-release

**🏗️ Core Infrastructure**
- Implemented A4Paper component with responsive scaling (25% min scale)
- Built Paginator with keyboard shortcuts (arrow keys, Home/End)
- Created HeaderFooter component with mode-specific templates
- Implemented Board Mode with configurable grid (4-16 columns)
- Added Sheet Mode for practice worksheets
- Built Input Panel with kanji selection and drag-drop reordering
- Implemented Control Panel with font size controls and mode toggles
- Created KanjiCard component with JLPT level indicators
- Set up Redux store with kanji, worksheet, and displaySettings slices
- Integrated IndexedDB for kanji data storage
- Loaded JSON kanji data (N5, N4, N3, N2, N1 levels)
- Implemented PDF export functionality
- Added mobile responsive design with tab navigation
- Created font loading system with custom Japanese fonts
- Set up React 19 + TypeScript + Vite project structure

**Release Date**: December 24, 2024

---

## Detailed Changelog

### January 7, 2025

**Quiz Mode - Phase 1 (Core Functionality)**
- Implemented Redux quiz slice with full state management
  - `quizSlice.ts`: Settings, active quiz, history
  - Actions: `updateSettings`, `startQuiz`, `answerQuestion`, `nextQuestion`, `pauseQuiz`, `resumeQuiz`, `finishQuiz`, `saveToHistory`
- Built QuizSettings component
  - Level selection (JLPT N5-N1 or Grade 1-12)
  - Question count (10, 20, 30, 50, 100, All)
  - Time limits (10s, 30s, 60s, Unlimited)
  - Question order (Sequential or Random)
  - Interruption handling (pause/resume, quit & calculate)
- Implemented QuizCard component
  - Countdown timer with visual feedback
  - Answer options (A, B, C, D)
  - Keyboard shortcuts (1-4 for answers, Enter for next)
  - "Ask Fields" multi-select (show additional info when displaying kanji)
- Created QuizReview component
  - Detailed statistics (score, percentage, correct/incorrect)
  - Answer review with correct answers highlighted
  - Time spent per question
  - Retake and New Quiz buttons
- Added question generator
  - 6 question types (Kanji → Hán Việt, Hán Việt → Kanji, etc.)
  - Smart wrong-answer selection:
    - Lookalikes
    - Same onyomi
    - Similar hán việt
    - Same category
    - Random fallback
- Integrated Quiz mode into Control Panel (3rd mode alongside Sheet/Board)
- Added complete English and Vietnamese translations for Quiz mode
- Implemented localStorage persistence
  - Quiz settings (auto-save on change)
  - Active quiz (resume on reload)
  - History (max 50, oldest auto-deleted)
- Fixed i18n translation loading for Quiz namespace

### January 3, 2025

**Board Mode Export Fixes**
- Fixed proportional scaling issue in PDF/PNG export
  - Issue: Last rows overflowing to unnecessary 2nd page
  - Solution: Consistent scaling from screen pixels to PDF points
- Added `PDF_SCALE_FACTOR` constant (595pt/698px = ~0.8524)
  - Ensures accurate dimension conversion
  - Board mode PDFs now match on-screen layout capacity
  - Example: 6 columns × 48 kanjis fits on 1 page (was 2 pages)
- Applied proportional scaling to:
  - Header dimensions
  - Footer dimensions
  - Grid gap
  - Padding
- Updated `PDFBoardPage` component with proper constants structure
- Aligned Board mode export logic with Sheet mode's proven scaling approach

### January 2, 2025

**Grayscale Mode & Export Improvements**
- Implemented comprehensive grayscale mode for PDF/PNG exports
  - Added grayscale toggle in Control Panel
  - Affects headers, kanji, and indicators differently
- PDF headers:
  - Color mode: Purple background with white text
  - Grayscale mode: Black border with black text
- PDF indicators (JLPT, Grade, Frequency):
  - Color mode: Colored backgrounds
  - Grayscale mode: White background with black border/text
- On-screen Sheet mode:
  - Master kanji now uses JLPT-level colors (matching Board mode)
  - Example: N5 = green, N4 = blue, N3 = yellow, N2 = orange, N1 = red
- On-screen grayscale mode:
  - Only affects kanji text color (turns gray)
  - Keeps indicators colored for visibility
- Fixed Board mode PDF header font
  - Added NotoSansJP fallback (matching Sheet mode)
  - Ensures consistent font rendering across modes
- Updated all PDF components (Sheet/Board) with conditional grayscale styling
- Ensured consistent behavior across Board and Sheet modes (screen & export)
- Better PDF/PNG layout with improved Vietnamese font handling
- Fixed PDF/PNG export compatibility issues
- Added new header fonts:
  - Bangers
  - MPLUSRounded1c
  - Vollkorn-ExtraBold
- Improved ExplanationText component
  - Better text truncation
  - Multi-line support
- Enhanced BoardHeader component styling

### December 31, 2024

**Code Quality Improvements**
- Cleaned up ExplanationText component (removed debug logs)
- Removed unused variables from ExplanationText component

### December 30, 2024

**Sheet Mode - Complete Implementation**
- PNG Export:
  - Implemented PNG export for Sheet mode
  - Configurable DPI: 200, 300, 600
  - Multi-page support (ZIP for multiple pages)
- UI Components:
  - Created complete Sheet mode UI
  - Master cell (2×2 size) with model kanji
  - Practice cells (configurable 4-13 columns)
  - Explanation text display (Hán Việt, meanings, mnemonics)
- Master Cell:
  - Implemented MasterCell component
  - Guide lines (vertical, horizontal, center square)
  - JLPT/Grade/Frequency indicators
  - Adjustable size (70-110%)
- Practice Cell:
  - Created PracticeCell component
  - Guide lines (cross + center square)
  - Optional tracing kanji (first 3 cells: 40%, 25%, 15% opacity)
  - Adjustable guide opacity (0-100%)
- Layout:
  - Built WritingTable layout (2×2 master + practice cells in 2 rows)
  - Added KanjiOuterTable wrapper (explanation + writing table)
  - Implemented SheetGrid for multiple kanji display
  - Automatic pagination (A4)
- Settings:
  - Enhanced FontSizeControl for different panel ranges
  - Added Sheet Panel display settings (separate from Board)
  - Updated Control Panel with Sheet-specific controls:
    - Column count (4-13)
    - Guide opacity (0-100%)
    - Tracing opacity (first 3 cells)
    - Show/hide metadata (meanings, mnemonics)
  - Added sheet mode settings to worksheetSlice
- PDF Export:
  - Created PDF export components for Sheet mode:
    - `PDFSheetDocument`
    - `PDFSheetPage`
    - `PDFKanjiOuterTable`
    - `PDFWritingTable`
    - `PDFMasterCell`
    - `PDFPracticeCell`
  - Implemented PDF export function (`exportSheetToPDFVector`)
  - Vector-based rendering (300 DPI)
- PNG Export:
  - Added PNG export function (`exportSheetToPNG`)
  - Raster-based rendering (200/300/600 DPI)
- Integration:
  - Updated MainView to render Sheet mode with A4Paper scaling
  - Connected all components to Redux state

### December 29, 2024

**Sheet Mode & PDF Export**
- Initial Sheet mode implementation
- PDF export for Sheet mode

### December 28, 2024

**Search Improvements**
- Fixed KQL autocomplete bug:
  - Issue: Suggestions replaced entire query text
  - Solution: Suggestions now append to existing query
- Added JLPT comparison operator support:
  - Example: `jlpt:>N3` (N1, N2 only)
  - Example: `jlpt:<=N4` (N5, N4 only)
- Fixed JLPT comparison logic:
  - N1 is harder than N2 (reversed numeric comparison)
  - Operators now correctly match difficulty levels

### December 27, 2024

**Advanced Search (KQL) - Complete Implementation**
- Implemented Kanji Query Language (KQL):
  - 9 field prefixes: `char:`, `hanviet:`, `en:`, `vn:`, `on:`, `kun:`, `com:`, `jlpt:`, `freq:`
  - 4 logical operators: `AND`, `OR`, `NOT`, `()`
  - 5 comparison operators: `<`, `>`, `<=`, `>=`, `min-max` (for frequency)
- KQL Parser (`kqlParser.ts`, 673 lines):
  - Tokenizer: Lexical analysis
  - Parser: Recursive descent, builds AST
  - Evaluator: Tree traversal with short-circuit evaluation
  - Auto-complete suggestions
  - Error handling with position tracking
- Search UI:
  - 4-tab hybrid UI: Search, Quick Filters, Saved, Help
  - Auto-complete dropdown
  - Saved queries (max 10)
  - Recent searches (max 10)
  - Help tab with syntax examples
- Bug Fixes:
  - Fixed PNG export to use actual header title (not default text)
  - Separated IndexedDB names:
    - Production: `ft-kanji-database`
    - Localhost: `ft-kanji-database-local`
  - Fixed font loading issue with whitespace in filenames
- Data Format:
  - Changed JSON data from kebab-case to camelCase
  - Example: `han-viet` → `hanViet`

### December 25, 2024

**Export & Deployment Fixes**
- Fixed PNG export:
  - Correct A4 dimensions (794×1123px at 96 DPI)
  - Correct font sizes
  - WYSIWYG guarantee (screen matches export)
- Separated font manifests:
  - `kanji-fonts.json` (5 kanji fonts)
  - `font-manifest.json` (5 header fonts)
- Fixed PDF and asset paths:
  - Use `BASE_URL` for GitHub Pages
  - Support both local dev and production
- Fixed TypeScript compilation errors:
  - Type mismatches
  - Missing imports
- Fixed base path for GitHub Pages deployment:
  - `vite.config.ts`: Set `base: '/kanji-app/'`
  - Deploy script: `npm run deploy`

### December 24, 2024 and Earlier

**Core Infrastructure (Pre-git)**
- A4Paper Component:
  - Responsive scaling (25% min scale)
  - Always fits viewport
  - Maintains aspect ratio (0.707)
- Paginator:
  - Page navigation (Previous/Next)
  - Keyboard shortcuts (←, →, Home, End)
  - Page indicator: "Page 1 of 3"
- HeaderFooter:
  - Mode-specific templates
  - Custom header text
  - Header fonts (5 options)
  - Header animations (5 styles)
  - Footer with page numbers
- Board Mode:
  - Configurable grid (4-16 columns)
  - Square cards
  - Empty cells handling (hide/page/row)
  - JLPT level color-coding
- Sheet Mode:
  - Practice worksheets
  - Master cells
  - Guide lines
- Input Panel:
  - Kanji selection
  - Drag-drop reordering
  - Category filtering
  - JLPT level filtering
- Control Panel:
  - Font size controls
  - Mode toggles (Sheet/Board)
  - Display settings
  - Export button
- KanjiCard:
  - JLPT level indicators
  - Hán Việt display
  - Frequency badges
- Redux Store:
  - kanjiSlice: Kanji data & selection
  - worksheetSlice: Mode & layout settings
  - displaySettingsSlice: Font & display preferences
- IndexedDB:
  - Kanji data storage (10 MB)
  - Indexed queries (by-section, by-level, by-category, by-kanji)
- JSON Data:
  - N5, N4, N3, N2, N1 levels
  - 2000+ kanji
  - Comprehensive metadata
- PDF Export:
  - Vector-based rendering (300 DPI)
  - @react-pdf/renderer
- Mobile Responsive:
  - Tab-based navigation (<768px)
  - Swipe gestures
  - Single panel view
- Font System:
  - Custom Japanese fonts
  - Font loading with manifests
  - 5 kanji fonts, 5 header fonts
- Project Setup:
  - React 19 + TypeScript 5.9
  - Vite 7.2 (build tool)
  - Redux Toolkit 2.2
  - Tailwind CSS 3.4

---

## Versioning Strategy

### Semantic Versioning (SemVer)

**Format**: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

- **MAJOR** (X.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.X.0): New features, backward-compatible
- **PATCH** (0.0.X): Bug fixes, backward-compatible

**Examples**:
- `1.0.0` → `1.0.1`: Bug fix (patch)
- `1.0.1` → `1.1.0`: New feature (minor)
- `1.1.0` → `2.0.0`: Breaking change (major)

### Version Labels

- **Alpha** (v0.1.0-alpha): Early development, unstable
- **Beta** (v0.9.0-beta): Feature-complete, testing phase
- **RC** (v1.0.0-rc.1): Release candidate, final testing
- **Stable** (v1.0.0): Production-ready

### Current Status

- **Current Version**: v1.0.0
- **Status**: Stable (production-ready)
- **Next Release**: v1.1.0 (Q1 2025)

---

## How to Update

### For Users (Web App)

**No manual update required!** The web app auto-updates when you refresh the page.

**To ensure you have the latest version**:
1. Refresh page (Ctrl/Cmd + R)
2. Or hard refresh (Ctrl/Cmd + Shift + R)
3. Check version in footer or About page

### For Self-Hosted Installations

1. **Pull latest code**:
   ```bash
   git pull origin main
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Deploy** (to your hosting):
   ```bash
   # Example for GitHub Pages
   npm run deploy
   ```

### For Developers

1. **Clone repository**:
   ```bash
   git clone https://github.com/your-repo/kanji-app.git
   cd kanji-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## Release Schedule

### Patch Releases (v1.0.x)

**Frequency**: Every 1-2 weeks

**Contents**: Bug fixes, small improvements

**Examples**:
- Fix export failures
- Correct typos
- Performance improvements
- Security patches

### Minor Releases (v1.x.0)

**Frequency**: Every 1-3 months

**Contents**: New features, enhancements

**Planned**:
- v1.1.0 (Q1 2025): Export kanji list, flashcard mode, full-text search
- v1.2.0 (Q2 2025): Study Mode (SRS), stroke order diagrams, share links
- v1.3.0 (Q3 2025): Vocabulary mode, custom card templates
- v1.4.0 (Q4 2025): Sentence practice, AI features

### Major Releases (vX.0.0)

**Frequency**: Every 1-2 years

**Contents**: Breaking changes, major refactors

**Planned**:
- v2.0.0 (2026+): Native apps, backend/API, multi-user features

---

## Release Notes Format

Each release includes:

1. **Version Number** (e.g., v1.0.0)
2. **Release Date**
3. **Status** (Alpha/Beta/RC/Stable)
4. **Major Features** (new functionality)
5. **Bug Fixes** (resolved issues)
6. **Known Issues** (current limitations)
7. **Migration Notes** (if breaking changes)
8. **Contributors** (optional)

---

## Stay Updated

**Ways to stay informed**:
- Watch GitHub repository for releases
- Subscribe to GitHub Discussions
- Follow project README
- Check this document regularly

**GitHub Release Notifications**:
1. Go to repository
2. Click "Watch" button
3. Select "Custom" → "Releases"

---

## Contributing to Releases

See [Feature List & Roadmap](./06-FEATURE-LIST-ROADMAP.md) for:
- Upcoming features
- Development priorities
- How to contribute

See [CONTRIBUTING.md](../CONTRIBUTING.md) (if exists) for:
- Code contribution guidelines
- Pull request process
- Development workflow

---

**Last Updated**: January 16, 2025
**Current Version**: v1.0.0
**Next Release**: v1.1.0 (Q1 2025)
