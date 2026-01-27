# Extended Indicators Implementation Plan

## Phase Overview

Implement the extended indicators system (English + Vietnamese + Han-Viet meanings) with complex space expansion logic for Board Mode PDF/PNG exports.

**Scope**: Board Mode only (affects KanjiCard variant="board")
**Not affected**: Input Panel, Sheet Mode
**Timeline**: Multi-step implementation with testing at each phase

---

## Phase 1: Data Model & Redux State

### 1.1 Update KanjiData Type

**File**: `src/features/kanji/kanjiSlice.ts`

Add new fields to `KanjiData` interface:
```typescript
interface KanjiData {
  // ... existing fields
  hanViet: string;                    // Already exists
  vietnameseMeaning?: string;         // NEW: Vietnamese meaning
  englishMeaning?: string;            // NEW: English meaning
}
```

### 1.2 Update Display Settings State

**File**: `src/features/displaySettings/displaySettingsSlice.ts`

Add new display toggles:
```typescript
interface FontSizeSettings {
  // ... existing fields
  showHanViet: boolean;               // Already exists
  showVietnameseMeaning: boolean;     // NEW
  showEnglishMeaning: boolean;        // NEW
  // Remove: hanVietSize - will move to Indicators group
}
```

**Redux Actions Needed**:
- `setShowVietnameseMeaning(payload: boolean)`
- `setShowEnglishMeaning(payload: boolean)`

---

## Phase 2: UI Controls Refactoring

### 2.1 Refactor FontSizeControl Component

**File**: `src/components/shared/FontSizeControl.tsx`

**Changes**:
1. Create new section: "Indicators Group"
2. Move existing checkboxes into group:
   - JLPT Indicator
   - Grade Indicator
   - Frequency Indicator
3. Add new checkboxes (subsection):
   - ✓ Han-Viet Meanings
   - ✓ Vietnamese Meaning
   - ✓ English Meaning
4. Move size slider to bottom of indicators group

**New Structure**:
```
┌─ Indicators ──────────────────────┐
│ □ JLPT  □ Grade  □ Frequency      │
├───────────────────────────────────┤
│ □ Han-Viet  □ Vietnamese □ English│
├───────────────────────────────────┤
│ Surround-Text Size: [====●======] │
│                      35% ← → 65%  │
└───────────────────────────────────┘
```

**Props to Update**:
- Add `showVietnameseMeaning: boolean`
- Add `onToggleShowVietnameseMeaning: (show: boolean) => void`
- Add `showEnglishMeaning: boolean`
- Add `onToggleShowEnglishMeaning: (show: boolean) => void`

### 2.2 Update ControlPanel to Wire New Settings

**File**: `src/features/controlPanel/ControlPanel.tsx`

Add dispatchers for new toggles:
```typescript
const handleToggleShowVietnameseMeaning = (show: boolean) => {
  dispatch(setShowVietnameseMeaning(show));
};

const handleToggleShowEnglishMeaning = (show: boolean) => {
  dispatch(setShowEnglishMeaning(show));
};
```

Pass to FontSizeControl component.

---

## Phase 3: Layout Calculation Logic

### 3.1 Create New Layout Calculation Utilities

**File**: `src/utils/meaningIndicatorLayout.ts` (NEW)

```typescript
interface IndicatorConfig {
  showEnglish: boolean;
  showVietnamese: boolean;
  showHanViet: boolean;
  hasEnglishData: boolean;
  hasVietnameseData: boolean;
  hasHanVietData: boolean;
}

interface ZoneAllocation {
  english: {
    enabled: boolean;
    zone: 'left' | 'left-expanded' | 'none';
    heightPercent: number;
  };
  vietnamese: {
    enabled: boolean;
    zone: 'right' | 'right-expanded' | 'none';
    heightPercent: number;
  };
  hanViet: {
    enabled: boolean;
    zone: 'bottom' | 'bottom-expanded' | 'none';
    heightPercent: number;
  };
}

/**
 * Calculate zone allocation based on which indicators are enabled/have data
 * Implements Rule 3 & 4: Space expansion with priority cascade
 */
export function calculateZoneAllocation(config: IndicatorConfig): ZoneAllocation {
  // Priority order: English (1) → HanViet (2) → Vietnamese (3)

  // Determine what has data and is enabled
  const englishActive = config.showEnglish && config.hasEnglishData;
  const hanVietActive = config.showHanViet && config.hasHanVietData;
  const vietnameseActive = config.showVietnamese && config.hasVietnameseData;

  // Priority allocation algorithm (see logic below)
  // Returns zone allocation with expansion rules applied
}

/**
 * Truncate text to fit within a given width with ellipsis
 * Rule 1: Truncate with '..' suffix
 */
export function truncateMeaningText(
  text: string,
  maxWidthPx: number,
  fontSize: number,
  fontFamily: string,
  orientation: 'horizontal' | 'vertical'
): string {
  // Measure text width and truncate if needed
  // Return text or text + '..'
}
```

