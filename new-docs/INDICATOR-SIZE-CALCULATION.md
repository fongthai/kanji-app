# Indicator Size Calculation Guide

This document explains how all indicator sizes are calculated for both on-screen and PDF versions. Use this to understand where to modify sizing values.

---

## Quick Reference: All Size Constants

| Constant | Value | File | Line | Purpose |
|----------|-------|------|------|---------|
| `INDICATOR_SIZE_RATIO` | `1.4` | `src/constants/indicators.ts` | 18 | Screen: Indicators = 140% of Han-Viet size |
| `baseIndicatorSize` (PDF) | `0.25` | `src/utils/layoutCalculations.ts` | 97 | PDF: Indicators = 25% of base kanji |
| Meanings font size (screen) | `0.65` | `src/components/screen/KanjiCard.tsx` | 371, 398 | Screen: English/Vietnamese = 65% of Han-Viet |
| Meanings width (screen) | `1.2rem` | `src/components/screen/KanjiCard.tsx` | 369, 396 | Screen: Vertical text zone width |
| Meanings font size (PDF) | `meaningFontSize` | `src/components/pdf/PDFKanjiCard.tsx` | 46 | PDF: Defaults to `hanVietFontSize` |

---

## BOARD MODE: MASTER KANJI AND SURROUNDING TEXT SLIDERS

This section documents the interactive sliders available in the Control Panel for Board mode that allow users to adjust master kanji text and surrounding text sizes in real-time.

### Location in UI

**File:** `src/features/controlPanel/ControlPanel.tsx` (Lines 537-565)
**Component:** `FontSizeControl` (Located in Control Panel Display Settings tab)

The sliders appear when:
- Board mode is selected (`worksheet.currentMode === 'board'`)
- "Board Settings" tab is active in Display Settings section
- The sliders are part of the `mainPanel` settings (applied to the main view panel)

### Master Kanji Text Size Slider

**Label:** "Kanji Character" section → "Size" slider
**Range:** 60% - 120%
**Default:** 110%
**Redux Action:** `setMainPanelKanjiSize(size)`
**Redux Slice:** `src/features/displaySettings/displaySettingsSlice.ts:123-125`

```typescript
// Dispatched when user moves the kanji size slider
dispatch(setMainPanelKanjiSize(newSize))  // Value: 60-120
```

**State Storage:**
```typescript
// src/features/displaySettings/displaySettingsSlice.ts, line 60
mainPanel.kanjiSize: 110  // Default: 110%
```

### Surrounding Text Size Slider

**Label:** "Indicators" section (collapsible) → "Surround-Text Size" slider
**Range:** 35% - 65%
**Default:** 58%
**Redux Action:** `setMainPanelHanVietSize(size)`
**Redux Slice:** `src/features/displaySettings/displaySettingsSlice.ts:129-131`

```typescript
// Dispatched when user moves the surrounding text size slider
dispatch(setMainPanelHanVietSize(newSize))  // Value: 35-65
```

**State Storage:**
```typescript
// src/features/displaySettings/displaySettingsSlice.ts, line 62
mainPanel.hanVietSize: 58  // Default: 58%
```

**Helper Text:** "Affects text badges (Hán-Việt, Vietnamese, English) and master kanji indicators (JLPT, Grade, Frequency)"

### How These Values Are Used

#### Master Kanji Size Usage

**File:** `src/components/screen/KanjiCard.tsx`
**Lines:** 57-58

The `kanjiSize` value (from `mainPanel.kanjiSize`) is passed as a prop to each KanjiCard component:
- Applied as base size: `style={{ fontSize: kanjiSize }}`
- Determines visual scale of the kanji character on screen
- Affects overall card layout proportions

#### Surrounding Text Size Usage

**File:** `src/components/screen/KanjiCard.tsx`
**Lines:** 79, 371, 398

The `hanVietSize` value is used in multiple calculations:

```typescript
// Line 79: Used to calculate indicator badge sizes
const indicatorSize = hanVietSize * INDICATOR_SIZE_RATIO;  // 1.4 multiplier

// Line 371, 398: Used for Vietnamese/English meaning text
fontSize: `${hanVietSize * 0.65}rem`
```

