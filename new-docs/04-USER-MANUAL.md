# Kanji App - User Manual & Help Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Selecting Kanji](#selecting-kanji)
4. [Quiz Mode Guide](#quiz-mode-guide)
5. [Sheet Mode Guide](#sheet-mode-guide)
6. [Board Mode Guide](#board-mode-guide)
7. [Advanced Search (KQL)](#advanced-search-kql)
8. [Exporting Your Work](#exporting-your-work)
9. [Customization Options](#customization-options)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Launch

1. **Open the Application**
   - Navigate to the application URL in your web browser
   - Recommended browsers: Chrome, Firefox, Edge, Safari (latest versions)

2. **Initial Data Load**
   - On first launch, the app downloads 2000+ kanji characters
   - This process takes ~5 seconds
   - You'll see a loading indicator
   - Data is stored locally (IndexedDB) for future use

3. **Choose Your Language**
   - Click the language switcher in the top-right corner
   - Available languages: English (EN), Vietnamese (VI)
   - Your preference is saved automatically

### System Requirements

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- IndexedDB enabled (for kanji storage)
- Minimum screen width: 320px (mobile-first design)
- ~10 MB available storage for kanji database

---

## Interface Overview

### Three-Panel Layout (Desktop)

```
┌──────────────┬──────────────────┬──────────────┐
│              │                  │              │
│ Input Panel  │    Main View     │ Control Panel│
│              │                  │              │
│ - Search     │ - Sheet Mode     │ - Settings   │
│ - Browse     │ - Board Mode     │ - Export     │
│ - Chosen     │ - Quiz Mode      │ - Display    │
│              │                  │              │
└──────────────┴──────────────────┴──────────────┘
```

**Left: Input Panel** (20-35% width)
- Search kanji using advanced KQL
- Browse by JLPT level or category
- View and manage chosen kanji
- Drag-and-drop reordering

**Center: Main View** (Flexible width)
- Displays current mode (Sheet/Board/Quiz)
- Preview what will be exported
- Page navigation
- WYSIWYG display

**Right: Control Panel** (20-35% width)
- Mode selector (Sheet/Board/Quiz)
- Display settings (fonts, sizes, indicators)
- Layout settings (columns, spacing)
- Export button (PDF/PNG)

### Mobile Layout (<768px)

On mobile devices, the interface uses a **tab-based layout**:

```
┌───────────────────────────┐
│  [Input] [Main] [Control] │ ← Tabs
├───────────────────────────┤
│                           │
│   Active Tab Content      │
│   (Swipe left/right)      │
│                           │
└───────────────────────────┘
```

Swipe gestures:
- Swipe left: Next tab
- Swipe right: Previous tab

---

## Selecting Kanji

### Method 1: Quick Browse

1. **Open Input Panel** (left sidebar or first tab on mobile)
2. **Browse by JLPT Level**
   - Click "N5", "N4", "N3", "N2", or "N1" buttons
   - Kanji list updates to show only that level
3. **Click Kanji Card** to add to chosen list
4. **Click Again** to remove from chosen list

### Method 2: Category Filter

1. **Open Quick Filters Tab** (in Input Panel)
2. **Select Category**
   - Numbers & Time
   - Verbs
   - Adjectives
   - Body & Health
   - Food & Kitchen
   - Animals & Nature
   - Geography & Places
   - Education & Learning
   - Family & People
   - Occupations & Jobs
   - ...and 60+ more categories
3. **Click Kanji** to add to chosen list

### Method 3: Advanced Search (KQL)

1. **Open Search Tab** (in Input Panel)
2. **Type Query** (see [Advanced Search](#advanced-search-kql) section)
3. **View Results** (top 50 matches)
4. **Click Kanji** to add to chosen list

### Managing Chosen Kanji

**View Chosen Kanji**:
- Scroll to "Chosen Kanjis" section at top of Input Panel
- Shows count: "Chosen Kanjis (12)"

**Reorder Kanji**:
- Drag kanji cards up/down to reorder
- Order affects display in Sheet/Board modes

**Remove Kanji**:
- Click kanji card again to deselect
- Or click "×" button on chosen kanji card

**Clear All**:
- Click "Clear All" button in Chosen Kanjis section

---

## Quiz Mode Guide

### What is Quiz Mode?

Interactive testing system for kanji knowledge assessment. Features multiple-choice questions, time limits, scoring, and detailed review.

### Starting a Quiz

1. **Select Kanji** (optional)
   - If no kanji selected: Quiz uses all kanji from chosen level
   - If kanji selected: Quiz uses only chosen kanji

2. **Switch to Quiz Mode**
   - Click "Quiz" button in Control Panel (or Main tab on mobile)
   - Quiz settings screen appears

3. **Configure Quiz**

   **Question Type** (6 options):
   - Kanji → Hán Việt (most common)
   - Hán Việt → Kanji
   - Kanji → Meaning (English/Vietnamese)
   - Kanji → Onyomi
   - Onyomi → Kanji
   - Meaning → Kanji

   **Number Selection**:
   - All: Use all available kanji
   - Random 10/20/30/50/100: Randomly select N kanji

   **Level Filter**:
   - JLPT: N5, N4, N3, N2, N1
   - Grade: 1-12 (Japanese school grades)

   **Question Order**:
   - Sequential: In order of selection
   - Random: Shuffled questions

   **Time Limit**:
   - 10 seconds per question
   - 30 seconds per question
   - 60 seconds per question
   - Unlimited (no timer)

   **Ask Fields** (Multi-select):
   - When showing kanji, display additional fields:
     - Hán Việt
     - Onyomi
     - Kunyomi
     - Meaning
     - Components

4. **Click "Start Quiz"**

### Taking a Quiz

**Quiz Interface**:
```
┌─────────────────────────────────┐
│ Question 1/20          ⏱️ 00:28 │
├─────────────────────────────────┤
│                                 │
│        日 (N5)                  │
│        What is the Hán Việt?    │
│                                 │
│  [A] NGUYỆT                     │
│  [B] NHẬT  ← Your answer        │
│  [C] HỎA                        │
│  [D] THỦY                       │
│                                 │
│        [Next Question]          │
└─────────────────────────────────┘
```

**Controls**:
- Click answer (A, B, C, or D)
- Or press keyboard: 1, 2, 3, 4
- Click "Next Question" or press Enter
- Click "Pause" to pause timer
- Click "Quit & Calculate" to end early

**During Quiz**:
- Timer counts down (if time limit set)
- Answer immediately locks in
- Progress bar shows completion
- Can pause/resume anytime

### Reviewing Results

After finishing, you'll see:

**Score Summary**:
```
┌─────────────────────────────────┐
│     Quiz Results                │
├─────────────────────────────────┤
│ Score: 8.5/10                   │
│ Percentage: 85%                 │
│ Correct: 17/20                  │
│ Time: 4m 32s                    │
└─────────────────────────────────┘
```

**Question-by-Question Review**:
- See each question
- Your answer vs. correct answer
- Time spent per question
- Green checkmark (✓) for correct
- Red X (✗) for incorrect

**Action Buttons**:
- **Retake**: Same settings, new questions
- **New Quiz**: Back to settings screen
- **View History**: See last 50 quizzes

### Quiz History

**Access History**:
- Click "History" button in Quiz Mode
- Shows last 50 quizzes (oldest auto-deleted)

**History Details**:
- Date & time taken
- Score (0-10 scale)
- Percentage (0-100%)
- Question type
- Number of questions
- Time limit
- Total time spent

**Actions**:
- Click quiz to view detailed review
- Delete individual quiz results
- Clear all history

---

## Sheet Mode Guide

### What is Sheet Mode?

Generate traditional kanji writing practice sheets with master cells and guided practice cells. Perfect for handwriting drills and homework assignments.

### Setting Up Your Worksheet

1. **Select Kanji** (required)
   - Choose kanji using Input Panel
   - At least 1 kanji required

2. **Switch to Sheet Mode**
   - Click "Sheet" button in Control Panel
   - Main View shows sheet preview

3. **Configure Layout** (in Control Panel)

   **Column Count** (4-13, default: 13):
   - Number of practice cells per kanji
   - More columns = smaller cells
   - Fewer columns = larger cells

   **Master Kanji Size** (70-110%, default: 110%):
   - Size of the model kanji (master cell)
   - Larger = easier to see details

   **Show Hán Việt**:
   - Display Hán Việt reading above kanji
   - Toggle ON/OFF

   **Show Indicators**:
   - Display JLPT level badge (N5-N1)
   - Display Grade level badge (1-12)
   - Display Frequency badge (1-2500)

   **Guide Opacity** (0-100%, default: 50%):
   - Opacity of guide lines in practice cells
   - Higher = more visible
   - Lower = less distracting

   **Tracing Cells** (first 3 cells):
   - Cell 1: 40% opacity (most visible)
   - Cell 2: 25% opacity
   - Cell 3: 15% opacity (faintest)

4. **Configure Metadata** (in Display Settings)

   **Explanation Text** (1-3 lines):
   - **Line 1**: Kanji | JLPT | Hán Việt | Onyomi | Kunyomi | Components
   - **Line 2**: English Meaning | Vietnamese Meaning
   - **Line 3**: Vietnamese Mnemonics

   Toggle each line ON/OFF as needed.

### Sheet Layout Structure

Each kanji gets one "outer table":

```
┌─────────────────────────────────────────────┐
│ Explanation Text (1-3 lines)               │
│ 日 | N5 | NHẬT | ニチ, ジツ | ひ, -び | 日 │
│ day, sun, Japan | ngày, mặt trời, Nhật Bản │
│ Hình ảnh mặt trời...                        │
├─────────────────────────────────────────────┤
│ Writing Table                               │
│ ┌────────┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐      │
│ │        │█│▓│░│ │ │ │ │ │ │ │ │ │ │      │
│ │  日    │日│日│日│+│+│+│+│+│+│+│+│+│+│      │
│ │ Master │ │ │ │ │ │ │ │ │ │ │ │ │ │      │
│ │  Cell  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤      │
│ │ (2×2)  │+│+│+│+│+│+│+│+│+│+│+│+│+│      │
│ └────────┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘      │
└─────────────────────────────────────────────┘

Legend:
█ = 40% opacity kanji (first guide cell)
▓ = 25% opacity kanji (second guide cell)
░ = 15% opacity kanji (third guide cell)
+ = Guide lines only (cross + center square)
```

**Master Cell**:
- 2×2 size (4x larger than practice cells)
- Shows model kanji
- High contrast, clear strokes

**Practice Cells**:
- Square cells with guide lines:
  - 1 vertical center line
  - 1 horizontal center line
  - 1 small square (1/4 size) in center
- First 3 cells: Kanji with decreasing opacity
- Remaining cells: Guide lines only

### Navigating Pages

**Page Navigation** (bottom of Main View):
- "◀ Previous" button
- Page indicator: "Page 1 of 3"
- "Next ▶" button

**Auto-Pagination**:
- App calculates how many tables fit per A4 page
- Based on column count and metadata lines
- Automatic page breaks

### Previewing Before Export

**WYSIWYG Preview**:
- What you see on screen = what you get in PDF/PNG
- Zoom out browser to see full page (Ctrl/Cmd + -)
- Zoom in to check details (Ctrl/Cmd + +)

**Check Before Export**:
- ✓ All kanji displayed correctly
- ✓ Metadata complete and accurate
- ✓ Guide lines visible but not overpowering
- ✓ Master kanji clear and legible
- ✓ Page breaks in logical places

---

## Board Mode Guide

### What is Board Mode?

Display chosen kanjis in a responsive grid for flashcard-style review and high-quality printing. Perfect for reference sheets, study guides, and classroom posters.

### Setting Up Your Board

1. **Select Kanji** (required)
   - Choose kanji using Input Panel
   - At least 1 kanji required

2. **Switch to Board Mode**
   - Click "Board" button in Control Panel
   - Main View shows grid preview

3. **Configure Layout** (in Control Panel)

   **Column Count** (4-16, default: 6):
   - Number of columns in grid
   - More columns = smaller cards
   - Fewer columns = larger cards

   **Empty Cells Mode**:
   - **Hide**: No empty cells shown
   - **Fill Page**: Fill entire page with empty cells
   - **Fill Row**: Fill only last row with empty cells

   **Show Header**:
   - Display custom header text at top
   - Header font selection (5 options)
   - Header animation style (5 styles):
     - Gradient Shimmer
     - Wave
     - Holographic
     - Sparkle
     - Neon Glow

   **Show Footer**:
   - Display page numbers at bottom
   - Format: "Page 1 of 3"
   - Includes timestamp

   **Center Card**:
   - Center kanji in grid cell
   - Toggle ON/OFF

4. **Configure Card Display** (in Display Settings)

   **Kanji Font** (5 options):
   - KanjiStrokeOrders
   - Noto Serif JP
   - Noto Sans JP
   - Meiryo
   - MS Gothic

   **Kanji Size** (60-120%, default: 100%):
   - Larger = bigger kanji in cards

   **Hán Việt Display**:
   - Show/hide Hán Việt reading
   - Orientation: Vertical or Horizontal
   - Font selection
   - Size: 35-65%

   **Indicators**:
   - JLPT level badge (N5=green, N4=blue, N3=yellow, N2=orange, N1=red)
   - Grade level badge (1-12)
   - Frequency badge (1-2500)
   - Toggle each ON/OFF

### Board Layout Structure

```
┌─────────────────────────────────────────────┐
│        Custom Header Text                   │ ← Header (optional)
│       (with animation style)                │
├───────┬───────┬───────┬───────┬───────┬─────┤
│   日  │   月  │   火  │   水  │   木  │  金 │
│ NHẬT │NGUYỆT │  HỎA  │ THỦY  │  MỘC  │ KIM │
│  N5   │  N5   │  N5   │  N5   │  N5   │  N5 │
├───────┼───────┼───────┼───────┼───────┼─────┤
│   土  │   人  │   山  │   川  │   田  │  力 │
│  THỔ │ NHÂN  │  SƠN  │XUYÊN  │ĐIỀN  │ LỰC │
│  N5   │  N5   │  N5   │  N5   │  N5   │  N5 │
├───────┼───────┼───────┼───────┼───────┼─────┤
│  ...  │  ...  │  ...  │  ...  │  ...  │ ... │
└───────┴───────┴───────┴───────┴───────┴─────┘
              Page 1 of 3                       ← Footer (optional)
```

**Grid Features**:
- Responsive: Always fits A4 in viewport
- Square cards: Uniform size
- Automatic pagination
- Color-coded JLPT badges

### Using Empty Cells

**Why Empty Cells?**
- Space for students to add their own kanji
- Practice writing blank cells
- Complete the page layout

**Empty Cells Modes**:

1. **Hide** (default):
   - No empty cells
   - Compact layout
   - Best for reference sheets

2. **Fill Page**:
   - Fill entire page with empty cells
   - Best for worksheets
   - Students can fill in blanks

3. **Fill Row**:
   - Fill only last row
   - Balanced layout
   - Clean appearance

### Customizing Header

1. **Enable Header**:
   - Toggle "Show Header" ON

2. **Enter Text**:
   - Click header text field
   - Type custom text (e.g., "N5 Kanji - Week 1", "食べ物 (Food)")
   - Text appears at top of each page

3. **Choose Font**:
   - 5 header font options
   - Preview updates immediately

4. **Choose Animation** (5 styles):
   - **Gradient Shimmer**: Smooth color gradient
   - **Wave**: Wavy animation
   - **Holographic**: Rainbow effect
   - **Sparkle**: Glitter effect
   - **Neon Glow**: Glowing outline

---

## Advanced Search (KQL)

### What is KQL?

**Kanji Query Language** is a powerful search syntax for finding kanji based on multiple criteria. Combine fields, operators, and comparisons to create complex queries.

### Quick Start

**Simple Queries** (no operators):
```
jlpt:N5              # All N5 kanji
hanviet:NHẬT        # Kanji with NHẬT reading
en:sun              # Kanji meaning "sun" in English
vn:mặt trời         # Kanji meaning "mặt trời" in Vietnamese
```

**Combined Queries** (with operators):
```
jlpt:N5 AND hanviet:HÀNH       # N5 kanji with HÀNH reading
on:コウ OR on:ゴウ             # Kanji with コウ or ゴウ onyomi
jlpt:N5 AND NOT freq:>1000     # N5 kanji, common only (<1000)
```

### Field Prefixes

| Prefix | Field | Example | Matches |
|--------|-------|---------|---------|
| `char:` | Kanji character | `char:日` | 日 |
| `hanviet:` | Hán Việt reading | `hanviet:NHẬT` | NHẬT, NHỰT |
| `en:` | English meaning | `en:sun` | "day, sun, Japan" |
| `vn:` | Vietnamese meaning | `vn:mặt trời` | "ngày, mặt trời" |
| `on:` | Onyomi reading | `on:ニチ` | ニチ, ジツ |
| `kun:` | Kunyomi reading | `kun:ひ` | ひ, -び, -か |
| `com:` | Components | `com:日` | Components containing 日 |
| `jlpt:` | JLPT level | `jlpt:N5` | N5 |
| `freq:` | Frequency rank | `freq:<500` | 1-499 |

### Operators

| Operator | Precedence | Description | Example |
|----------|------------|-------------|---------|
| `()` | Highest | Grouping | `(jlpt:N5 OR jlpt:N4)` |
| `NOT` | High | Negation | `NOT freq:>1000` |
| `AND` | Medium | Both true | `jlpt:N5 AND on:コウ` |
| `OR` | Low | Either true | `on:コウ OR on:ゴウ` |

### Comparison Operators (Frequency)

| Operator | Meaning | Example |
|----------|---------|---------|
| `<` | Less than | `freq:<500` (very common) |
| `>` | Greater than | `freq:>1000` (less common) |
| `<=` | Less than or equal | `freq:<=100` (top 100) |
| `>=` | Greater than or equal | `freq:>=500` (500+) |
| `min-max` | Range | `freq:100-500` (100 to 500) |

### Example Queries

**By JLPT Level**:
```
jlpt:N5                          # All N5 kanji
jlpt:N5 OR jlpt:N4              # N5 or N4
(jlpt:N5 OR jlpt:N4) AND on:コウ # N5/N4 with コウ reading
```

**By Meaning**:
```
en:water                         # English: "water"
vn:nước                         # Vietnamese: "nước"
en:water OR vn:nước             # Either language
```

**By Frequency**:
```
freq:<100                        # Top 100 most common
freq:100-500                     # Frequency rank 100-500
freq:>1000                       # Less common (1000+)
jlpt:N5 AND freq:<500           # Common N5 kanji
```

**By Reading**:
```
on:コウ                          # Onyomi: コウ
kun:ひ                           # Kunyomi: ひ
hanviet:HÀNH                    # Hán Việt: HÀNH
hanviet:HÀNH AND freq:<500      # Common HÀNH kanji
```

**Complex Queries**:
```
(jlpt:N5 OR jlpt:N4) AND (en:water OR vn:nước)
# N5 or N4 kanji meaning "water"

jlpt:N3 AND freq:<500 AND NOT hanviet:HÀNH
# Common N3 kanji without HÀNH reading

(on:コウ OR on:ゴウ) AND freq:100-500
# コウ/ゴウ reading, moderate frequency
```

### Auto-Complete

As you type, the search box suggests:
- Field prefixes (`jlpt:`, `hanviet:`, `freq:`, etc.)
- Operators (`AND`, `OR`, `NOT`)
- Common values (N5, N4, N3, N2, N1)

Press **Tab** or **Enter** to accept suggestion.

### Search Tips

1. **Start Simple**: Begin with single field queries
2. **Use Parentheses**: Clarify complex queries with grouping
3. **Combine Filters**: Mix JLPT level + frequency for targeted search
4. **Save Queries**: Click "Save" to store frequent searches (max 10)
5. **View Recent**: Recent searches auto-saved (last 10)

### Search Limits

- **Results**: Max 50 kanji per search
- **Saved Queries**: Max 10 queries
- **Recent Searches**: Max 10 searches

---

## Exporting Your Work

### Export Options

**Two Formats**:
1. **PDF** (Vector-based, 300 DPI)
   - Best for printing
   - Sharp at any zoom level
   - Smaller file size
   - Professional quality

2. **PNG** (Raster-based, 200-600 DPI)
   - Best for digital sharing
   - Image format (JPEG/PNG)
   - Larger file size
   - Choose quality: 200, 300, or 600 DPI

### Exporting Step-by-Step

1. **Prepare Content**
   - Select kanji
   - Choose mode (Sheet/Board/Quiz)
   - Configure settings
   - Preview on screen

2. **Click Export Button** (in Control Panel)
   - Export modal opens

3. **Choose Format**
   - **PDF**: Single multi-page PDF file
   - **PNG**: Single image or ZIP (multi-page)

4. **Choose Quality** (PNG only)
   - 200 DPI: Fast, smaller file (~1 MB per page)
   - 300 DPI: Balanced quality (~2 MB per page)
   - 600 DPI: Highest quality (~8 MB per page)

5. **Click "Export"**
   - Progress bar appears
   - Shows "Processing page X of Y"
   - Wait for completion

6. **Download File**
   - PDF: `kanji-{mode}-{timestamp}.pdf`
   - PNG (single): `kanji-{mode}.png`
   - PNG (multi): `kanji-{mode}.zip`

### Export Tips

**For Printing**:
- Use **PDF format** (vector-based)
- Preview before export (WYSIWYG)
- Check page breaks
- Verify all content visible

**For Digital Sharing**:
- Use **PNG format**
- 300 DPI for balanced quality/size
- 200 DPI for quick sharing
- 600 DPI for high-quality images

**For Large Exports**:
- Limit to 10-20 pages at a time
- Close other browser tabs
- Wait patiently (don't interrupt)
- Check progress bar

**Common Export Issues**:
- **Blank pages**: Wait for render, try again
- **Missing fonts**: Refresh page, retry
- **Slow export**: Reduce kanji count or DPI
- **Failed export**: Check browser console for errors

---

## Customization Options

### Display Settings (Control Panel)

**Kanji Font**:
- KanjiStrokeOrders (stroke order visible)
- Noto Serif JP (serif, traditional)
- Noto Sans JP (sans-serif, modern)
- Meiryo (Windows standard)
- MS Gothic (monospace)

**Kanji Size** (60-120%):
- Adjust for readability
- Larger for beginners
- Smaller for advanced learners

**Hán Việt Font**:
- Arial
- Times New Roman
- Segoe UI
- Roboto
- Noto Sans

**Hán Việt Size** (35-65%):
- Relative to kanji size
- Adjust for balance

**Hán Việt Orientation**:
- **Vertical**: Traditional, saves space
- **Horizontal**: Easier to read

**Indicators**:
- **JLPT Badge**: Color-coded level (N5-N1)
- **Grade Badge**: Japanese school grade (1-12)
- **Frequency Badge**: Usage rank (1-2500)

### Mode-Specific Settings

**Sheet Mode**:
- Column count (4-13)
- Master kanji size (70-110%)
- Guide opacity (0-100%)
- Tracing opacity (first 3 cells)
- Show metadata (meanings, mnemonics)

**Board Mode**:
- Column count (4-16)
- Empty cells mode (hide/page/row)
- Show header/footer
- Header animation style
- Center card in cell

**Quiz Mode**:
- Question type (6 types)
- Number selection (10-100)
- Level filter (JLPT/Grade)
- Question order (sequential/random)
- Time limit (10s/30s/60s/unlimited)

### Saving Preferences

**Auto-Saved Settings**:
- Mode selection
- Display settings
- Layout settings
- Header/footer text
- Quiz settings

**Saved in LocalStorage**:
- Preferences persist across sessions
- Cleared when browser cache cleared

**Not Saved**:
- Chosen kanji (manual selection each session)
- Current page number
- Active quiz state (unless paused)

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search box |
| `Esc` | Close modal/dialog |
| `Ctrl/Cmd + Z` | Undo (chosen kanji) |
| `Ctrl/Cmd + Shift + Z` | Redo (chosen kanji) |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `←` | Previous page |
| `→` | Next page |
| `Home` | First page |
| `End` | Last page |
| `1`, `2`, `3` | Switch panels (Input/Main/Control) |

### Quiz Mode Shortcuts

| Shortcut | Action |
|----------|--------|
| `1`, `2`, `3`, `4` | Select answer (A, B, C, D) |
| `Enter` | Next question |
| `Space` | Pause/Resume |
| `Esc` | Quit quiz |

### Export Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + P` | Open export modal |
| `Ctrl/Cmd + S` | Export (after modal open) |
| `Esc` | Cancel export |

---

## Troubleshooting

### Common Issues

#### 1. Kanji Not Loading

**Symptoms**: Blank Input Panel, no kanji visible

**Solutions**:
- Refresh page (Ctrl/Cmd + R)
- Clear browser cache and reload
- Check browser console for errors
- Verify IndexedDB enabled in browser settings

#### 2. Export Failed

**Symptoms**: Export progress bar stuck, download doesn't start

**Solutions**:
- Wait 30 seconds, try again
- Reduce kanji count (export in batches)
- Lower PNG quality (200 DPI instead of 600)
- Close other browser tabs
- Try different browser

#### 3. Fonts Not Displaying Correctly

**Symptoms**: Square boxes instead of kanji, incorrect font

**Solutions**:
- Refresh page (Ctrl/Cmd + R)
- Wait for fonts to load (first load takes ~5 seconds)
- Check browser console for font errors
- Try different kanji font in settings

#### 4. Quiz Questions Not Appearing

**Symptoms**: Blank quiz screen, no questions

**Solutions**:
- Ensure kanji selected or level filter set
- Check quiz settings (number selection, level filter)
- Try "Random 10" instead of "All"
- Refresh page and reconfigure quiz

#### 5. Page Navigation Broken

**Symptoms**: Can't change pages, stuck on page 1

**Solutions**:
- Check if multiple pages exist (see page indicator)
- Try arrow keys (← →)
- Click page navigation buttons at bottom
- Refresh page

#### 6. Search Not Working

**Symptoms**: KQL query returns no results

**Solutions**:
- Check query syntax (see [Advanced Search](#advanced-search-kql))
- Try simpler query (e.g., `jlpt:N5`)
- Remove special characters
- Check field prefixes (case-sensitive)

#### 7. Mobile Layout Issues

**Symptoms**: Layout broken on mobile, overlapping panels

**Solutions**:
- Rotate device (portrait/landscape)
- Zoom out (pinch gesture)
- Clear browser cache
- Use swipe gestures to switch panels

### Browser Compatibility

**Fully Supported**:
- Chrome 90+ (Desktop & Mobile)
- Firefox 88+ (Desktop & Mobile)
- Safari 14+ (Desktop & Mobile)
- Edge 90+ (Desktop & Mobile)

**Partially Supported**:
- Older browsers: Some features may not work

**Not Supported**:
- Internet Explorer (deprecated)
- Browsers with JavaScript disabled

### Performance Tips

**For Smooth Experience**:
- Limit chosen kanji to <100 at once
- Export in batches (10-20 pages max)
- Close unused browser tabs
- Use 300 DPI for PNG (not 600)
- Clear browser cache periodically

**For Large Exports**:
- Use PDF format (faster than PNG)
- Reduce column count (fewer cells per page)
- Disable header/footer (less rendering)
- Export overnight for 100+ pages

### Getting Help

**Documentation**:
- Read this User Manual
- Check FAQ (next section)
- Review project README

**Community**:
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Project Repository: Read source code

**Contact**:
- Open issue on GitHub
- Provide error messages from browser console
- Include browser version and OS

---

**End of User Manual**

For frequently asked questions, see [FAQ Support Document](./05-FAQ.md).
For technical details, see [Architectural Design Document](./02-ARCHITECTURAL-DESIGN.md).