### 3.2 Space Expansion Logic

Implement the priority cascade algorithm:

```typescript
function calculateZoneAllocation(config: IndicatorConfig): ZoneAllocation {
  const zones: ZoneAllocation = {
    english: { enabled: false, zone: 'none', heightPercent: 0 },
    vietnamese: { enabled: false, zone: 'none', heightPercent: 0 },
    hanViet: { enabled: false, zone: 'none', heightPercent: 0 },
  };

  const availableHeight = 100;  // Percentage units
  let allocatedHeight = 0;

  // Priority 1: English Meaning
  if (config.showEnglish && config.hasEnglishData) {
    zones.english = { enabled: true, zone: 'left', heightPercent: 50 };
    allocatedHeight += 50;
  }

  // Priority 2: Han-Viet Meanings
  if (config.showHanViet && config.hasHanVietData) {
    // Can expand if English is not taking space
    const canExpand = !zones.english.enabled;
    zones.hanViet = {
      enabled: true,
      zone: canExpand ? 'bottom-expanded' : 'bottom',
      heightPercent: canExpand ? 50 : 30,
    };
    allocatedHeight += zones.hanViet.heightPercent;
  }

  // Priority 3: Vietnamese Meaning
  if (config.showVietnamese && config.hasVietnameseData) {
    const remainingHeight = 100 - allocatedHeight;
    zones.vietnamese = {
      enabled: true,
      zone: remainingHeight > 30 ? 'right' : 'right-expanded',
      heightPercent: remainingHeight,
    };
  }

  return zones;
}
```

---

## Phase 4: PDF KanjiCard Component Update

### 4.1 Update KanjiCard Props

**File**: `src/components/screen/KanjiCard.tsx`

Add new props:
```typescript
interface KanjiCardProps {
  // ... existing props
  vietnameseMeaning?: string;        // NEW
  englishMeaning?: string;           // NEW
  showVietnameseMeaning?: boolean;   // NEW
  showEnglishMeaning?: boolean;      // NEW
  meaningIndicatorLayout?: ZoneAllocation;  // NEW - from Phase 3
}
```

### 4.2 Update PDF Rendering (PDFKanjiCard)

**File**: `src/components/pdf/PDFKanjiCard.tsx`

**Changes**:
1. Import layout calculation function
2. Calculate zone allocation based on props
3. Render English meaning on LEFT side (vertical text)
4. Render Vietnamese meaning on RIGHT side (vertical text)
5. Update HanViet rendering on BOTTOM to handle expansion
6. Implement text truncation with '..' for all three
7. Apply expansion styles when zones are marked as 'expanded'

**New Styles**:
```typescript
meaningLeftContainer: {
  position: 'absolute',
  left: 3,
  top: 0,
  bottom: bottomZoneHeight,  // Dynamic based on allocation
  width: leftWidth,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  writingMode: 'vertical-rl',  // Top-to-bottom vertical
},
meaningRightContainer: {
  position: 'absolute',
  right: 3,
  top: 0,
  bottom: bottomZoneHeight,
  width: rightWidth,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  writingMode: 'vertical-rl',  // Top-to-bottom vertical
},
meaningBottomContainer: {
  position: 'absolute',
  bottom: 3,
  left: 0,
  right: 0,
  height: bottomZoneHeight,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
```

### 4.3 Text Truncation Implementation

For each meaning zone:
```typescript
// Measure available space
const maxChars = calculateMaxChars(availableWidth, fontSize);

// Truncate if needed
let displayText = englishMeaning;
if (englishMeaning.length > maxChars) {
  displayText = englishMeaning.substring(0, maxChars - 2) + '..';
}
```

---

## Phase 5: Data Loading & Props Passing

### 5.1 Update Data Loading

**File**: `src/features/kanji/kanjiSlice.ts` or data loading utility

Ensure new fields are loaded from kanji data source:
- `vietnameseMeaning`
- `englishMeaning`

If data comes from JSON, update parser.

### 5.2 Pass Props Through Component Tree

**Update flow**:

1. **exportUtils.ts** → PDFBoardDocument
   - Pass meaning display settings
   - Pass meaning data from kanjis

