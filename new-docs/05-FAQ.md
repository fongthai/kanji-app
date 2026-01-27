# Kanji App - Frequently Asked Questions (FAQ)

## Table of Contents

1. [General Questions](#general-questions)
2. [Getting Started](#getting-started)
3. [Kanji Selection & Search](#kanji-selection--search)
4. [Quiz Mode FAQ](#quiz-mode-faq)
5. [Sheet Mode FAQ](#sheet-mode-faq)
6. [Board Mode FAQ](#board-mode-faq)
7. [Export & Printing](#export--printing)
8. [Customization & Settings](#customization--settings)
9. [Technical Questions](#technical-questions)
10. [Troubleshooting](#troubleshooting)

---

## General Questions

### What is Kanji App?

Kanji App is a web-based application designed for Vietnamese learners and teachers of Japanese to create customized kanji practice materials. It features three modes: Quiz (assessment), Sheet (writing practice), and Board (reference display).

### Is Kanji App free?

Yes, Kanji App is completely free to use. There are no subscriptions, no ads, and no hidden costs.

### Do I need to create an account?

No, Kanji App requires no account or registration. Simply open the app and start using it immediately.

### Does it work offline?

After the initial load (which downloads kanji data), the app works offline using IndexedDB storage. Your kanji data, settings, and quiz history are stored locally in your browser.

### What languages are supported?

Currently, English and Vietnamese. The UI is fully bilingual, and you can switch languages anytime using the language switcher in the top-right corner.

### How many kanji are included?

The app includes 2000+ kanji covering all JLPT levels (N5-N1) and Japanese school grades (1-12), with comprehensive metadata including Hán Việt, meanings, readings, components, and mnemonics.

### Can I use this on my phone/tablet?

Yes! The app is fully responsive with a mobile-first design. On mobile devices (<768px), the interface uses a tab-based layout with swipe gestures.

### Is my data safe?

All your data is stored locally in your browser (IndexedDB and LocalStorage). Nothing is sent to a server. Your kanji selections, quiz history, and settings remain private on your device.

---

## Getting Started

### How do I install the app?

No installation required! Simply open the app URL in your web browser. On mobile, you can add it to your home screen for quick access (progressive web app).

### What happens on first launch?

On first launch, the app downloads 2000+ kanji characters (~10 MB) and stores them in IndexedDB. This takes ~5 seconds. Subsequent launches are instant.

### Why is the first load slow?

The app downloads 14 JSON files containing kanji data (N5-N1 levels). This one-time process ensures the app works offline afterward. Subsequent loads are fast.

### How do I change the language?

Click the language switcher button in the top-right corner of the header. Toggle between English (EN) and Vietnamese (VI). Your preference is saved automatically.

### Where do I start?

1. Browse or search for kanji in the Input Panel (left sidebar)
2. Click kanji to add to your chosen list
3. Select a mode (Quiz, Sheet, or Board) in the Control Panel (right sidebar)
4. Configure settings and export or take a quiz

### Can I use this without internet?

After the initial load, yes! The app stores all kanji data locally and works completely offline. You only need internet for the first visit.

---

## Kanji Selection & Search

### How do I select kanji?

**Three methods**:
1. **Quick Browse**: Click JLPT level buttons (N5-N4-N3-N2-N1) and click kanji cards
2. **Category Filter**: Use Quick Filters tab to browse 70+ categories (animals, food, verbs, etc.)
3. **Advanced Search**: Use KQL (Kanji Query Language) for complex queries

### What is KQL?

**Kanji Query Language** is a powerful search syntax that lets you find kanji by combining multiple criteria:
- Field prefixes: `jlpt:`, `hanviet:`, `en:`, `vn:`, `on:`, `kun:`, `com:`, `freq:`
- Operators: `AND`, `OR`, `NOT`, `()`
- Comparisons: `<`, `>`, `<=`, `>=`, `min-max` (for frequency)

Example: `jlpt:N5 AND freq:<500` finds common N5 kanji.

### How do I search for kanji by meaning?

Use the `en:` or `vn:` prefix:
- `en:water` (English meaning)
- `vn:nước` (Vietnamese meaning)
- `en:water OR vn:nước` (either language)

### How do I search by Hán Việt reading?

Use the `hanviet:` prefix:
- `hanviet:NHẬT` (finds kanji with NHẬT reading)
- `hanviet:HÀNH AND freq:<500` (common kanji with HÀNH reading)

### Why does my search return no results?

**Common reasons**:
- Typo in query (check spelling)
- Incorrect field prefix (case-sensitive: `jlpt:` not `JLPT:`)
- No kanji match criteria (try broader search)
- Syntax error (check parentheses, operators)

Try starting with a simple query like `jlpt:N5` and building from there.

### How many search results can I see?

KQL search returns a maximum of **50 results** to prevent UI lag. If you need more, refine your query to be more specific.

### Can I save my searches?

Yes! Click the "Save" button after a search to store it (max 10 saved queries). Access saved queries in the "Saved" tab.

### How do I reorder my chosen kanji?

Drag and drop kanji cards in the "Chosen Kanjis" section of the Input Panel. Order affects display in Sheet and Board modes.

### How do I remove a kanji from my chosen list?

Click the kanji card again to deselect, or click the "×" button on the chosen kanji card in the "Chosen Kanjis" section.

### Can I select all kanji from a level at once?

Not directly, but you can:
1. Use KQL search: `jlpt:N5`
2. Click "Select All" in search results (if implemented)
3. Or click each kanji card individually

---

## Quiz Mode FAQ

### What types of quizzes can I create?

**6 question types**:
1. Kanji → Hán Việt (most common)
2. Hán Việt → Kanji
3. Kanji → Meaning (English/Vietnamese)
4. Kanji → Onyomi
5. Onyomi → Kanji
6. Meaning → Kanji

### How do I start a quiz?

1. Select kanji (optional - if none selected, quiz uses level filter)
2. Click "Quiz" button in Control Panel
3. Configure settings (question type, number, time limit)
4. Click "Start Quiz"

### Can I pause a quiz?

Yes! Click the "Pause" button during the quiz. Click "Resume" to continue. The timer pauses while paused.

### What happens if I run out of time?

If time limit is set (10s, 30s, 60s) and you don't answer in time, the question is marked incorrect and moves to the next question automatically.

### Can I review wrong answers?

Yes! After finishing the quiz, the review screen shows:
- Your answer vs. correct answer
- Time spent per question
- Green checkmark (✓) for correct
- Red X (✗) for incorrect

### How is the score calculated?

- **Score**: 0-10 scale (e.g., 8.5/10)
- **Percentage**: 0-100% (e.g., 85%)
- **Formula**: (Correct answers / Total questions) × 10

If you quit early, only answered questions count.

### Where is my quiz history stored?

In LocalStorage. The app stores your last **50 quizzes**. Older quizzes are automatically deleted. History includes date, score, settings, and time spent.

### Can I delete quiz history?

Yes! Go to Quiz History and click "Delete" on individual quizzes, or "Clear All" to delete all history.

### Why are my quiz questions repeating?

If "Question Order" is set to "Sequential", questions appear in the same order each time. Change to "Random" for shuffled questions.

### Can I create a quiz with only certain kanji?

Yes! Select specific kanji in the Input Panel before starting the quiz. The quiz will only use your chosen kanji.

---

## Sheet Mode FAQ

### What is Sheet Mode for?

Sheet Mode generates traditional kanji writing practice sheets with:
- Master cell (2×2 size) showing the model kanji
- Practice cells with guide lines (cross + center square)
- First 3 practice cells show kanji with decreasing opacity (40%, 25%, 15%)
- Metadata (Hán Việt, meanings, mnemonics, etc.)

Perfect for handwriting drills, homework, and classroom worksheets.

### How many practice cells can I have per kanji?

**4-13 columns** (default: 13). More columns = smaller cells. Fewer columns = larger cells.

### What are the guide lines in practice cells?

Each practice cell has:
- 1 vertical center line
- 1 horizontal center line
- 1 small square (1/4 cell size) in center
- All lines: dotted, light grey, 50% opacity (adjustable)

These guides help students write balanced kanji.

### What are "tracing cells"?

The first 3 practice cells show the kanji with decreasing opacity:
- Cell 1: 40% opacity (most visible)
- Cell 2: 25% opacity
- Cell 3: 15% opacity (faintest)

Students trace these before practicing in blank cells.

### Can I adjust the opacity of guide lines?

Yes! In Control Panel, adjust "Guide Opacity" slider (0-100%). Higher = more visible, Lower = less distracting.

### What is the "Explanation Text"?

Metadata displayed above each kanji's writing table (1-3 lines):
- **Line 1**: Kanji | JLPT | Hán Việt | Onyomi | Kunyomi | Components
- **Line 2**: English Meaning | Vietnamese Meaning
- **Line 3**: Vietnamese Mnemonics

Toggle each line ON/OFF in Display Settings.

### How many kanji fit on one page?

Depends on:
- Column count (4-13)
- Explanation lines (1-3)
- Header/footer visibility
- A4 available space

The app auto-calculates and displays total pages (e.g., "Page 1 of 3").

### Can I customize the master kanji size?

Yes! In Control Panel, adjust "Master Kanji Size" slider (70-110%, default: 110%). Larger = easier to see stroke details.

### Why is there a gap between kanji tables?

Automatic spacing ensures tables don't get cut off between pages. The app calculates optimal page breaks.

---

## Board Mode FAQ

### What is Board Mode for?

Board Mode displays chosen kanjis in a responsive grid for flashcard-style review and high-quality printing. Perfect for reference sheets, study guides, and classroom posters.

### How many columns can I have?

**4-16 columns** (default: 6). More columns = smaller cards. Fewer columns = larger cards.

### What are "empty cells"?

Empty cells are blank grid spaces added to complete the layout. **3 modes**:
1. **Hide**: No empty cells (compact layout)
2. **Fill Page**: Fill entire page with empty cells (worksheet style)
3. **Fill Row**: Fill only last row (balanced layout)

Useful for worksheets where students fill in their own kanji.

### Can I add a header to my board?

Yes! Toggle "Show Header" ON and enter custom text (e.g., "N5 Kanji - Week 1", "食べ物 (Food)"). Choose from 5 fonts and 5 animation styles:
- Gradient Shimmer
- Wave
- Holographic
- Sparkle
- Neon Glow

### Can I add page numbers?

Yes! Toggle "Show Footer" ON. Page numbers appear at bottom: "Page 1 of 3" with timestamp.

### How do I center kanji in cards?

Toggle "Center Card" ON in Control Panel. Kanji will be centered vertically and horizontally in each grid cell.

### Can I change card colors?

JLPT level badges are color-coded:
- N5: Green (#22c55e)
- N4: Blue (#3b82f6)
- N3: Yellow (#eab308)
- N2: Orange (#f97316)
- N1: Red (#ef4444)

These colors cannot be changed (standardized for clarity).

### Why does my board always fit the viewport?

Board Mode uses **responsive scaling** (25-100%) to ensure the content always fits the screen while maintaining A4 aspect ratio. No horizontal scroll, no overflow.

### How many kanji fit on one page?

Depends on:
- Column count (4-16)
- Card size (derived from kanji font size)
- Header/footer visibility
- A4 available space

The app auto-calculates and displays total pages.

---

## Export & Printing

### What export formats are available?

**Two formats**:
1. **PDF** (Vector-based, 300 DPI) - Best for printing
2. **PNG** (Raster-based, 200/300/600 DPI) - Best for digital sharing

### Which format should I use for printing?

**PDF** is recommended for printing:
- Vector-based (sharp at any zoom level)
- Smaller file size
- Professional quality (300 DPI)
- Single multi-page file

### Which format should I use for sharing online?

**PNG** is better for digital sharing:
- Image format (easy to view)
- Can upload to social media
- Choose quality: 200, 300, or 600 DPI

### What DPI should I choose for PNG export?

- **200 DPI**: Fast, smaller file (~1 MB/page) - Quick sharing
- **300 DPI**: Balanced quality (~2 MB/page) - Recommended
- **600 DPI**: Highest quality (~8 MB/page) - Professional printing

### How long does export take?

Depends on:
- Page count (1-100+ pages)
- Format (PDF faster than PNG)
- DPI (higher = slower)
- Browser performance

**Typical times**:
- 1-5 pages: 5-10 seconds
- 10-20 pages: 20-40 seconds
- 50+ pages: 2-5 minutes

### Can I cancel an export?

Yes! Click the "×" button on the export progress modal to cancel. The app stops processing and closes the modal.

### Why is my export blank?

**Common causes**:
- Export started before page finished rendering (wait 2-3 seconds, retry)
- Browser blocked download (check browser permissions)
- Font not loaded (refresh page, retry)
- Too many pages (export in batches)

**Solutions**: Refresh page, wait for fonts to load, retry export.

### Why does my PDF look different from the screen?

This should NOT happen - the app uses **WYSIWYG** (What You See Is What You Get) rendering. If PDF differs from screen:
1. Refresh page
2. Wait for fonts to load (5 seconds)
3. Export again
4. If issue persists, report bug on GitHub

### Can I export multiple pages at once?

Yes! The app automatically exports all pages for your chosen kanji. For example, if you have 50 kanji in Board Mode (6 columns), you'll get multiple pages in a single PDF or ZIP file.

### How do I print my exported PDF?

1. Export to PDF
2. Open PDF in Adobe Reader, Preview, or browser
3. File → Print
4. Select printer
5. Choose "Actual size" (not "Fit to page")
6. Print

### Can I export just one page?

Not directly. Workaround:
1. Navigate to the page you want
2. Temporarily remove other kanji
3. Export
4. Re-add kanji afterward

Or use browser's "Print to PDF" for single page.

---

## Customization & Settings

### How do I change kanji font?

Control Panel → Display Settings → Kanji Font dropdown. Choose from 5 fonts:
- KanjiStrokeOrders (stroke order visible)
- Noto Serif JP (traditional serif)
- Noto Sans JP (modern sans-serif)
- Meiryo (Windows standard)
- MS Gothic (monospace)

### Can I adjust kanji size?

Yes! Control Panel → Display Settings → Kanji Size slider (60-120%). Larger for beginners, smaller for advanced learners.

### How do I show/hide Hán Việt readings?

Control Panel → Display Settings → Toggle "Show Hán Việt" ON/OFF. You can also change orientation (Vertical/Horizontal) and font.

### What are indicators?

Color-coded badges showing:
- **JLPT Level**: N5 (green), N4 (blue), N3 (yellow), N2 (orange), N1 (red)
- **Grade Level**: 1-12 (Japanese school grades)
- **Frequency**: 1-2500 (usage rank)

Toggle each ON/OFF in Display Settings.

### Are my settings saved?

Yes! Settings are saved in LocalStorage and persist across sessions. Includes:
- Mode selection
- Display settings (fonts, sizes)
- Layout settings (columns, empty cells)
- Quiz settings
- Header/footer text

### Can I reset settings to default?

Not with a button, but you can:
1. Clear browser data (Settings → Privacy → Clear browsing data)
2. Or manually adjust each setting back to default

### Can I change JLPT level colors?

No, JLPT colors are standardized for consistency:
- N5: Green
- N4: Blue
- N3: Yellow
- N2: Orange
- N1: Red

### How do I make kanji bigger for printing?

Increase "Kanji Size" in Display Settings. For Sheet Mode, also adjust "Master Kanji Size" slider (70-110%).

---

## Technical Questions

### What technology is used?

- **Frontend**: React 19 + TypeScript 5.9
- **Build**: Vite 7.2
- **State**: Redux Toolkit 2.2
- **Styling**: Tailwind CSS 3.4
- **Storage**: IndexedDB + LocalStorage
- **PDF**: @react-pdf/renderer (vector-based)
- **PNG**: html2canvas (raster-based)

### Where is my data stored?

**IndexedDB** (kanji data, 10 MB):
- Database: `ft-kanji-database`
- Stores all 2000+ kanji with metadata

**LocalStorage** (settings, 1-2 KB):
- Settings, quiz history, saved searches

All data stored locally in browser, never sent to server.

### Can I sync my data across devices?

No, data is stored locally per device. To transfer:
1. Export your chosen kanji list (future feature)
2. Or manually recreate on another device

### Is there an API?

No, the app is entirely client-side with no backend API.

### Can I self-host this app?

Yes! Clone the repository, run `npm install`, `npm run build`, and serve the `dist/` folder. See deployment docs for details.

### What browsers are supported?

**Fully supported**:
- Chrome 90+ (Desktop & Mobile)
- Firefox 88+ (Desktop & Mobile)
- Safari 14+ (Desktop & Mobile)
- Edge 90+ (Desktop & Mobile)

**Not supported**: Internet Explorer (deprecated)

### Does it work on iOS/Android?

Yes! The app is fully responsive and works on all mobile devices. Add to home screen for app-like experience (PWA).

### How much storage does it use?

- **IndexedDB**: ~10 MB (kanji data)
- **LocalStorage**: ~1-2 KB (settings)
- **Total**: ~10-12 MB

### Can I use this offline?

Yes! After the initial data load, the app works completely offline using IndexedDB and LocalStorage.

### Is there a mobile app?

Not a native app, but the web app is mobile-optimized with PWA support. Add to home screen for quick access.

---

## Troubleshooting

### App won't load / stuck on loading screen

**Solutions**:
1. Refresh page (Ctrl/Cmd + R)
2. Clear browser cache (Ctrl/Cmd + Shift + Delete)
3. Check internet connection (required for first load)
4. Try different browser
5. Check browser console for errors (F12)

### Kanji not displaying / showing squares

**Solutions**:
1. Wait 5 seconds for fonts to load
2. Refresh page
3. Check browser console for font errors
4. Try different kanji font in settings

### Export not working / stuck

**Solutions**:
1. Wait 30 seconds (large exports take time)
2. Reduce kanji count (export in batches)
3. Lower PNG quality (200 DPI)
4. Close other browser tabs
5. Try different browser
6. Check browser console for errors

### Search returning no results

**Solutions**:
1. Check query syntax (see [User Manual](./04-USER-MANUAL.md#advanced-search-kql))
2. Try simpler query (e.g., `jlpt:N5`)
3. Remove special characters
4. Verify field prefixes are correct

### Quiz not starting

**Solutions**:
1. Ensure kanji selected or level filter set
2. Check quiz settings (number selection, level filter)
3. Try "Random 10" instead of "All"
4. Refresh page

### Mobile layout broken

**Solutions**:
1. Rotate device (portrait/landscape)
2. Zoom out (pinch gesture)
3. Clear browser cache
4. Refresh page
5. Try different browser

### Settings not saving

**Solutions**:
1. Check LocalStorage enabled (browser settings)
2. Ensure browser not in incognito/private mode
3. Clear browser data and reconfigure
4. Try different browser

### Performance slow / laggy

**Solutions**:
1. Limit chosen kanji (<100)
2. Export in batches (10-20 pages)
3. Close unused browser tabs
4. Use 300 DPI for PNG (not 600)
5. Clear browser cache
6. Restart browser

### How do I report a bug?

1. Open GitHub Issues: [github.com/your-repo/issues](https://github.com)
2. Describe the issue
3. Include:
   - Browser version (Chrome 120, Firefox 115, etc.)
   - OS (Windows 11, macOS 14, Android 13, etc.)
   - Steps to reproduce
   - Error messages from browser console (F12)

### Where can I get help?

- **Documentation**: Read this FAQ and [User Manual](./04-USER-MANUAL.md)
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Project README**: Setup instructions and overview

---

## Additional Questions

### Can I contribute to the project?

Yes! The project is open-source. Contributions welcome:
- Bug fixes
- New features
- Documentation improvements
- Translations

See [CONTRIBUTING.md](../CONTRIBUTING.md) (if exists) or open an issue to discuss.

### Can I request new features?

Yes! Open a GitHub Issue with:
- Feature description
- Use case (why it's needed)
- Expected behavior
- Any relevant examples

### Is there a roadmap?

See [Feature List & Roadmap](./06-FEATURE-LIST-ROADMAP.md) for planned features and development priorities.

### Can I donate or support the project?

Currently, the project is free and open-source with no donation system. Best support:
- Star the repository on GitHub
- Share with other learners/teachers
- Contribute code or documentation
- Report bugs and suggest improvements

### Who built this?

Kanji App is built for Vietnamese learners of Japanese. See project README for credits and acknowledgments.

### What's the license?

Check the repository for license information. (Typically MIT or similar open-source license.)

---

**Still have questions?**

- Check [User Manual](./04-USER-MANUAL.md) for detailed guides
- Check [Architectural Design](./02-ARCHITECTURAL-DESIGN.md) for technical details
- Open a GitHub Issue for bug reports or feature requests
- Join GitHub Discussions for community Q&A

---

**Last Updated**: 2025-01-16
