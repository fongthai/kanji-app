# Kanji App 

## 📝 TL;DR

**🇻🇳 Tiếng Việt:**  
Ứng dụng web hỗ trọ viêc học Hán Tự (kanji) và từ vưng dành cho người Việt học tiếng Nhật.
Các tính năng chính:
- Sheet mode: Tạo bảng tập viết kanji, tuỳ chỉnh thoải mái từ danh sách từ vựng (theo trình độ, theo chủ đề, theo gợi ý hoặc seach, ...), font chữ, kích thước, số cột, hiển thị Hán Việt, jlpt level, grade level, frequency, nghĩa, âm on, âm kun, ...
- Board mode: Tạo file kiểu ma trận chữ, size to, để in treo hay dán tường.
- Quiz mode: Chế độ chơi game để test và tính điểm. Kiểm tra khả năng và hơn thua với bạn bè, xã hội
- Vocabulary mode: Chế độ học từ vựng và ứng dụng thực tế vào cách dùng, ngữ cảnh.
- Excercise mode: Chế độ tạo bài tập từ kanji hoặc/và từ vựng. Rất hữu ích cho thầy cô tạo bài test cho học sinh, cũng hữu ích cho cá nhân người học tự tạo bài tập và làm.

Ngoại trừ Quiz mode là để chơi game, các mode còn lại là để in ấn, tùy chỉnh được kích thước font và số cột, xuất PDF chất lượng cao định dạng A4 chuẩn in ấn. Phù hợp với mọi người từ người tự học cho đến thầy cô muốn tạo tài liệu dạy tiếng Nhật.

**🇬🇧 English:**  
Web app for supporting Kanji learners - especially Vietnamese who like to use Hán Việt (Sino-Vietnamese) Search and select kanji by JLPT level (N5-N1), display Sino-Vietnamese readings (Hán Việt), customize font sizes and column layouts, export print-ready A4 PDFs at 600 DPI. 
---

A professional-grade web application for generating print-optimized kanji practice worksheets with precise A4 formatting and Vietnamese (Hán Việt) reading support. Built with React 18, TypeScript, and Redux Toolkit, this tool is designed for Vietnamese learners of Japanese who want to create customized, high-quality kanji practice materials.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6.2-blue.svg)

## ✨ Features

### 📄 Dual Display Modes
- **Sheet Mode**: Scrollable responsive grid layout for practice worksheets with customizable columns (4-8)
- **Board Mode**: Fixed A4 pages with automatic pagination and grid calculations (4-16 columns)
- WYSIWYG display with A4 paper dimensions (2480×3508px @300DPI)

### 🎨 Comprehensive Kanji Database
- **JLPT Levels N5-N1**: Complete coverage with 2000+ kanji characters
- **Color-coded indicators**: Visual JLPT level identification (N5-Green, N4-Blue, N3-Yellow, N2-Orange, N1-Red)
- **Detailed information**: Sino-Vietnamese readings (Hán Việt), onyomi, kunyomi, meanings, and categories
- **IndexedDB storage**: Fast offline access with indexed searches by section, level, and category

### 🔍 Smart Search & Filtering
- Real-time kanji search across all fields
- Multi-criteria filtering by JLPT level, grade, and category
- Category-based organization (Numbers, Actions, Nature, etc.)
- Search within chosen kanji with instant highlighting

### 🎯 Intelligent Kanji Selection
- Click to add kanji from search results to your worksheet
- Double-click to remove from chosen collection
- Drag-and-drop reordering with `@dnd-kit`
- Visual feedback across all UI sections

### 🎛️ Granular Display Controls
- **Independent font sizing**: Separate controls for Input Panel (1.5-6.5rem) and Main Panel (4-12rem)
- **Surround-text sizing**: Adjustable Hán Việt text (0.2-2rem input, 1-5rem main)
- **Board-specific settings**: Empty cell display, card centering, header/footer toggles
- **Column count controls**: Different ranges per mode for optimal layouts

### 📱 Responsive & Mobile-Friendly
- Custom Tailwind breakpoints (md: 768px, lg: 1512px, xl: 1801px, 2xl: 2400px)
- Mobile tab switcher (<768px) with swipe gesture navigation
- Desktop 3-column layout: Input Panel | Main View | Control Panel
- Touch-optimized controls and indicators

### 💾 Export & Data Management
- PDF export with maintained print quality
- JSON import/export for worksheet configurations
- Database reload functionality
- LocalStorage for user preferences

### ⚡ Performance Optimized
- Lazy loading for large kanji sets
- Memoized board layout calculations
- Virtualized rendering for smooth scrolling
- Efficient Redux Toolkit state updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser with IndexedDB support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kanji-app.git
cd kanji-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173` (or next available port).

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🧪 Testing

```bash
# Run unit tests with Vitest
npm test

# Run tests with UI
npm test:ui

# Run E2E tests with Playwright
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

**Playwright test projects**: pc-horizontal, pc-vertical, tablet-horizontal, tablet-vertical, mobile-horizontal, mobile-vertical

## 📂 Project Structure

