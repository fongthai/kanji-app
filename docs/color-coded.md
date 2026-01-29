# Color-Coding System

## Overview
The Kanji Worksheet Generator uses a comprehensive color-coding system across all display modes to provide visual consistency and pedagogical value. Colors are applied differently depending on the context:

1. **Input Panel** - Random basic colors for organization
2. **Main Panel (Board/Sheet modes)** - JLPT badge colors for learning
3. **Export Media (PDF/PNG)** - Same as Main Panel for consistency

---

## Input Panel Color System

### Section Color Pairs
Sections in the Input Panel use a deterministic cycling algorithm through 30 professional color pairs. Each pair consists of:
- **SectionHeader**: Darker color for section header background
- **SectionArea**: Lighter shade for kanji card backgrounds

The system cycles through these 30 pairs in order:

| # | Color Name | Section Header | Section Area | Use Case |
|---|------------|----------------|--------------|----------|
| 1 | Off-Black | `#121212` | `#1E1E1E` | Header background / Card background |
| 2 | Obsidian | `#1A1A1B` | `#282829` | Header background / Card background |
| 3 | Midnight | `#191970` | `#2D2D8A` | Header background / Card background |
| 4 | Deep Navy | `#011627` | `#0A2E47` | Header background / Card background |
| 5 | Charcoal | `#1E1E1E` | `#2C2C2C` | Header background / Card background |
| 6 | Prussian | `#003153` | `#004B7D` | Header background / Card background |
| 7 | Deep Maroon | `#4B0000` | `#6B1A1A` | Header background / Card background |
| 8 | Gunmetal | `#2C3E50` | `#3E5871` | Header background / Card background |
| 9 | Forest | `#0B3D0B` | `#185C18` | Header background / Card background |
| 10 | Eggplant | `#311B92` | `#4A31C1` | Header background / Card background |
| 11 | Oxford Blue | `#002147` | `#003B7F` | Header background / Card background |
| 12 | Slate Grey | `#2F4F4F` | `#446E6E` | Header background / Card background |
| 13 | Indigo | `#3F51B5` | `#5C6BC0` | Header background / Card background |
| 14 | Deep Teal | `#004D40` | `#00796B` | Header background / Card background |
| 15 | Burgundy | `#800020` | `#A51C30` | Header background / Card background |
| 16 | Chocolate | `#3E2723` | `#5D4037` | Header background / Card background |
| 17 | Royal Blue | `#002366` | `#003DA5` | Header background / Card background |
| 18 | Space Grey | `#34495E` | `#496582` | Header background / Card background |
| 19 | Plum | `#4A148C` | `#7B1FA2` | Header background / Card background |
| 20 | Espresso | `#4E342E` | `#6D4C41` | Header background / Card background |
| 21 | Pine Green | `#01579B` | `#0277BD` | Header background / Card background |
| 22 | Graphite | `#455A64` | `#607D8B` | Header background / Card background |
| 23 | Violet | `#6200EE` | `#7C4DFF` | Header background / Card background |
| 24 | Crimson | `#B71C1C` | `#D32F2F` | Header background / Card background |
| 25 | Saddle | `#8B4513` | `#A0522D` | Header background / Card background |
| 26 | Cobalt | `#0047AB` | `#005FD3` | Header background / Card background |
| 27 | Olive Drab | `#556B2F` | `#6B8E23` | Header background / Card background |
| 28 | Burnt Orange | `#BF360C` | `#E64A19` | Header background / Card background |
| 29 | Slate Blue | `#6A5ACD` | `#836FFF` | Header background / Card background |
| 30 | Amethyst | `#9932CC` | `#BA55D3` | Header background / Card background |

**Color Assignment Algorithm:**
```typescript
const getSectionColor = (index: number) => {
  const colorPair = SECTION_COLOR_PAIRS[index % SECTION_COLOR_PAIRS.length];
  
  return {
    header: colorPair.header,    // Dark color for section header
    body: colorPair.area,         // Lighter color for kanji cards
    border: colorPair.header,     // Dark color for card borders
    chosenBorder: '#FFFFFF',      // White border in Chosen Kanjis section
    text: '#FFFFFF',              // White text for kanji
  };
};
```

### Visual Hierarchy
The color pair system creates a professional nested visual hierarchy:
- **Section Header**: Dark color (SectionHeader) provides strong contrast
- **Card Background**: Lighter shade (SectionArea) creates depth
- **Card Border**: Same dark color (SectionHeader) frames each card
- **Chosen Border**: White (`#FFFFFF`) makes selected cards stand out
- **Kanji Text**: White (`#FFFFFF`) ensures readability on all backgrounds

---

## Main Panel Color System (Board & Sheet Modes)

