# Extended Indicators Layout Specification

## Overview

This document defines the layout and behavior for the new expanded indicators system in Board Mode cards. The system displays 6 pieces of information on a square kanji card:

1. **JLPT Indicator** (badge)
2. **Grade Indicator** (circled number)
3. **Frequency Indicator** (badge)
4. **Han-Viet Meanings** (bottom zone)
5. **Vietnamese Meaning** (right zone)
6. **English Meaning** (left zone)

## Card Layout Structure

### Spatial Zones (4-zone model)

```
┌────────────────────────────┐
│ JLPT Badge  [  KANJI   ]   │
│ Grade Badge [  (CENTER)]   │ Frequency
│             [           ]  │ Badge
│             [           ]  │
│ ENGLISH     [           ]  VIETNAMESE
│ (LEFT)      [           ]  (RIGHT)
│             [           ]  │
├─────── HAN-VIET (BOTTOM) ──┤
└────────────────────────────┘
```

The card is divided into 4 zones for the meaning indicators:
- **LEFT Zone**: English Meaning
- **RIGHT Zone**: Vietnamese Meaning
- **BOTTOM Zone**: Han-Viet Meanings
- **CENTER**: Kanji character (not movable)

Indicators (JLPT badge, Grade badge, Frequency) are positioned in corners and don't interfere with zones.

## Display Rules

### Rule 1: Truncation with Ellipsis

**Requirement**: All three meaning indicators (HanViet, VietnameseMeaning, EnglishMeaning) must truncate if text is too long for available space.

**Implementation**:
- Truncate text to fit available width in zone
- Append `..` (two dots) to indicate truncation
- Use space-based truncation: measure actual rendered text width
- Preserve readability by truncating at word boundaries when possible

**Examples**: Note: This is board mode for Kanji, so only 1 kanji character, not words"
```
Original: "Người đàn ông bận rộn"
Truncated (if limited width): "Người đàn ông.."

Original: "A person who is very busy"
Truncated: "A person who is.."

Original: "忙しい人、働く人"
Truncated: "忙しい人、働.."
```

---

### Rule 2: Fixed Positioning for All 3 Indicators

**Requirement**: When all three indicators are enabled and have data:

- **English Meaning** → **LEFT SIDE** (vertical orientation, top-to-bottom reading)
- **Vietnamese Meaning** → **RIGHT SIDE** (vertical orientation, top-to-bottom reading)
- **Han-Viet Meanings** → **BOTTOM** (horizontal orientation)

**Text Orientation Details**:
- **LEFT (English)**: Vertical form, text reads from **top to bottom** (left-to-right rotated 90° CW)
- **RIGHT (Vietnamese)**: Vertical form, text reads from **top to bottom** (left-to-right rotated 90° CW)
- **BOTTOM (Han-Viet)**: Horizontal form, text reads **left to right** normally

**Technical Notes**:
- Left/Right zones split the vertical space equally (excluding bottom zone)
- Han-Viet always at bottom, above footer area
- Text uses `writingMode: 'vertical-rl'` for CSS or equivalent
- Character spacing adjusted for readability in vertical mode
- Clear 3-4pt margin from card edges

---

### Rule 3: Space Expansion Priority System

**Requirement**: When one or more indicators are NOT checked (disabled) or have NO DATA, remaining indicators can expand to use the freed space.

**Priority Order for Space Expansion**:
1. **Priority 1**: English Meaning (LEFT zone)
2. **Priority 2**: Han-Viet Meanings (BOTTOM zone)
3. **Priority 3**: Vietnamese Meaning (RIGHT zone)

**Expansion Mechanics**:
- If an indicator is disabled (unchecked) or has no data, its zone is freed
- Space is allocated to the highest-priority indicator that is:
  - ✓ Enabled (checked)
  - ✓ Has data to display
- An indicator can expand in this order:
  1. **Expand within its own zone** (use full available height/width)
  2. **Expand to adjacent zone** (take space from freed zones)
  3. **Expand to full card** (if all other zones freed)

**Expansion Sequence** (checked in order):
```
If EnglishMeaning is enabled + has data:
  └─ Takes LEFT zone + any freed space to the right

If HanViet is enabled + has data:
  └─ Takes BOTTOM zone + any freed space from above
  └─ Can expand left/right if Vietnamese is freed

If VietnameseMeaning is enabled + has data:
  └─ Takes RIGHT zone + any freed space
```

---

### Rule 4: Cascade Handling for Empty Data

**Requirement**: If an indicator is enabled but has NO DATA to display, that zone's space becomes available to the next priority indicator.

**Behavior**:
1. Check if indicator has data (`kanji.englishMeaning?.length > 0`, etc.)
2. If NO data → treat as "freed space" and cascade to next priority
3. If HAS data → display with available space
4. Continue down priority chain until space is allocated

**Example Scenarios**:

#### Scenario A: All Enabled, All Have Data
```
┌───────────────────────────┐
│ [JLPT]   [  KANJI  ]   [F]│
│          [           ]    │
│ ENGLISH  [           ] VIE│
│          [           ]    │
├──────── HAN-VIET ─────────┤
└───────────────────────────┘
Layout: LEFT (English) | CENTER (Kanji) | RIGHT (Vietnamese)
        └──────────────┴─────────────────────────────────────┘
        BOTTOM: Han-Viet
```

