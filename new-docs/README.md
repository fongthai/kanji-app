# Extended Indicators System - Documentation Suite

This directory contains comprehensive documentation for implementing the Extended Indicators system for Board Mode in the Kanji App.

## 📋 Documents

### 1. **INDICATORS_MEANING_LAYOUT.md** - Main Specification
**Purpose**: Defines the design, rules, and layout requirements

**Contains**:
- Overview of the 6-indicator system (JLPT, Grade, Frequency, English, Vietnamese, Han-Viet)
- 4-zone spatial model
- 4 Display Rules with detailed requirements
- 5 complete scenario examples with ASCII diagrams
- Font size calculations
- Text truncation algorithm
- Space expansion cascade logic
- UI control structure
- Testing checklist

**Read this first to understand**: What the feature does and how it should look

---

### 2. **IMPLEMENTATION_PLAN.md** - Execution Guide
**Purpose**: Step-by-step implementation instructions

**Contains**:
- 7 implementation phases with file-by-file changes
- Data model updates
- UI control refactoring details
- Layout calculation logic (with pseudo-code)
- PDF component rendering changes
- Component props and data flow
- Integration points
- Complexity ratings for each change
- Testing scenarios
- Success criteria

**Read this when ready to**: Code the implementation

---

### 3. **IMPLEMENTATION-COMPLETE.md** - Project Summary ✅ NEW
**Purpose**: Comprehensive overview of completed implementation

**Contains**:
- Executive summary of all 6 phases
- Phase-by-phase completion status
- Technical implementation details
- File modifications summary
- Build status and quality metrics
- Feature specifications
- Known limitations
- Testing verification checklist
- Deployment procedures

**Read this to**: Understand what was built and current status

---

### 4. **PHASE6-TESTING.md** - Testing & QA Guide ✅ NEW
**Purpose**: Comprehensive testing procedures and verification checklist

**Contains**:
- Build verification results (✅ 649 modules, 0 errors)
- Data verification (kanji files contain all meanings)
- Implementation components verification
- 10-part testing checklist:
  - UI Controls testing
  - All 5 layout scenario tests
  - Text truncation verification
  - Space expansion cascade testing
  - Different orientations testing
  - PNG export verification
  - Column count variations
  - Font support testing
  - Grayscale mode verification
  - Edge case handling
- PDF visual quality checklist
- Performance considerations
- Known limitations
- Testing environment setup
- Success criteria

**Read this to**: Execute Phase 6 testing and verify quality

---

## 🎯 Quick Reference

### The 3-Meaning Indicators System

**What it adds**:
- English Meaning (LEFT zone, vertical text)
- Vietnamese Meaning (RIGHT zone, vertical text)
- Han-Viet Meanings (BOTTOM zone, horizontal text)

**Core Rules**:

| Rule | Summary |
|------|---------|
| **Rule 1** | Truncate long text with `..` suffix (space-based truncation) |
| **Rule 2** | Fixed zones: English LEFT, Vietnamese RIGHT, Han-Viet BOTTOM |
| **Rule 3** | If indicator hidden/empty, others expand (Priority: English→HanViet→Vietnamese) |
| **Rule 4** | Empty indicators free up space for cascading indicators |

### Layout Scenarios

```
Scenario A (All 3 shown)
┌─────────────────────┐
│ ENG │    KANJI    │ VIE │
│ GLS │             │ TMS │
├────── HAN-VIET ────┤

Scenario B (Only HanViet)
┌─────────────────────┐
│            KANJI           │
│                           │
├── HAN-VIET (full width) ──┤

Scenario C (English + HanViet)
┌─────────────────────┐
│ ENG │    KANJI    │ │
│ LIS │             │ │
├────── HAN-VIET ────┤
```

### Text Orientation
- **LEFT & RIGHT zones**: Vertical (`writingMode: 'vertical-rl'`) - reads top-to-bottom
- **BOTTOM zone**: Horizontal - reads left-to-right normally

### Priority Cascade
If space freed up, indicators get space in this order:
1. **English Meaning** (highest priority)
2. **Han-Viet Meanings** (medium priority)
3. **Vietnamese Meaning** (lowest priority)

---

## 📊 Implementation Roadmap

```
Phase 1: Data Model Setup
├─ Update KanjiData type
└─ Add Redux state for new settings

Phase 2: UI Controls
├─ Refactor FontSizeControl component
├─ Move Han-Viet checkbox to Indicators group
├─ Add English & Vietnamese checkboxes
└─ Move size slider to bottom

Phase 3: Layout Calculation
├─ Create meaningIndicatorLayout.ts
├─ Implement zone allocation algorithm
├─ Implement text truncation function
└─ Handle space expansion cascade

Phase 4: Rendering (PDF)
├─ Update KanjiCard props
├─ Update PDFKanjiCard component
├─ Render English (vertical, LEFT)
├─ Render Vietnamese (vertical, RIGHT)
└─ Render Han-Viet (horizontal, BOTTOM)

Phase 5: Data & Props
├─ Load new meaning fields
├─ Pass through component hierarchy
└─ Update exportUtils

Phase 6: Testing
├─ Test all 5 scenarios
├─ Test truncation
├─ Test expansion cascade
└─ Verify PDF/PNG output

Phase 7: Integration
└─ Final testing and cleanup
```

