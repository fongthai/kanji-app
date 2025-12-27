# AI Coding Agent Instructions - Kanji Worksheet Generator

## Project Overview
React 18 + TypeScript kanji practice worksheet generator with A4 print-optimized layouts, Redux Toolkit state management, and dual Sheet/Board modes. Target: Vietnamese learners of Japanese with WYSIWYG PDF export at 300 DPI.

## Architecture Pattern: Feature-Sliced Design

**Redux slices organize by domain, NOT by UI:**
- `features/kanji/kanjiSlice.ts` - All kanji data, selections, search (single source of truth)
- `features/worksheet/worksheetSlice.ts` - Mode (sheet/board), column counts, boardSettings
- `features/displaySettings/displaySettingsSlice.ts` - Font sizes (inputPanel/mainPanel separate ranges)

**Component structure:**
- `components/` - Shared presentational (A4Paper, Paginator, KanjiCard, HeaderFooter)
- `features/{feature}/{Feature}.tsx` - Smart containers (InputPanel, MainView, ControlPanel)

**Always use typed Redux hooks from `app/hooks.ts`:**
```typescript
import { useAppDispatch, useAppSelector } from '../../app/hooks';
// NEVER use useDispatch/useSelector directly
```

## Critical A4 Paper Scaling System

**A4_DIMENSIONS constant (src/components/A4Paper.tsx):**
- 2480×3508px @300DPI for print quality
- MIN_SCALE = 0.25 (25% minimum)
- Dynamic viewport scaling maintains aspect ratio
- Uses `transform: scale()` NOT width/height modification

**Board Mode grid calculations (src/features/mainView/MainView.tsx):**
```typescript
// Calculate ONCE in useMemo, cards are fixed px sizes
const cardSize = (availableWidth - totalGaps) / columnCount;
const rowCount = Math.floor((availableHeight + gap) / (cardSize + gap));
const cardsPerPage = rowCount * columnCount;
```
Grid uses **explicit px sizing**, NOT `1fr` or percentages. This ensures consistent print output.

## Custom Tailwind Breakpoints (tailwind.config.js)

```javascript
screens: {
  'md': '768px',    // Mobile → Desktop transition
  'lg': '1512px',   // Wider control panels
  'xl': '1801px',   // More input panel space
  '2xl': '2400px',  // Max layout width
}
```

**Mobile detection (App.tsx):**
- Width < 768px triggers tab switcher UI
- Swipe gestures (50px minimum) for panel navigation
- Desktop uses 3-column grid: `[InputPanel][MainView][ControlPanel]`

## Data Flow & IndexedDB Pattern

**Initial load sequence:**
1. `main.tsx` calls `seedKanjisFromJSON()` with JSON file list
2. `indexedDB.ts` populates 'kanjis' store with indexes: by-section, by-level, by-category
3. `App.tsx` loads all kanjis into `kanjiSlice.allKanjis` array
4. User selections stored in `kanjiSlice.chosenKanjis`

**JSON structure (public/json/*.json):**
```json
{
  "kanji": "行",
  "hanViet": "HÀNH, HẠNH",
  "jlptLevel": "N5",
  "gradeLevel": 2,
  "onyomi": ["コウ", "ギョウ"],
  "kunyomi": ["い-く"],
  "englishMeaning": "to go",
  "category": ["Actions"]
}
```
**CRITICAL:** JSON files now use camelCase (not kebab-case). Fields: `hanViet`, `englishMeaning`, `jlptLevel`, `gradeLevel`, `vietnameseMeaning`, `vietMnemonics`, `lucThu`.

**Reloading data:** Control Panel has "🔄 Reload Data" button that calls `indexedDB.deleteDatabase('KanjiDB')` then refreshes.

## Mode-Specific Behaviors

**Sheet Mode:**
- Column count: 4-8 (useAppSelector `sheetColumnCount`)
- Scrollable responsive grid
- Uses mainPanel font settings (4-12rem kanji)
- No pagination (vertical scroll)

**Board Mode:**
- Column count: 4-16 (useAppSelector `boardColumnCount`)
- Fixed A4 pages with pagination
- Auto-calculated card sizes based on viewport
- boardSettings: `{showEmptyCells, centerCards, showHeader, showFooter}`
- Paginator keyboard shortcuts: ← → (prev/next), Home/End (first/last)

**Toggle between modes:** `dispatch(setCurrentMode('sheet' | 'board'))`

## Font Size Ranges & Naming

**Input Panel (Left side):**
- Kanji: 1.5rem - 6.5rem
- Surround-Text (Han-Viet): 0.2rem - 2rem

**Main Panel (Center view):**
- Kanji: 4rem - 12rem
- Surround-Text: 1rem - 5rem

**CRITICAL:** "Han-Viet Size" was renamed to "Surround-Text Size" in FontSizeControl component.

## Indicator Auto-Sizing Pattern

KanjiCard indicators (frequency/JLPT badges) use `hanVietSize` directly:
```typescript
const indicatorSize = hanVietSize; // NOT calculated percentage
```
Badges positioned at `0.2rem` from card edges (NOT `cardPadding`).

## Grid Formula Consistency

**Input Panel & Search (auto-fill for consistent sizing):**
```css
grid-template-columns: repeat(auto-fill, minmax(max(kanjiSize * 1.35rem, calc((100% - 1rem) / 12)), 1fr))
```
Uses `auto-fill` (NOT `auto-fit`) to prevent stretching with few items.

## Testing Commands

```bash
npm run dev              # Vite dev server (auto port 5173 → 5174 if busy)
npm test                 # Vitest unit tests
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode
npm run test:all         # Run both unit + E2E
```

**Playwright projects:** pc-horizontal, pc-vertical, tablet-horizontal, tablet-vertical, mobile-horizontal, mobile-vertical

## Print Styles (src/index.css)

```css
@media print {
  .print-content, .print-content * { visibility: visible; }
  .print-content {
    width: 210mm !important;
    height: 297mm !important;
    transform: none !important;
  }
}
```
A4Paper component has `className="print-content"` for print targeting.

## Common Pitfalls

1. **Don't modify A4_DIMENSIONS** - They're calibrated for 300 DPI print
2. **Board grid uses px, Sheet grid uses fr** - Different layout systems
3. **useMemo for boardLayout** - Expensive calculations, memo by dependencies
4. **Reset currentPage to 1** when mode/columns/kanji count changes
5. **Double-click to remove** kanji in Input Panel (no X button)
6. **@dnd-kit for drag-drop** in Chosen Kanjis section
7. **IndexedDB multiEntry index** for category array searches

## Key Files for Context

- `docs/project-requirements.md` - Complete feature specs & user requirements
- `IMPLEMENTATION_SUMMARY.md` - Recent changes & board mode architecture
- `src/features/mainView/MainView.tsx` - Core dual-mode rendering logic
- `src/components/A4Paper.tsx` - Scaling algorithm reference
- `tailwind.config.js` - Custom breakpoint definitions
