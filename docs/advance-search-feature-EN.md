# Advanced Search Feature - Kanji Query Language (KQL)

## 🚀 TLDR (Quick Reference)

**What it does**: Powerful kanji search with 53 categories, smart filters, and bulk actions.

**Quick Start**:
- 🔵 **Static Chips**: Click N5, N4, Top 100 ⭐, KOTY 2025 🏆 for instant filtering
- 🟢 **Rotating Chips**: 3 random categories change every 45 seconds (Food 🍱, Animals 🐕, etc.)
- 🟣 **All Categories**: Click "📂 All Categories" for 53 categories organized in 13 groups
- ✅ **Persistent Results**: Results stay visible after adding kanjis (green ✓ shows chosen ones)
- ➕ **Bulk Actions**: "Add All X ✚" button adds unique kanjis, shows duplicate count

**Search Examples**:
- `category:food` → 84 kanjis about food, ingredients, kitchen
- `category:animals` → 73 kanjis about animals, insects, birds, fish
- `jlpt:N5 & freq:<100` → Common N5 kanjis
- `category:food | category:animals` → Food OR animals (157 kanjis)

**Features**:
- 📊 200 results max (up from 50)
- 🎯 Smart duplicate detection
- 💬 Toast notifications (3-second auto-dismiss)
- 🔄 Manual clear with "Clear Results ×"

---

## Overview

The Advanced Search feature introduces **Kanji Query Language (KQL)**, a powerful query language that allows users to search for kanjis using field-specific prefixes, logical operators, comparison operators, and complex queries. This feature is designed for both beginners (via Quick Filters UI) and advanced users (via KQL syntax).

## User Interface

The search interface uses a **minimal inline design** for simplicity and efficiency:

### Search Box 🔍
- Single input field with auto-complete suggestions
- **Real-time syntax highlighting** with color-coded prefixes, operators, and values
- **Progressive error validation**:
  - Typing: No errors shown (non-intrusive)
  - On Blur: Syntax check with position indicator
  - On Enter: Full validation with popup warning
- **Visual error feedback**:
  - Red underline at error position
  - Warning popup with error details (auto-hide after 3s)
  - Shake animation only on execution
- Debounced execution (300ms) for performance
- Recent searches stored in localStorage (max 10)

### Quick Filter Chips ⚡

**Static Chips** (Always visible, blue background):
- **N5**: `jlpt:N5` - All N5 level kanjis
- **N4**: `jlpt:N4` - All N4 level kanjis
- **Top 100 ⭐**: `freq:<100` - 100 most frequent kanjis
- **KOTY 2025 🏆**: `freq:<21` - Top 20 most frequent kanjis (Kanji of the Year)

**Rotating Category Chips** (3 random chips, green background):
- Rotate every 45 seconds with weighted selection
- Beginner-friendly categories appear more often (Food 🍱, Animals 🐕, Family 👨‍👩‍👧)
- Medium priority: Body 🧑, Nature 🌲, Weather ⛅, Emotions 😊
- Lower priority: Construction 🏗️, Materials ⚙️, Philosophy 🤔
- Click any chip to search that category instantly
- Smart randomization ensures variety

**Category Browser Button** (Purple background):
- **📂 All Categories**: Opens full modal with all 53 categories
- Organized into 13 hierarchical groups:
  * Beginner Friendly (8), Daily Life (7), Nature & Places (4)
  * Verbs & Adjectives (6), Work & Education (4), Communication & Media (3)
  * Social & Politics (5), Abstract Concepts (5), Transportation & Travel (2)
  * Culture & Entertainment (3), Buildings & Construction (2), Health & Medical (1), Materials & Measurement (2)
- Multi-select checkboxes with individual kanji counts
- Live preview: "X categories selected → Y kanjis"
- Select All / Clear All bulk actions
- Generates OR query: `category:food | category:animals | ...`

### Search Results Features

**Persistent Results**:
- Results stay visible after adding kanjis (no auto-clear)
- Green ✓ checkmark overlay shows already-chosen kanjis
- Visual feedback prevents duplicate additions