### Kanji Text Colors
Kanji text in the Main Panel uses **JLPT badge colors** to provide pedagogical value - students can visually identify difficulty levels:

| JLPT Level | Color | Hex Code | Purpose |
|------------|-------|----------|---------|
| N5 | Red | `#E53E3E` | Beginner level |
| N4 | Orange | `#DD6B20` | Elementary level |
| N3 | Green | `#38A169` | Intermediate level |
| N2 | Blue | `#3182CE` | Upper-Intermediate level |
| N1 | Violet | `#805AD5` | Advanced level |
| Unknown | Black | `#000000` | Default fallback |

**Implementation:**
```typescript
export function getKanjiColorByJlptLevel(jlptLevel: string | undefined): string {
  if (!jlptLevel) return '#000000';
  const normalizedLevel = jlptLevel.toUpperCase().replace(/-ORG$/i, '');
  return JLPT_COLORS[normalizedLevel] || '#000000';
}
```

### Grayscale Override
When **grayscale mode** is enabled:
- All kanji text becomes **black (`#000000`)**
- Section colors remain unchanged in Input Panel
- JLPT color coding is temporarily disabled in Main Panel

---

## Export Media Color System (PDF & PNG)

### PDF Export
PDF exports use the same color system as the Main Panel:
- **Kanji text**: JLPT badge colors
- **Han-Viet text**: Black (`#000000`)
- **Card background**: White (`#ffffff`)
- **Card border**: Dark gray (`#333333`)

**Implementation in PDFKanjiCard:**
```typescript
kanji: {
  fontSize: kanjiFontSize,
  fontFamily: kanjiFont,
  textAlign: 'center',
  color: getKanjiColorByJlptLevel(kanji.jlptLevel),
}
```

### PNG Export
PNG exports are generated from PDF, so they maintain identical colors:
- **Kanji text**: JLPT badge colors (same as PDF)
- All other elements: Same as PDF

---

### Implementation Files

### Color Constants
**File:** `src/constants/indicators.ts`
- `SECTION_COLOR_PAIRS` - Array of 30 professional color pairs (header + area)
- `JLPT_COLORS` - Map of JLPT levels to badge colors
- `getKanjiColorByJlptLevel()` - Helper function for color retrieval

### Screen Components
**File:** `src/features/inputPanel/InputPanel.tsx`
- `getSectionColor(index)` - Deterministic section color assignment
- Kanji text always white (`#FFFFFF`)

**File:** `src/components/screen/BoardGrid.tsx`
- Uses `getKanjiColorByJlptLevel()` for kanji text
- Applies grayscale override when enabled

**File:** `src/components/screen/KanjiCard.tsx`
- Receives colors via props: `colors.text`
- Renders with provided color

### PDF Components
**File:** `src/components/pdf/PDFKanjiCard.tsx`
- Uses `getKanjiColorByJlptLevel()` for kanji text
- Consistent with screen display

---

## Pedagogical Benefits

1. **Visual Learning**: Students associate colors with difficulty levels
2. **Progress Tracking**: Color distribution shows learning progression
3. **Quick Recognition**: Identify JLPT levels at a glance
4. **Consistency**: Same colors across screen and printed materials
5. **Organization**: Input Panel colors help distinguish between sections

---

## Technical Notes

### Why Professional Color Pairs?
- **Visual hierarchy**: Dark headers + lighter card backgrounds create depth
- **High contrast**: Dark borders frame each card professionally
- **Print-friendly**: Sophisticated colors reproduce well at 300 DPI
- **Deterministic**: Same section always gets same color pair (based on index)
- **Professional appearance**: Refined palette suitable for educational materials
- **30 pairs**: More than enough for typical use (rarely exceed 30 JSON files)

### Why JLPT Badge Colors?
- **Pedagogical standard**: Matches common JLPT study materials
- **Color psychology**: Red (easy) → Violet (hard) progression
- **Accessibility**: High contrast colors work for most users
- **Consistency**: Badge colors already familiar to users

### Color Cycling Algorithm
```typescript
// Section at index 0 → SECTION_COLOR_PAIRS[0] → Off-Black (header: #121212, area: #1E1E1E)
// Section at index 29 → SECTION_COLOR_PAIRS[29] → Amethyst (header: #9932CC, area: #BA55D3)
// Section at index 30 → SECTION_COLOR_PAIRS[0] → Off-Black [wraps around]
const colorIndex = index % 30;
```

---

## Future Considerations

- **Custom color themes**: Allow users to override JLPT colors
- **Colorblind modes**: Alternative color schemes for accessibility
- **Dark mode**: Inverted color scheme for night usage
- **Grade-level colors**: Option to use grade-level colors instead of JLPT