**Lines 162, 175, 188, 220:** Badge text sizing
```typescript
fontSize: `${indicatorSize * 0.5}rem`
```

### Impact on Indicators and Badges

When user adjusts the "Surround-Text Size" slider in Board mode:

1. **Hán-Việt Text:** Font size = `hanVietSize` (percentage applied to 1rem base)
2. **JLPT/Grade/Frequency Badge Sizes:** Size = `hanVietSize × 1.4`
3. **Badge Text:** Font size = `(hanVietSize × 1.4) × 0.5`
4. **Vietnamese/English Meanings:** Font size = `hanVietSize × 0.65`
5. **Column Multiplier (Optional):** Applied when in Board mode with fewer columns:
   - 4 columns: ×1.25
   - 5 columns: ×1.20
   - 6 columns: ×1.15
   - 7 columns: ×1.12

### Files That Consume These Settings

| File | Purpose | Reference |
|------|---------|-----------|
| `src/components/screen/BoardGrid.tsx` | Renders board layout with column-based multipliers | Uses `mainPanel.kanjiSize` and `mainPanel.hanVietSize` props |
| `src/components/screen/KanjiCard.tsx` | Renders individual kanji cards | Uses both sliders to calculate all badge and text sizes |
| `src/components/shared/FontSizeControl.tsx` | UI component with the sliders | Props: `kanjiSize`, `hanVietSize` with ranges 60-120 and 35-65 |
| `src/features/controlPanel/ControlPanel.tsx` | Passes slider values to FontSizeControl | Props `kanjiSizeMin={60}`, `kanjiSizeMax={120}`, `hanVietSizeMin={35}`, `hanVietSizeMax={65}` |

### State Path

Redux store path for Board mode settings:
```
state.displaySettings.mainPanel = {
  kanjiSize: number,        // 60-120 %
  hanVietSize: number,      // 35-65 %
  kanjiFont: string,
  hanVietFont: string,
  showHanViet: boolean,
  showJlptIndicator: boolean,
  showGradeIndicator: boolean,
  showFrequencyIndicator: boolean,
  // ... other display settings
}
```

### PDF Export Considerations

When exporting Board mode to PDF, these slider values are passed to the PDF export functions:
- `mainPanel.kanjiSize` → Used as `kanjiSizePercentage` in layout calculations
- `mainPanel.hanVietSize` → Used as `hanVietSizePercentage` in layout calculations

See **PDF SIZING** section below for how these percentages are applied to PDF dimensions.

---

## ON-SCREEN SIZING

### 1. Base Kanji Size

**File:** `src/components/screen/KanjiCard.tsx`
**Lines:** 57-58
**Key variables:** `kanjiSize` (default: `3rem`)

```
Default: 3rem (passed as prop, controlled by Redux)
Can be overridden per component via props
```

### 2. Han-Viet Text Size

**File:** `src/components/screen/KanjiCard.tsx`
**Lines:** 59-60
**Key variables:** `hanVietSize` (default: `1rem`)

```
Default: 1rem (passed as prop, controlled by Redux)
Can be overridden per component via props
Affected by user's "Surround Text" slider (60-120%)
```

### 3. JLPT, Grade, Frequency Badge Sizes

**File:** `src/components/screen/KanjiCard.tsx`
**Lines:** 79, 162, 175, 188, 220
**Key calculation:**

```typescript
// Line 79:
const indicatorSize = hanVietSize * INDICATOR_SIZE_RATIO;

// INDICATOR_SIZE_RATIO defined in:
// File: src/constants/indicators.ts, Line 18
export const INDICATOR_SIZE_RATIO = 1.4;  // 140% of Han-Viet

// Badge font size is 50% of badge size:
// Lines 162, 175, 198, 220:
fontSize: `${indicatorSize * 0.5}rem`
```

**Summary:**
- Badge size = `hanVietSize × 1.4`
- Badge text = Badge size × 0.5

**Example:** If Han-Viet size = 1rem → Badge = 1.4rem → Text = 0.7rem

### 4. Column-Based Multiplier (Board Mode)

