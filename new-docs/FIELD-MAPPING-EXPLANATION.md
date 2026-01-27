# Field Mapping: Why We Keep Both `meaning` and `englishMeaning`

**Date:** January 23, 2025
**Status:** VERIFIED - Backward Compatible Design

---

## Overview

The kanji data transformation in IndexedDB stores **both** `meaning` and `englishMeaning` fields pointing to the same source. This is intentional and maintains backward compatibility.

---

## Field Usage Analysis

### Current Database Transformation

**File:** `src/db/indexedDB.ts`, lines 230-231

```typescript
meaning: kanji.englishMeaning || '',
englishMeaning: kanji.englishMeaning || '',
```

Both fields are populated from the same JSON source (`englishMeaning`).

### Why This Design?

#### 1. **Legacy Code Uses `meaning` Field**

The following components/utilities depend on the `meaning` field:

| File | Usage | Purpose |
|------|-------|---------|
| `utils/questionGenerator.ts:80` | `correctKanji.meaning` | Quiz: Get correct answer for "Kanji to Meaning" questions |
| `utils/questionGenerator.ts:98` | `truncateText(k.meaning, 80)` | Quiz: Display English meaning as quiz option |
| `utils/questionGenerator.ts:102` | `truncateText(k.meaning, 80)` | Quiz: Get meaning for quiz display |
| `utils/questionGenerator.ts:226` | `(!k.meaning \|\| k.meaning.trim() === '')` | Validation: Check if English meaning exists |
| `utils/questionGenerator.ts:286` | `kanji.vietnameseMeaning \|\| kanji.meaning` | Fallback: Use meaning if Vietnamese not available |
| `utils/questionGenerator.ts:288` | `truncateText(kanji.meaning, 80)` | Quiz: Display answer text |
| `utils/kqlParser.ts` | `kanji.meaning` | Search: Include meaning in indexed search |
| `components/pdf/PDFExplanationText.tsx` | `kanji.meaning ? \`★ EN: ${kanji.meaning}\`` | PDF: Display English explanation |
| `components/shared/KanjiTooltip.tsx` | `{kanji.meaning}` | UI: Show meaning in tooltip hover |
| `components/screen/ExplanationText.tsx` | `kanji.meaning ? \`🇺🇸 ${kanji.meaning}\`` | UI: Display English meaning label |
| `db/indexedDB.ts` | `k.meaning.toLowerCase().includes(lowerQuery)` | Search: Filter by meaning text |

**Total: 11 critical locations depend on `meaning` field**

#### 2. **New Extended Indicators Use `englishMeaning` Field**

The new extended indicators system for Board Mode specifically uses:

| File | Usage | Purpose |
|------|-------|---------|
| `components/screen/KanjiCard.tsx:371` | `{kanji.englishMeaning}` | Screen: Display English text on LEFT side |
| `components/pdf/PDFKanjiCard.tsx:303` | `{kanji.englishMeaning}` | PDF: Display English text on LEFT zone |

**Total: 2 locations use new `englishMeaning` field**

#### 3. **Impact of Removing `meaning` Field**

If we removed `meaning` and only used `englishMeaning`, we would need to update:

1. **Quiz System** - Would break question generation and answers
2. **Search System** - Would break meaning-based search (kqlParser)
3. **UI Components** - Would break tooltips and explanations
4. **PDF Export** - Would break explanation text display
5. **IndexedDB Search** - Would break search filter

**This would be a breaking change affecting 5+ systems.**

---

## Decision: Keep Both Fields

### Rationale

**Option 1: Keep Both Fields** ✅ CHOSEN
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ New extended indicators work immediately
- ✅ Legacy code continues to work
- ✅ Minimal code changes
- ⚠️ Slight redundancy (same data in two fields)

**Option 2: Rename `meaning` to `englishMeaning` Everywhere**
- ✅ No redundancy
- ❌ 11 files to update
- ❌ Breaking change to quiz/search systems
- ❌ Risk of regressions
- ❌ More testing needed

**Option 3: Create an Alias/Getter**
- ❌ Not possible in plain JavaScript object storage
- ❌ Would require custom KanjiData class (not applicable to stored data)

### Implementation

**Current state (CORRECT):**

```typescript
const transformed = {
  // ... other fields ...
  meaning: kanji.englishMeaning || '',           // Legacy - for backward compatibility
  englishMeaning: kanji.englishMeaning || '',   // New - for extended indicators
  vietnameseMeaning: kanji.vietnameseMeaning || '',
  // ... other fields ...
};
```

---

## Future Migration Path

If we ever want to remove the `meaning` field:

1. **Phase 1: Update All References**
   - Change all `k.meaning` to `k.englishMeaning` in:
     - questionGenerator.ts
     - kqlParser.ts
     - PDFExplanationText.tsx
     - KanjiTooltip.tsx
     - ExplanationText.tsx
     - indexedDB.ts search function

2. **Phase 2: Testing**
   - Test all quiz question types
   - Test search functionality
   - Test PDF explanations
   - Test tooltips and explanations

3. **Phase 3: Remove**
   - Delete `meaning: kanji.englishMeaning || '',` line
   - Update data transformation comment

4. **Phase 4: Release**
   - Deploy as major version update
   - Document breaking change

---

## Verification Checklist

- ✅ `meaning` field populated from JSON `englishMeaning`
- ✅ `englishMeaning` field populated from JSON `englishMeaning`
- ✅ Quiz system works with `meaning` field
- ✅ Search system works with `meaning` field
- ✅ Extended indicators work with `englishMeaning` field
- ✅ No breaking changes
- ✅ Backward compatible

---

## Summary

**The design is intentionally storing the same value in two fields to:**

1. **Maintain backward compatibility** with existing code that uses `meaning`
2. **Support new features** that use `englishMeaning`
3. **Minimize risk** by avoiding breaking changes
4. **Provide clear migration path** for future refactoring

**This is the correct approach.** Both fields should be kept.