**Bulk Actions**:
- **Add All X ✚** button (green): Adds all unique kanjis from results
- Smart duplicate detection: Filters out already-chosen kanjis
- Summary toast: "Added 80 kanjis (4 already chosen)" or "Added 80 kanjis"
- **Clear Results ×** button (gray): Manually dismiss results

**Result Limit**: 
- Displays top 200 results (increased from 50)
- Results header shows: "Showing top 200 results"

**Toast Notifications**:
- Green checkmark icon with message
- Fixed position (bottom-right corner)
- Auto-dismiss after 3 seconds
- Examples: "Added 水", "Added 80 kanjis (4 already chosen)"

### Category System

**53 Real Categories** organized into meaningful groups:
- Food 🍱, Animals 🐕, Family 👨‍👩‍👧, Numbers ⏰, Colors 🎨
- Body 🧑, Nature 🌲, Weather ⛅, Eating 🍽️, Home 🏠
- Emotions 😊, Basic Verbs 🏃, Directions 🧭, Transport 🚗
- And 39 more specialized categories...

**Category Search Syntax**:
- Prefix: `category:` or `cat:`
- Example: `category:food-ingredients-kitchen` → 84 kanjis
- Partial matching: `category:food` matches "food-ingredients-kitchen"
- OR queries: `category:food | category:animals` → 157 kanjis
- AND queries: `category:animals & jlpt:N5` → N5 animal kanjis

### Saved Queries
- Save button (💾) to store current query
- Load button (📚) to access saved queries
- Maximum 10 saved queries (localStorage)
- Custom names for each saved query
- Quick delete functionality

## KQL Syntax

### Field Prefixes

Search specific fields using prefixes:

| Prefix | Alias | Field | Example |
|--------|-------|-------|---------|
| `char:` | `kanji:` | Kanji character | `char:行` |
| `hanviet:` | `hv:` | Han-Viet reading | `hanviet:HÀNH` |
| `en:` | `english:` | English meaning | `en:"to go"` |
| `vn:` | `vietnamese:` | Vietnamese meaning | `vn:đi` |
| `on:` | `onyomi:` | Onyomi reading | `on:コウ` |
| `kun:` | `kunyomi:` | Kunyomi reading | `kun:い` |
| `cat:` | `category:` | Category | `cat:food` |
| `com:` | `component:` | Component/radical | `com:行` |
| `jlpt:` | - | JLPT level | `jlpt:N5` |
| `freq:` | `frequency:` | Frequency rank | `freq:<100` |

**Default Search**: If no prefix is specified, KQL searches across `kanji`, `sinoViet`, `meaning`, and `vietnameseMeaning` fields.

### Logical Operators

Combine multiple conditions:

| Operator | Alias | Description | Example |
|----------|-------|-------------|---------|
| `AND` | `&` | Both conditions must be true | `jlpt:N5 AND freq:<500` |
| `OR` | <code>&#124;</code> | At least one condition must be true | `jlpt:N5 OR jlpt:N4` |
| `NOT` | `!` | Exclude results matching condition | `NOT jlpt:N5` |
| `( )` | - | Group conditions for complex logic | `(jlpt:N5 OR jlpt:N4) AND freq:<500` |

### Comparison Operators

Use with `freq:` and `jlpt:` prefixes:

| Operator | Description | Example |
|----------|-------------|---------|
| `<` | Less than | `freq:<100` or `jlpt:<N3` |
| `>` | Greater than | `freq:>1000` or `jlpt:>N3` |
| `<=` | Less than or equal to | `freq:<=500` or `jlpt:<=N4` |
| `>=` | Greater than or equal to | `freq:>=100` or `jlpt:>=N2` |
| `min-max` | Range (inclusive) | `freq:100-500` |

**JLPT Level Ordering**: N5 (easiest) < N4 < N3 < N2 < N1 (hardest)
- `jlpt:>N3` returns N2 and N1 kanji (more advanced)
- `jlpt:<N3` returns N4 and N5 kanji (easier)