---

## 📝 Key Implementation Points

### Files to Modify (7 total)

**Low Complexity** (straightforward changes):
- `src/features/displaySettings/displaySettingsSlice.ts` - Add new settings
- `src/features/kanji/kanjiSlice.ts` - Add meaning fields
- `src/features/controlPanel/ControlPanel.tsx` - Wire dispatchers

**Medium Complexity** (requires careful changes):
- `src/components/shared/FontSizeControl.tsx` - UI refactoring
- `src/components/screen/KanjiCard.tsx` - Update props

**High Complexity** (core implementation):
- `src/components/pdf/PDFKanjiCard.tsx` - Main rendering logic

**New Files**:
- `src/utils/meaningIndicatorLayout.ts` - Layout calculations

### Critical Algorithms

1. **Zone Allocation** (Rule 3-4 implementation)
   - Check which indicators are enabled AND have data
   - Apply priority cascade
   - Return height/width allocation per zone

2. **Text Truncation** (Rule 1 implementation)
   - Measure actual rendered text width
   - Iteratively remove characters
   - Append `..` when truncated

3. **Space Expansion** (Rule 3 implementation)
   - If English disabled → HanViet takes LEFT space
   - If HanViet disabled → Vietnamese takes BOTTOM space
   - Stack expansions if multiple indicators disabled

### Data Requirements

New fields needed in kanji data:
```typescript
kanji.englishMeaning?: string    // e.g., "person"
kanji.vietnameseMeaning?: string // e.g., "người"
kanji.hanViet: string            // Already exists, e.g., "ニン、じん"
```

---

## 🧪 Testing Checklist

### Manual Test Scenarios
- [ ] All 3 meanings enabled with data
- [ ] Only Han-Viet enabled
- [ ] English + Han-Viet enabled (Vietnamese disabled)
- [ ] English + Vietnamese enabled (Han-Viet disabled)
- [ ] Han-Viet enabled but empty (English + Vietnamese take space)
- [ ] Long text truncation with `..` appears
- [ ] Size slider affects all meanings equally
- [ ] Column multipliers apply to meaning text
- [ ] PDF/PNG export renders correctly
- [ ] No text overlap or clipping
- [ ] Different character sets handled (Latin, Vietnamese diacritics, Japanese)

### Edge Cases
- Missing data in one field
- Very narrow columns (small cards)
- Multiple meanings in Han-Viet (comma-separated)
- All three meanings disabled
- Size slider at minimum/maximum
- Right-to-left scripts (future consideration)

---

## 🔍 How to Use This Documentation

**If you're...**

📖 **New to the feature**:
1. Read INDICATORS_MEANING_LAYOUT.md sections 1-4
2. Look at the scenario diagrams
3. Review the Display Rules

💻 **Ready to code**:
1. Read IMPLEMENTATION_PLAN.md Phase 1-2
2. Start with data model changes (Phase 1)
3. Move to UI controls (Phase 2)
4. Follow phases sequentially

🐛 **Debugging issues**:
1. Check the scenario that matches your case
2. Review the Rule that applies
3. Verify the algorithm in pseudo-code
4. Check component props are passed correctly

✅ **Testing features**:
1. Use the "Testing Checklist" in INDICATORS_MEANING_LAYOUT.md
2. Try each of the 5 scenarios from IMPLEMENTATION_PLAN.md
3. Verify edge cases with different column counts

---

## 📎 Key Specifications Summary

### Text Orientations
```
LEFT (English):   vertical-rl (top-to-bottom, left side)
RIGHT (Vietnamese): vertical-rl (top-to-bottom, right side)
BOTTOM (HanViet): horizontal (left-to-right, normal)
```

### Size Calculations
```
All meanings use same size formula:
baseSize = kanji_base × 0.25
size = baseSize × (hanVietSize% ÷ 100) × columnMultiplier
```

### Priority for Space Expansion
```
1st → English (if enabled + has data)
2nd → Han-Viet (if enabled + has data)
3rd → Vietnamese (if enabled + has data)
```

### Truncation
```
When text doesn't fit:
  1. Measure actual rendered width
  2. Remove characters one by one
  3. Append '..' when it fits
```

---

## ❓ Common Questions

**Q: Why vertical text for English/Vietnamese?**
A: Maximizes readability in narrow left/right zones and follows traditional Asian text layout conventions.

**Q: How does space expansion work exactly?**
A: If an indicator is disabled or has no data, its zone is freed. Other indicators follow the priority order (English→HanViet→Vietnamese) to claim the freed space.

**Q: Will this affect Input Panel or Sheet Mode?**
A: No, this is Board Mode only. Input Panel and Sheet Mode remain unchanged.

**Q: What happens if all meanings have the same text?**
A: It's handled like three separate fields. Each can be enabled/disabled independently.

**Q: Can meanings be different per column count?**
A: No, meanings are static per kanji. Only the display size changes with column multipliers.

---

## 🚀 Next Steps

1. **Review** the specification documents
2. **Clarify** any questions about the design
3. **Approve** the implementation approach
4. **Begin** Phase 1 implementation (data model)
5. **Test** progressively after each phase

Ready to begin implementation when you give the go-ahead!