#### Scenario B: English Enabled but NO DATA, Vietnamese + HanViet Enabled
```
┌───────────────────────────┐
│ [JLPT]   [  KANJI  ]   [F]│
│          [           ]    │
│          [           ] VIE│
│          [           ] VIE│
├──────── HAN-VIET ─────────┤
└───────────────────────────┘
Layout: LEFT: Han-Viet (expand) | CENTER (Kanji) | RIGHT: Vietnamese (normal)
        └──────────────┴───────────────────────────────────┘
        BOTTOM: Han-Viet (normal)
```

#### Scenario C: Only HanViet Enabled + Has Data
```
┌───────────────────────────┐
│ [JLPT]   [  KANJI  ]   [F]│
│          [           ]    │
│          [           ]    │
│          [           ]    │
├──────── HAN-VIET ─────────┤
│ (takes full bottom width) │
└───────────────────────────┘
Layout: (Han-Viet expand) | CENTER (Kanji) | ((Han-Viet expand))
        └──────────────┴───────────────────────────────────┘
        BOTTOM: Han-Viet (normal)
```

#### Scenario D: EnglishMeaning + HanViet, both enabled, both have data
```
┌───────────────────────────┐
│ [JLPT]   [  KANJI  ]   [F]│
│          [           ]    │
│ ENGLISH  [           ]    │
│          [           ]    │
├──────── HAN-VIET ─────────┤
└───────────────────────────┘
Layout: LEFT (English - can expand right) | CENTER (Kanji)
        └──────────────┴───────────────────────────────────┘
        BOTTOM: Han-Viet (normal)
```

#### Scenario E: Only Vietnamese Enabled
```
┌───────────────────────────┐
│ [JLPT]   [  KANJI  ]   [F]│
│          [           ]    │
│          [           ] VIE│
│          [           ] VIE│
│          [           ] VIE│
├─────────────────────────────┤
└───────────────────────────┘
Layout: (LEFT: Vietnamese expand) | CENTER (Kanji) | RIGHT (Vietnamese - normal)
        BOTTOM: Vietnamese expand
```

---

## UI Control Changes

### Indicators Control Group

New structure in the settings panel:

```
┌─ Indicators ─────────────────────┐
│ □ JLPT □ Grade □ Frequency       │
├──────────────────────────────────┤
│ □ Han-Viet □ Vietnamese □ English│
├──────────────────────────────────┤
│ Surround-Text Size: [====●======]│
│                      35% ← → 65% │
└──────────────────────────────────┘
```

**Changes from Current**:
- Move `Show Han-Viet Meanings` checkbox from separate section → into Indicators group
- Add `Show Vietnamese Meaning` checkbox → new, under indicators
- Add `Show English Meaning` checkbox → new, under indicators
- Move Size Slider → to bottom of indicators group

---

## Implementation Notes

### Font Size Calculations

For Board Mode (all zones use same size as Han-Viet):
```
baseSize = kanji_base * 0.25  // 25% of base kanji size
size = baseSize * (hanVietSize% / 100) * columnMultiplier
```

### Text Truncation Algorithm

```pseudo
function truncateToFit(text, maxWidth, font, fontSize):
  measureText(text) → currentWidth

  if currentWidth ≤ maxWidth:
    return text  // Fits as-is

  // Iteratively remove characters and append '..'
  for length from len(text)-1 down to 1:
    testText = text[0:length] + '..'
    if measureText(testText) ≤ maxWidth:
      return testText

  // Fallback: show just '..' if even 1 char + '..' doesn't fit
  return '..'
```

### Expansion Logic (Pseudo-code)

```pseudo
function calculateZoneAllocation(indicators, availableHeight):
  zones = {
    left: null,
    right: null,
    bottom: null
  }

  // Check what data we have
  hasEnglish = indicators.showEnglish && english.length > 0
  hasVietnamese = indicators.showVietnamese && vietnamese.length > 0
  hasHanViet = indicators.showHanViet && hanviet.length > 0

  // Priority allocation
  if hasEnglish:
    zones.left = 'ENGLISH'
    remaining = ['VIETNAMESE', 'HANVIET']
  else:
    remaining = ['VIETNAMESE', 'HANVIET']

  for indicator in remaining (by priority):
    if indicator has data:
      if 'VIETNAMESE' in remaining and hasVietnamese:
        zones.right = 'VIETNAMESE'
      if 'HANVIET' in remaining and hasHanViet:
        zones.bottom = 'HANVIET'

  // Distribute height based on filled zones
  if zones.left and zones.right:
    height.left = availableHeight / 2
    height.right = availableHeight / 2
  elif zones.left:
    height.left = availableHeight
  elif zones.right:
    height.right = availableHeight

  if zones.bottom:
    height.bottom = FIXED_BOTTOM_HEIGHT

  return zones
```

---

## Scope

**Applies To**: Board Mode only (PDF/PNG export)

**Not Affected**:
- Input Panel (separate layout)
- Sheet Mode (separate layout)

---

## Testing Checklist

- [ ] All indicators enabled with data → correct layout
- [ ] English enabled only → expands to center
- [ ] Vietnamese enabled only → expands to center
- [ ] HanViet enabled only → expands full width
- [ ] English + Vietnamese (no HanViet) → both sides
- [ ] English + HanViet (no Vietnamese) → left + bottom
- [ ] Vietnamese + HanViet (no English) → right + bottom
- [ ] Indicator enabled but NO data → space freed to cascade
- [ ] Text truncation with '..' appears correctly
- [ ] Size slider affects all three zones equally
- [ ] Column multipliers apply to all meaning text
- [ ] PDF export maintains layout
- [ ] PNG export maintains layout

---

## Future Enhancements

- [ ] Direction indicators (RTL support for Arabic meanings)
- [ ] Font family control per meaning type
- [ ] Color-coded meaning types
- [ ] Meaning search/copy functionality