**File:** `src/constants/indicators.ts`
**Lines:** 25-31
**For board mode only (fewer columns = larger sizes):**

```typescript
export const INDICATOR_COLUMN_MULTIPLIERS: Record<number, number> = {
  4: 1.25,  // +25% boost for 4 columns
  5: 1.20,  // +20% boost for 5 columns
  6: 1.15,  // +18% boost for 6 columns
  7: 1.12,  // +15% boost for 7 columns
  // 8+ columns: use default 1.0 (no boost)
}
```

**Applied in:** `src/components/screen/BoardGrid.tsx` (line 77-82)

### 5. English & Vietnamese Meaning Sizes (Vertical Text)

**File:** `src/components/screen/KanjiCard.tsx`

#### Font Size
**Lines:** 371, 398
```typescript
fontSize: `${hanVietSize * 0.65}rem`  // 65% of Han-Viet size
```

#### Width (Zone Width)
**Lines:** 369, 396
```typescript
width: '1.2rem'
```

#### Position
- English Meaning: `left: 0` (left side, vertical-rl)
- Vietnamese Meaning: `right: 0` (right side, vertical-rl)

**Summary:**
- Font size = `hanVietSize × 0.65`
- Zone width = `1.2rem` (fixed)

---

## PDF SIZING

### 1. Base Kanji Size

**File:** `src/utils/layoutCalculations.ts`
**Lines:** 82-94

```typescript
export const calculateFontSizes = (
  cellSize: number,
  kanjiSizePercentage: number,  // User's slider: 60-120%
  hanVietSizePercentage: number, // User's slider: 60-120%
  columnCount?: number
) => {
  // Base kanji: 70% of cell size
  const baseKanjiFontSize = cellSize * 0.7;

  // Apply user's percentage
  const kanjiFontSize = baseKanjiFontSize * (kanjiSizePercentage / 100);
```

