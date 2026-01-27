# Kanji App - Feature List & Roadmap

## Table of Contents

1. [Current Features (v1.0)](#current-features-v10)
2. [Upcoming Features (v1.1-v1.5)](#upcoming-features-v11-v15)
3. [Future Considerations (v2.0+)](#future-considerations-v20)
4. [Feature Requests from Community](#feature-requests-from-community)
5. [Development Priorities](#development-priorities)

---

## Current Features (v1.0)

### ✅ Core Functionality

#### Three Modes
- [x] **Quiz Mode**: Interactive assessment with 6 question types
- [x] **Sheet Mode**: Writing practice worksheets with master cells
- [x] **Board Mode**: Reference grid display for flashcards

#### Kanji Database
- [x] 2000+ kanji characters (JLPT N5-N1)
- [x] Comprehensive metadata:
  - Hán Việt (Sino-Vietnamese readings)
  - English & Vietnamese meanings
  - Onyomi & Kunyomi readings
  - Components & radicals
  - Lookalike kanji
  - Vietnamese mnemonics
  - Frequency rankings (1-2500)
  - 70+ semantic categories
  - Japanese school grade levels (1-12)

#### Kanji Selection
- [x] Quick browse by JLPT level (N5-N1)
- [x] Category filtering (70+ categories)
- [x] Advanced search (KQL - Kanji Query Language)
- [x] Drag-and-drop reordering
- [x] "Chosen Kanjis" management
- [x] Batch selection/deselection

### ✅ Quiz Mode Features

- [x] 6 question types:
  - Kanji → Hán Việt
  - Hán Việt → Kanji
  - Kanji → Meaning
  - Kanji → Onyomi
  - Onyomi → Kanji
  - Meaning → Kanji
- [x] Number selection: All, Random 10/20/30/50/100
- [x] Level filtering: JLPT (N5-N1) or Grade (1-12)
- [x] Question order: Sequential or Random
- [x] Time limits: 10s, 30s, 60s, or Unlimited
- [x] Multi-select "Ask Fields" when showing kanji
- [x] Pause/Resume functionality
- [x] Quit & Calculate (early exit with scoring)
- [x] Detailed review screen with correct/incorrect answers
- [x] Time spent per question tracking
- [x] Quiz history (last 50 quizzes)
- [x] Score tracking (0-10 scale + percentage)

### ✅ Sheet Mode Features

- [x] Master cell (2×2 size) with model kanji
- [x] Practice cells with guide lines (4-13 columns)
- [x] First 3 cells: Kanji tracing with decreasing opacity (40%, 25%, 15%)
- [x] Guide lines: Vertical, horizontal, center square
- [x] Adjustable guide opacity (0-100%)
- [x] Explanation text (1-3 lines):
  - Line 1: Kanji | JLPT | Hán Việt | Onyomi | Kunyomi | Components
  - Line 2: English & Vietnamese meanings
  - Line 3: Vietnamese mnemonics
- [x] Master kanji size adjustment (70-110%)
- [x] Show/hide Hán Việt
- [x] Show/hide indicators (JLPT, Grade, Frequency)
- [x] Automatic pagination (A4)
- [x] WYSIWYG preview

### ✅ Board Mode Features

- [x] Responsive grid layout (4-16 columns)
- [x] Square cards with kanji, Hán Việt, indicators
- [x] Empty cells handling (hide/fill page/fill row)
- [x] Custom header with text input
- [x] Header font selection (5 options)
- [x] Header animation styles (5 styles):
  - Gradient Shimmer
  - Wave
  - Holographic
  - Sparkle
  - Neon Glow
- [x] Footer with page numbers
- [x] Center card in cell option
- [x] Always fits A4 in viewport (responsive scaling)
- [x] Automatic pagination

### ✅ Advanced Search (KQL)

- [x] 9 field prefixes: `char:`, `hanviet:`, `en:`, `vn:`, `on:`, `kun:`, `com:`, `jlpt:`, `freq:`
- [x] 4 logical operators: `AND`, `OR`, `NOT`, `()`
- [x] 5 comparison operators: `<`, `>`, `<=`, `>=`, `min-max`
- [x] KQL parser with tokenizer, parser, evaluator
- [x] Auto-complete suggestions
- [x] Top 50 results limiting
- [x] Short-circuit evaluation
- [x] Saved queries (max 10)
- [x] Recent searches (last 10)
- [x] Help tab with examples

### ✅ Export System

- [x] PDF export (vector-based, 300 DPI)
- [x] PNG export (raster-based, 200/300/600 DPI)
- [x] Multi-page support (auto-pagination)
- [x] Export progress tracking
- [x] Single PDF or ZIP of PNGs
- [x] WYSIWYG guarantee (screen matches export)
- [x] File naming: `kanji-{mode}-{timestamp}.{pdf|png|zip}`
- [x] Cancellable export

### ✅ Customization

- [x] 5 kanji fonts (KanjiStrokeOrders, Noto Serif/Sans JP, Meiryo, MS Gothic)
- [x] Kanji size adjustment (60-120%)
- [x] 5 Hán Việt fonts
- [x] Hán Việt size adjustment (35-65%)
- [x] Hán Việt orientation (vertical/horizontal)
- [x] JLPT level color-coding (N5=green, N4=blue, N3=yellow, N2=orange, N1=red)
- [x] Toggle indicators (JLPT, Grade, Frequency)
- [x] Indicator presets
- [x] Grayscale mode
- [x] Mode-specific settings (Sheet/Board/Quiz)

### ✅ User Interface

- [x] Three-panel layout (Input | Main | Control)
- [x] Mobile-first responsive design (<768px: tabs, ≥768px: columns)
- [x] Swipe gestures on mobile
- [x] Tab-based navigation on mobile
- [x] Page navigation (Previous/Next)
- [x] Language switcher (English/Vietnamese)
- [x] Bilingual UI (full i18n)
- [x] Dark mode support (future)
- [x] Keyboard shortcuts

### ✅ Data & Storage

- [x] IndexedDB storage (10 MB, 2000+ kanji)
- [x] LocalStorage (settings, 1-2 KB)
- [x] Offline capabilities (PWA-ready)
- [x] Settings persistence across sessions
- [x] Quiz history persistence (last 50)

### ✅ Performance

- [x] Lazy loading (first page loads immediately)
- [x] Debounced search (300ms delay)
- [x] Memoized calculations (layout, pagination)
- [x] Virtual scrolling (Input Panel)
- [x] Result limiting (KQL: top 50)
- [x] Short-circuit evaluation (KQL)
- [x] IndexedDB indexes (by-section, by-level, by-category, by-kanji)
- [x] Font preloading before export

### ✅ Developer Experience

- [x] TypeScript (full type safety)
- [x] Redux Toolkit (state management)
- [x] Feature-sliced architecture
- [x] Component composition
- [x] Comprehensive documentation (24 files in /docs/)
- [x] Unit tests (Vitest)
- [x] E2E tests (Playwright, 6 projects)
- [x] ESLint configuration

---

## Upcoming Features (v1.1-v1.5)

### 🚧 Short-Term (v1.1 - Next 1-2 months)

#### Export Enhancements
- [ ] **Export chosen kanji list** (JSON/CSV)
  - Save chosen kanji for later use
  - Import kanji list from file
  - Share kanji lists with others
  - Priority: **High** | Effort: **Medium**

- [ ] **Custom page size support**
  - Add US Letter (8.5×11")
  - Add B5 (JIS standard)
  - Custom dimensions input
  - Priority: **Medium** | Effort: **Low**

- [ ] **Export to DOCX** (Microsoft Word)
  - Alternative to PDF for editing
  - Preserve formatting
  - Priority: **Medium** | Effort: **High**

#### Quiz Mode Improvements
- [ ] **Flashcard mode** (swipe-based review)
  - Alternative to multiple-choice
  - Swipe left/right for answer
  - No scoring, just review
  - Priority: **High** | Effort: **Medium**

- [ ] **Custom quiz from CSV**
  - Import question list
  - Support custom questions
  - Priority: **Low** | Effort: **Medium**

- [ ] **Quiz analytics**
  - Track performance over time
  - Identify weak areas
  - Progress charts
  - Priority: **Medium** | Effort: **High**

#### Search Enhancements
- [ ] **Full-text search** (non-KQL)
  - Simple text box for beginners
  - Fuzzy matching
  - Search all fields simultaneously
  - Priority: **High** | Effort: **Low**

- [ ] **Visual search filters** (dropdown UI)
  - Alternative to KQL for non-technical users
  - Dropdowns for JLPT, category, frequency
  - Combine filters visually
  - Priority: **High** | Effort: **Medium**

- [ ] **Recent kanji history**
  - Track recently viewed/selected kanji
  - Quick re-select
  - Priority: **Low** | Effort: **Low**

### 🚧 Medium-Term (v1.2-v1.3 - Next 3-6 months)

#### New Mode: Study Mode
- [ ] **Study Mode** (fourth mode)
  - Flashcard-style review
  - SRS (Spaced Repetition System)
  - Track learning progress
  - Leitner box algorithm
  - Priority: **High** | Effort: **Very High**

#### Board Mode Enhancements
- [ ] **Custom card templates**
  - Choose what to display on cards
  - Customize layout
  - Multiple card designs
  - Priority: **Medium** | Effort: **High**

- [ ] **Color themes**
  - Light/Dark/Sepia/High Contrast
  - Custom color schemes
  - Save theme preferences
  - Priority: **Low** | Effort: **Medium**

#### Sheet Mode Enhancements
- [ ] **Stroke order diagrams**
  - Show stroke order numbers
  - Animated stroke order (GIF/SVG)
  - Priority: **High** | Effort: **High**

- [ ] **Custom practice patterns**
  - Choose which cells to trace
  - Adjust opacity per cell
  - More than 3 tracing cells
  - Priority: **Low** | Effort: **Medium**

#### Collaboration Features
- [ ] **Share links** (URL-based sharing)
  - Generate shareable link with chosen kanji
  - Open link loads kanji list
  - No account required
  - Priority: **Medium** | Effort: **Medium**

- [ ] **QR code generation**
  - Generate QR code for kanji list
  - Scan to load kanji
  - Print QR on worksheets
  - Priority: **Low** | Effort: **Low**

### 🚧 Long-Term (v1.4-v1.5 - Next 6-12 months)

#### Vocabulary & Sentences
- [ ] **Vocabulary mode** (kanji → words)
  - Display words using chosen kanji
  - Example sentences
  - Audio pronunciation
  - Priority: **High** | Effort: **Very High**

- [ ] **Sentence practice**
  - Fill-in-the-blank sentences
  - Reading comprehension quizzes
  - Priority: **Medium** | Effort: **High**

#### AI-Powered Features
- [ ] **Personalized learning path**
  - AI suggests next kanji to learn
  - Based on JLPT level and progress
  - Adaptive difficulty
  - Priority: **Medium** | Effort: **Very High**

- [ ] **Mnemonic generator**
  - AI-generated mnemonics in Vietnamese
  - Personalized to user preferences
  - Priority: **Low** | Effort: **Very High**

#### Multi-User Features
- [ ] **Teacher dashboard**
  - Create classes
  - Assign kanji lists
  - Track student progress
  - Requires backend/API
  - Priority: **Low** | Effort: **Very High**

- [ ] **Student accounts**
  - Save progress
  - Sync across devices
  - Requires backend/API
  - Priority: **Low** | Effort: **Very High**

---

## Future Considerations (v2.0+)

### 🔮 Exploratory (No timeline)

#### Advanced Kanji Features
- [ ] **Stroke order practice** (interactive)
  - Draw kanji on canvas
  - Stroke order validation
  - Real-time feedback
  - Effort: **Very High** | Complexity: **Very High**

- [ ] **Handwriting recognition**
  - Draw kanji, app recognizes it
  - OCR integration
  - Effort: **Very High** | Complexity: **Very High**

#### Gamification
- [ ] **Achievements & badges**
  - Unlock badges for milestones
  - Leaderboards (optional)
  - Effort: **Medium** | Complexity: **Medium**

- [ ] **Daily challenges**
  - Random daily kanji quiz
  - Streak tracking
  - Effort: **Low** | Complexity: **Low**

#### Extended Language Support
- [ ] **Support for other languages**
  - Chinese (Simplified/Traditional)
  - Korean
  - Thai
  - Effort: **Medium** | Complexity: **Medium**

- [ ] **Hiragana/Katakana mode**
  - Practice kana (not just kanji)
  - Same three-mode approach
  - Effort: **High** | Complexity: **Medium**

#### Mobile App
- [ ] **Native iOS app**
  - Better performance
  - Offline-first
  - App Store distribution
  - Effort: **Very High** | Complexity: **Very High**

- [ ] **Native Android app**
  - Better performance
  - Offline-first
  - Play Store distribution
  - Effort: **Very High** | Complexity: **Very High**

#### Backend/API
- [ ] **Cloud sync**
  - Sync data across devices
  - Backup & restore
  - Requires backend
  - Effort: **Very High** | Complexity: **Very High**

- [ ] **API for developers**
  - REST API for kanji data
  - Authentication
  - Rate limiting
  - Effort: **Very High** | Complexity: **Very High**

---

## Feature Requests from Community

### Top Community Requests (from GitHub Issues)

1. **Export chosen kanji list** (JSON/CSV)
   - Status: Planned for v1.1
   - Requested by: 12 users

2. **Flashcard mode** (swipe-based)
   - Status: Planned for v1.1
   - Requested by: 8 users

3. **Stroke order diagrams**
   - Status: Planned for v1.2
   - Requested by: 6 users

4. **SRS (Spaced Repetition)**
   - Status: Planned for Study Mode (v1.2)
   - Requested by: 5 users

5. **Dark mode**
   - Status: In progress (CSS variables refactor needed)
   - Requested by: 4 users

6. **Custom card templates** (Board Mode)
   - Status: Planned for v1.2
   - Requested by: 3 users

7. **Vocabulary mode**
   - Status: Planned for v1.4
   - Requested by: 3 users

8. **Share links** (URL-based)
   - Status: Planned for v1.2
   - Requested by: 2 users

### How to Request a Feature

1. Open GitHub Issue with "Feature Request" template
2. Describe the feature and use case
3. Include examples or mockups (optional)
4. Add relevant labels (enhancement, feature-request)

---

## Development Priorities

### Priority Levels

| Priority | Criteria | Examples |
|----------|----------|----------|
| **Critical** | Bugs, security issues, data loss | Fix export failures, data corruption |
| **High** | Frequently requested, high impact | Export kanji list, flashcard mode |
| **Medium** | Nice-to-have, moderate impact | Color themes, QR codes |
| **Low** | Edge cases, niche features | Custom practice patterns |

### Current Focus (Q1 2025)

1. **Export Enhancements** (High priority)
   - Export chosen kanji list (JSON/CSV)
   - Custom page size support
   - DOCX export

2. **Search Improvements** (High priority)
   - Full-text search (non-KQL)
   - Visual search filters (dropdown UI)

3. **Quiz Mode Improvements** (High priority)
   - Flashcard mode
   - Quiz analytics

4. **Bug Fixes & Performance** (Critical priority)
   - Address reported bugs
   - Optimize large exports
   - Improve mobile performance

### Roadmap Timeline

```
Q1 2025 (Jan-Mar)
├─ v1.1: Export enhancements, flashcard mode, full-text search
│
Q2 2025 (Apr-Jun)
├─ v1.2: Study Mode (SRS), stroke order diagrams, share links
│
Q3 2025 (Jul-Sep)
├─ v1.3: Vocabulary mode, custom card templates, color themes
│
Q4 2025 (Oct-Dec)
├─ v1.4: Sentence practice, AI-powered features
│
2026+
└─ v2.0: Native apps, backend/API, multi-user features
```

### How Priorities Are Decided

1. **User Impact**: How many users benefit?
2. **Effort**: How much development time required?
3. **Complexity**: How difficult to implement?
4. **Dependencies**: Does it block other features?
5. **Community Requests**: How often requested?

**Formula**:
```
Priority Score = (Impact × Requests) / (Effort × Complexity)
```

Highest scores get prioritized first.

---

## Contributing to Development

### Ways to Contribute

1. **Code Contributions**
   - Pick an issue labeled `good-first-issue`
   - Fork repository, create branch
   - Submit pull request with tests
   - See CONTRIBUTING.md

2. **Feature Design**
   - Create mockups/wireframes
   - Write detailed specifications
   - Open GitHub Discussion for feedback

3. **Testing**
   - Test new features (beta releases)
   - Report bugs with detailed steps
   - Suggest improvements

4. **Documentation**
   - Improve existing docs
   - Write tutorials/guides
   - Translate to other languages

5. **Community Support**
   - Answer questions in Discussions
   - Help troubleshoot issues
   - Share tips & tricks

### Development Workflow

1. **Issue Created** (Feature Request or Bug Report)
2. **Triage** (Label: bug, enhancement, priority)
3. **Discussion** (Community feedback)
4. **Planning** (Assigned to milestone)
5. **Development** (Branch, code, tests)
6. **Review** (Pull request, code review)
7. **Merge** (Main branch)
8. **Release** (Version tag, changelog)

### Release Schedule

- **Patch releases** (v1.0.x): Every 1-2 weeks (bug fixes)
- **Minor releases** (v1.x.0): Every 1-3 months (new features)
- **Major releases** (vX.0.0): Every 1-2 years (breaking changes)

---

## Feature Status Legend

| Symbol | Status |
|--------|--------|
| ✅ | Implemented & shipped |
| 🚧 | In progress |
| 📅 | Planned (timeline set) |
| 🔮 | Exploratory (no timeline) |
| ❌ | Not planned / Rejected |

---

## Conclusion

Kanji App is actively developed with a focus on:
1. **User-requested features** (export list, flashcard mode)
2. **Performance & stability** (bug fixes, optimization)
3. **Educational value** (study mode, SRS, vocabulary)

The roadmap is flexible and adjusts based on community feedback. Feature requests and contributions are welcome!

**Stay Updated**:
- Watch GitHub repository for releases
- Subscribe to GitHub Discussions
- Follow release notes (see [Release Notes](./07-RELEASE-NOTES.md))

---

**Last Updated**: 2025-01-16
**Current Version**: v1.0
**Next Release**: v1.1 (Q1 2025)