```
kanji-app/
├── src/
│   ├── app/              # Redux store and typed hooks
│   ├── components/       # Shared presentational components
│   │   ├── pdf/         # PDF export components
│   │   ├── screen/      # Screen display components
│   │   └── shared/      # Common utilities
│   ├── constants/        # Board dimensions, indicators
│   ├── db/              # IndexedDB configuration
│   ├── features/        # Feature-sliced design modules
│   │   ├── controlPanel/
│   │   ├── displaySettings/
│   │   ├── inputPanel/
│   │   ├── kanji/       # Kanji data and selection logic
│   │   ├── mainView/    # Dual-mode rendering
│   │   ├── search/
│   │   └── worksheet/   # Mode and layout settings
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Helper functions
├── public/
│   ├── fonts/           # Font manifests
│   └── json/            # Kanji data files
├── tests/
│   ├── e2e/             # Playwright tests
│   └── unit/            # Vitest tests
└── docs/                # Project documentation
```

## 🏗️ Architecture

### Feature-Sliced Design
Redux slices are organized by domain, not by UI:
- `kanjiSlice`: Single source of truth for all kanji data, selections, and search
- `worksheetSlice`: Mode (sheet/board), column counts, board-specific settings
- `displaySettingsSlice`: Font sizes with separate ranges for input/main panels

### Critical A4 Paper Scaling
- Fixed dimensions: 2480×3508px @300DPI for print quality
- Dynamic viewport scaling with `transform: scale()` maintaining aspect ratio
- MIN_SCALE = 0.25 (25% minimum zoom)

### Board Mode Grid Calculations
```typescript
// Calculate once with useMemo - cards use fixed px sizing
const cardSize = (availableWidth - totalGaps) / columnCount;
const rowCount = Math.floor((availableHeight + gap) / (cardSize + gap));
const cardsPerPage = rowCount * columnCount;
```

## 🎨 Technologies

- **Frontend**: React 19, TypeScript 5.6
- **State Management**: Redux Toolkit 2.2
- **Styling**: Tailwind CSS 3.4
- **Build Tool**: Vite 6.0
- **PDF Generation**: @react-pdf/renderer, jsPDF
- **Database**: IndexedDB (via idb 8.0)
- **Drag & Drop**: @dnd-kit
- **Testing**: Vitest 2.1, Playwright 1.48
- **Linting**: ESLint 9.39

## 📖 Usage Guide

### Creating a Worksheet

1. **Search & Filter**: Use the Input Panel (left) to search for kanji by character, meaning, or Hán Việt reading
2. **Select Kanji**: Click on kanji cards to add them to your chosen collection
3. **Reorder**: Drag and drop kanji in the "Chosen Kanjis" section to arrange them
4. **Choose Mode**: Toggle between Sheet (scrollable) or Board (paginated) mode
5. **Customize Display**: Adjust font sizes, column counts, and surround-text settings in Control Panel (right)
6. **Export**: Generate PDF or use browser print for physical worksheets

### Keyboard Shortcuts (Board Mode)
- `←` / `→`: Navigate previous/next page
- `Home`: Jump to first page
- `End`: Jump to last page

### Mobile Navigation
- Swipe left/right (50px minimum) to switch between panels
- Tab buttons for Input Panel / Main View / Control Panel

## 🎯 Target Users

- Vietnamese learners of Japanese (all levels)
- Japanese language teachers preparing practice materials
- Self-study enthusiasts needing customized worksheets
- Language schools requiring print-ready kanji resources

## 📊 Data Sources

**Kanji Data** (`public/data/kanji/`):
- 2,000+ kanji characters across 14 JSON files
- JLPT N5-N1 coverage
- Kanji of the Year (KOTY)
- Organized by level with consistent schema
- See `manifest.json` for full file list

**Vocabulary Data** (`public/data/vocabulary/`):
- 6,789 vocabulary entries across 145 JSON files (optimized: ~3 MB, redundant fields removed)
- Organized into 8 books:
  - Minna no Nihongo I (Units 1-25, ~1,135 vocab)
  - Minna no Nihongo II (Units 26-50, ~1,135 vocab)
  - JLPT N2 (27 units, ~1,303 vocab)
  - JLPT N3 (31 units, ~1,555 vocab)
  - JLPT N4 (11 units, ~514 vocab)
  - JLPT N5 (8 units, ~410 vocab)
  - N3 Mimikara (17 groups, 841 vocab)
  - Mimikara N3 other (1 file, 17 vocab)
- Each entry includes: Japanese word, furigana, Han-Viet reading, Vietnamese/English translations, example sentences
- Efficient structure: `book`, `unit`, `id`, `orderIndex` stored only at file level, not per-vocabulary item
- See `manifest.json` for full file list

## 🤝 Contributing

Contributions are welcome! Please read the project requirements in `docs/project-requirements.md` and follow the feature-sliced design pattern.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [KanjiVG](https://github.com/KanjiVG/kanjivg) - Kanji vector graphics (CC BY-SA 3.0)
- JLPT kanji data resources
- Vietnamese Hán Việt reading references

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for Vietnamese learners of Japanese**