### Special Features

- **Exact Match**: Use double quotes for exact phrase matching: `en:"to go"`
- **Case-Insensitive**: All searches are case-insensitive (except inside quotes)
- **Auto-complete**: Press `Tab` or `Enter` to accept suggestions
- **Keyboard Navigation**: `↑↓` to navigate suggestions, `Esc` to close
- **Result Limit**: Returns top 50 most relevant results

## Example Queries

### Beginner Examples

```kql
# Find all N5 kanjis
jlpt:N5

# Find kanjis with Han-Viet reading "HÀNH"
hanviet:HÀNH

# Find very common kanjis (frequency rank ≤ 100)
freq:<=100

# Find kanjis meaning "to go"
en:"to go"

# Find all food-related kanjis (84 results)
category:food

# Find all animal-related kanjis (73 results)
category:animals
```

### Intermediate Examples

```kql
# Common N5 kanjis
jlpt:N5 AND freq:<500

# N5 or N4 kanjis with onyomi reading "コウ"
(jlpt:N5 OR jlpt:N4) AND on:コウ

# Kanjis with frequency between 100-500
freq:100-500

# Food or animal kanjis (157 results)
category:food | category:animals

# N5 kanjis in nature category
jlpt:N5 & category:nature

# Advanced level kanjis (N2 or harder)
jlpt:>=N2
```

### Advanced Examples

```kql
# Common kanjis that are NOT in N5
freq:<500 AND NOT jlpt:N5

# N3 kanjis containing component "行"
jlpt:N3 AND com:行

# Kanjis with either HÀNH or HẠNH reading
hanviet:HÀNH OR hanviet:HẠNH

# Comprehensive beginner pack
(jlpt:N5 OR jlpt:N4) AND freq:<=800

# Challenging N3 kanjis
jlpt:N3 AND freq:>1000

# All beginner-friendly kanjis (N4 and N5)
jlpt:<=N4

# Advanced kanjis with specific component
jlpt:>N3 AND com:行

# Multiple categories combined with JLPT filter
(category:food | category:animals | category:nature) & jlpt:N5

# Daily life categories at beginner level
(category:eating | category:home | category:family) & jlpt:<=N4
```

## Implementation Architecture

### Parser Pipeline

1. **Tokenizer** (`KQLTokenizer`): Converts query string into tokens
   - Recognizes prefixes, operators, quoted strings, numbers, ranges
   - Handles special characters: `()`, `&`, `|`, `!`, `<`, `>`, `"`
   - Position tracking for error reporting

2. **Parser** (`KQLParser`): Builds Abstract Syntax Tree (AST)
   - Recursive descent parser
   - Operator precedence: `()` > `NOT` > `AND` > `OR`
   - Error collection with position and context

3. **Evaluator** (`KQLEvaluator`): Executes AST against kanji data
   - Tree traversal with short-circuit evaluation
   - Field-specific matching (exact/contains, arrays, numbers)
   - Result limiting (top 50)

### Data Flow

```
User Input → Tokenizer → Parser → AST → Evaluator → Results
              ↓            ↓                         ↓
           Tokens      Errors               Filtered Kanjis
```

### State Management

- **Search State**: Local state in `SearchTab` component
  - Query string
  - Suggestions array
  - Error array
  - Recent searches (persisted to localStorage)

- **Kanji State**: Redux `kanjiSlice`
  - `allKanjis`: Full kanji dataset from IndexedDB
  - `chosenKanjis`: User's selected kanjis

- **UI State**: Local state in `TabSearch` component
  - Active tab
  - Search results
  - Toast messages

## Field Mapping

KQL prefixes map to `KanjiData` interface fields:

| KQL Prefix | TypeScript Field | JSON Field | Type |
|------------|------------------|------------|------|
| `char:` | `kanji` | `character` | `string` |
| `hanviet:` | `sinoViet` | `han-viet` | `string` |
| `en:` | `meaning` | `english-meaning` | `string` |
| `vn:` | `vietnameseMeaning` | `vietnamese-meaning` | `string` |
| `on:` | `onyomi` | `onyomi` | `string[]` |
| `kun:` | `kunyomi` | `kunyomi` | `string[]` |
| `cat:` | `category` | `category` | `string[]` (supports partial matching) |
| `com:` | `components` | `components` | `string` |
| `jlpt:` | `jlptLevel` | `jlpt-level` | `string` (supports comparison operators) |
| `freq:` | `frequency` | `frequency` | `number` (supports comparison operators) |

**Note**: Data transformation from JSON kebab-case to TypeScript camelCase happens in `src/db/indexedDB.ts` during the `seedKanjisFromJSON` function.

## Performance Considerations

### Optimization Strategies

1. **Debounced Execution**: 300ms delay after user stops typing
2. **Result Limiting**: Top 200 results only (increased from 50)
3. **Query Caching**: Recent searches cached in localStorage
4. **Short-Circuit Evaluation**: `AND`/`OR` operators stop early when possible
5. **Memoization**: `useMemo` for expensive calculations in React components
6. **Smart Duplicate Detection**: Set-based filtering for bulk actions
7. **Weighted Rotation**: Category chips use efficient weighted pool algorithm

### Memory Management

- **Recent Searches**: Max 10 ite200 items (increased from 50)
- **Category Chips**: 3 rotating chips with 45-second refresh-truncate oldest)
- **Saved Queries**: Max 10 items (enforced at save time)
- **Search Results**: Limited to 50 items
- **LocalStorage Usage**: ~1-2 KB for search history

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **IndexedDB**: Required for kanji data storage
- **LocalStorage**: Required for search history/saved queries
- **ES6+ Features**: Optional chaining, nullish coalescing, arrow functions

## Future Enhancements

### Planned Features

1. **Preset Queries**: Load pre-defined queries from `public/kql/presets.json`
2. **Query Builder UI**: Visual query construction (drag-and-drop)
3. **Regex Support**: Pattern matching in text fields
4. **Fuzzy Search**: Approximate matching for typos
5. **Search History Analytics**: Most used prefixes/operators
6. **Export Search Results**: CSV/JSON export of filtered kanjis
7. **Shared Queries**: URL parameter encoding for sharing queries

### Potential Improvements

- **Syntax Highlighting**: Full syntax highlighting (currently basic)
- **Performance**: Web Worker for parsing large queries
- **Accessibility**: ARIA labels, keyboard-only navigation
- **Mobile UX**: Swipe gestures, haptic feedback
- **Internationalization**: Multi-language UI (postponed i18n feature)

## Testing

### Unit Tests

```bash
npm test -- kqlParser.test.ts
```

Test coverage includes:
- Tokenizer: All token types, error cases
- Parser: Operator precedence, grouping, errors
- Evaluator: All comparison operators, field matching

### E2E Tests

```bash
npm run test:e2e -- advanced-search.spec.ts
```

Test scenarios:
- Tab navigation
- Query execution
- Auto-complete
- Saved queries
- Error handling

## Troubleshooting

### Common Issues

**Q: Auto-complete not working**
- Ensure cursor is at end of word
- Check for syntax errors (red underline)
- Try typing prefix followed by colon (e.g., `han:`)

**Q: No results found**
- Verify JLPT level format (N5, not n5 or N-5)
- Check comparison operators (use `<` not `less than`)
- Try broadening search (remove some conditions)

**Q: Saved queries disappeared**
- Check localStorage quota (browser limit: ~5MB)
- Clear browser cache may delete saved queries
- Export important queries to text file

**Q: Slow performance**
- Reduce result count by adding more filters
- Clear recent searches (localStorage cleanup)
- Check browser console for errors

## See Also

- [Project Requirements](./project-requirements.md) - Original feature request
- [UI Options Document](./20251227-advanced-search-ui-options.md) - Design alternatives
- [KQL Parser Source](../src/utils/kqlParser.ts) - Implementation details
- [Search Tab Source](../src/features/search/SearchTab.tsx) - Main UI component