2. **PDFBoardDocument** → PDFBoardPage
   - Pass showVietnameseMeaning
   - Pass showEnglishMeaning

3. **PDFBoardPage** → PDFBoardGrid
   - Pass settings and flags

4. **PDFBoardGrid** → PDFKanjiCard
   - Pass individual kanji meanings
   - Pass display settings
   - Pass calculated layout

---

## Phase 6: Testing & Refinement

### 6.1 Manual Test Scenarios

Test in Board Mode PDF/PNG export:

- [ ] **Scenario A**: All 3 meanings enabled with data
  - Verify: English LEFT, Vietnamese RIGHT, HanViet BOTTOM
  - Verify: All text fits without overlap
  - Verify: Vertical text orientation on left/right

- [ ] **Scenario B**: Only HanViet enabled
  - Verify: Takes full bottom width
  - Verify: Left/right zones empty

- [ ] **Scenario C**: English + HanViet (no Vietnamese)
  - Verify: English on left
  - Verify: HanViet on bottom
  - Verify: Right side empty

- [ ] **Scenario D**: English + Vietnamese (no HanViet)
  - Verify: Both sides populated
  - Verify: Bottom space handled properly
  - Verify: Proper height distribution

- [ ] **Scenario E**: HanViet enabled but EMPTY data
  - Verify: Space freed to cascade
  - Verify: English or Vietnamese can expand if data

- [ ] **Text Truncation**: Long meanings
  - Verify: '..' appears when truncated
  - Verify: Readability maintained
  - Verify: Each language truncates appropriately

- [ ] **Size Slider**: Adjust meaning text size
  - Verify: All three meanings scale together
  - Verify: Column multipliers apply
  - Verify: No overlap or clipping

### 6.2 Edge Cases

- Missing data in one field
- Very long text in tight space
- Multiple meanings (comma-separated in HanViet)
- Different character sets (Latin, Vietnamese, Japanese)
- Small card sizes (narrow columns)

---

## Phase 7: Integration Points

### 7.1 Files to Modify

| File | Purpose | Complexity |
|------|---------|-----------|
| `src/features/displaySettings/displaySettingsSlice.ts` | Add new settings | LOW |
| `src/features/kanji/kanjiSlice.ts` | Extend KanjiData type | LOW |
| `src/components/shared/FontSizeControl.tsx` | Refactor UI controls | MEDIUM |
| `src/features/controlPanel/ControlPanel.tsx` | Wire new dispatchers | LOW |
| `src/utils/meaningIndicatorLayout.ts` | NEW - Layout logic | HIGH |
| `src/components/screen/KanjiCard.tsx` | Update props | MEDIUM |
| `src/components/pdf/PDFKanjiCard.tsx` | Render new zones | HIGH |
| `src/utils/exportUtils.ts` | Pass new data | LOW |
| Data source | Load new fields | LOW-MEDIUM |

### 7.2 New Files to Create

```
src/utils/meaningIndicatorLayout.ts          // Layout calculation logic
new-docs/INDICATORS_MEANING_LAYOUT.md        // Specification (already created)
new-docs/IMPLEMENTATION_PLAN.md              // This file
```

---

## Known Constraints & Considerations

1. **Text Measurement**: May need to implement custom text width measurement for truncation (React-PDF doesn't have native support)

2. **Vertical Text Support**: Verify React-PDF supports `writingMode: 'vertical-rl'` or use alternative approach

3. **Performance**: Calculate layouts once, not per-render

4. **Backward Compatibility**: New fields optional, graceful fallback for missing data

5. **Localization**: Meaning text may contain right-to-left scripts (Arabic, Hebrew) - consider in future

---

## Rollout Strategy

**Phase Sequence**:
1. ✓ Data model & settings (P1-P2)
2. ✓ UI controls refactoring (P2)
3. ✓ Layout calculation (P3)
4. ✓ Rendering implementation (P4-P5)
5. ✓ Testing & refinement (P6)
6. ✓ Integration & deployment (P7)

**Testing Checkpoints**:
- After P2: New settings appear in UI
- After P3: Layout calculations verified in unit tests
- After P4: Cards render (even if text missing)
- After P5: Full end-to-end PDF export works
- After P6: All scenarios tested

---

## Success Criteria

✓ All 3 meanings display correctly when enabled
✓ Space expansion works per Rule 3 priority
✓ Truncation with '..' appears for long text
✓ Text orientation correct (vertical left/right, horizontal bottom)
✓ Column multipliers apply to meaning text
✓ PDF/PNG export renders without errors
✓ No overflow or text clipping
✓ All test scenarios pass
✓ Existing Board Mode functionality unaffected