**Summary:**
- Base = `cellSize × 0.7`
- Final = Base × (User's kanji slider / 100)

### 2. Indicator and Han-Viet Sizes

**File:** `src/utils/layoutCalculations.ts`
**Lines:** 96-101

```typescript
// Indicator and Han-viet: 25% of base kanji size
const baseIndicatorSize = baseKanjiFontSize * 0.25;

// Apply column-based multiplier if columnCount provided
const columnMultiplier = columnCount ?
  getIndicatorColumnMultiplier(columnCount) : 1.0;

const indicatorFontSize = baseIndicatorSize *
  (hanVietSizePercentage / 100) * columnMultiplier;
```

**Formula:**
```
indicatorFontSize = (cellSize × 0.7 × 0.25) × (hanVietSlider / 100) × columnMultiplier
                  = (cellSize × 0.175) × (hanVietSlider / 100) × columnMultiplier
```

**Summary:**
- Base = `cellSize × 0.7 × 0.25`
- Applied = Base × (User's surround text slider / 100) × Column multiplier
- **Note:** Different from screen (0.7 vs 0.75 for base kanji)

### 3. Badge Text Sizes

**File:** `src/components/pdf/PDFJLPTIndicator.tsx`
**Lines:** 32

```typescript
fontSize: size * 0.5,  // 50% of badge size
```

**File:** `src/components/pdf/PDFGradeIndicator.tsx`
**Lines:** 31

```typescript
fontSize: size * 0.5,  // 50% of badge size
```

**File:** `src/components/pdf/PDFFrequencyBadge.tsx`
**Lines:** 55

```typescript
fontSize: size * 0.52,  // 52% of badge size (increased from 0.45)
```

### 4. English & Vietnamese Meaning Sizes (Vertical Text)

**File:** `src/components/pdf/PDFKanjiCard.tsx`

#### Font Size
**Lines:** 180, 185, 231, 240

```typescript
// Line 180, 185: Han-Viet meanings
fontSize: hanVietFontSize

// Line 231, 240: English/Vietnamese meanings
fontSize: meaningFontSize
// Default: meaningFontSize = hanVietFontSize (from props)
```

**Note:** No explicit percentage is multiplied for meanings in PDF (uses direct values passed)

#### Width (Zone Width)

**Calculated by:** `src/utils/meaningIndicatorLayout.ts`
**Function:** `calculateZoneAllocation()`

Returns zone widths for English, Han-Viet, and Vietnamese based on available space and what's displayed.

---

## SIZING HIERARCHY

### Screen Version

```
Card → Kanji Size (3rem default)
   ↓
   Han-Viet Size (1rem default or from slider)
   ↓
   ├─ Indicators: Han-Viet × 1.4 × columnMultiplier (board only)
   ├─ Badge Text: Indicator × 0.5
   ├─ English/Vietnamese: Han-Viet × 0.65 (width: 1.2rem)
   ├─ Han-Viet Badge: Indicator × 1.4
   └─ Frequency Badge: Indicator × 0.52
```

### PDF Version

```
Card → Cell Size (calculated based on columns/rows)
   ↓
   Base Kanji: Cell × 0.7 × (Slider / 100)
   ↓
   Base Indicator: Cell × 0.7 × 0.25 × (Slider / 100) × columnMultiplier
   ↓
   ├─ Badge Text: Indicator × 0.5 (or 0.52 for frequency)
   ├─ English/Vietnamese: Indicator (direct value)
   └─ Han-Viet Text: Indicator (direct value)
```

---

## WHERE TO CHANGE VALUES

### To increase all indicator badges uniformly (screen):

Edit `src/constants/indicators.ts` line 18:
```typescript
export const INDICATOR_SIZE_RATIO = 1.4;  // Change 1.4 to desired value (e.g., 1.6)
```

### To increase indicator badges in PDF:

Edit `src/utils/layoutCalculations.ts` line 97:
```typescript
const baseIndicatorSize = baseKanjiFontSize * 0.25;  // Change 0.25 to desired value
```

### To increase badge text size:

**Screen badges:** `src/components/screen/KanjiCard.tsx` lines 162, 175, 198, 220
```typescript
fontSize: `${indicatorSize * 0.5}rem`  // Change 0.5 multiplier
```

**PDF JLPT badge:** `src/components/pdf/PDFJLPTIndicator.tsx` line 32
```typescript
fontSize: size * 0.5,
```

**PDF Grade badge:** `src/components/pdf/PDFGradeIndicator.tsx` line 31
```typescript
fontSize: size * 0.5,
```

**PDF Frequency badge:** `src/components/pdf/PDFFrequencyBadge.tsx` line 55
```typescript
fontSize: size * 0.52,
```

### To increase English/Vietnamese meaning sizes:

**Screen:** `src/components/screen/KanjiCard.tsx` lines 371, 398
```typescript
fontSize: `${hanVietSize * 0.65}rem`  // Change 0.65 multiplier
width: '1.2rem'  // Change width value
```

**PDF:** `src/components/pdf/PDFKanjiCard.tsx` line 46
```typescript
meaningFontSize = hanVietFontSize  // Change default or pass custom value
```

### To adjust column multipliers (board mode only):

Edit `src/constants/indicators.ts` lines 25-31:
```typescript
export const INDICATOR_COLUMN_MULTIPLIERS: Record<number, number> = {
  4: 1.25,  // Adjust these values
  5: 1.20,
  6: 1.15,
  7: 1.12,
}
```

---

## Key Differences: Screen vs PDF

| Aspect | Screen | PDF | Reason |
|--------|--------|-----|--------|
| Base kanji ratio | 0.75 (implied) | 0.7 | PDF uses PDFKit which needs different spacing |
| Indicator ratio | 25% of Han-Viet | 25% of base kanji | Screen uses Han-Viet as reference, PDF uses cell-based calculation |
| Frequency text | 50% of badge | 52% of badge | PDF uses slightly larger for readability |
| Column multiplier | Applied to indicators | Applied to indicators | Same in both, but optional in PDF |
| Meanings sizing | 65% of Han-Viet | Direct hanVietFontSize | Different calculation approaches |

---

## Testing Changes

After modifying any size constants:

1. **Build:** `npm run build`
2. **Test Screen:** Navigate to Board Mode with 4-8 columns
3. **Test PDF:** Export to PDF with same column count
4. **Verify:** Compare visual sizes match expectations
5. **Check:** Ensure badges don't overlap with kanji character

