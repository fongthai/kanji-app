# Kanji App - Project Summary

## Overview

**Kanji App** is a professional web application designed for Vietnamese learners and teachers of Japanese to create customized kanji practice materials. The application provides three distinct modes for different learning and teaching needs, all with professional-grade print quality and WYSIWYG (What You See Is What You Get) rendering.

## Target Audience

- Vietnamese learners of Japanese (all JLPT levels N5-N1)
- Japanese language teachers and educators
- Educational institutions
- Self-study enthusiasts
- Anyone creating customized kanji study materials

## Core Value Proposition

### Why This App Exists

Learning kanji is one of the most challenging aspects of studying Japanese. This application addresses several key needs:

1. **Vietnamese-Focused**: Prioritizes Hán Việt (Sino-Vietnamese) readings, which are crucial for Vietnamese learners
2. **Flexible Learning Tools**: Three distinct modes for different study approaches
3. **Print-Quality Outputs**: Professional PDFs and high-resolution PNGs for physical study materials
4. **Customization**: Extensive options for fonts, layouts, indicators, and content selection
5. **Free & Offline**: Client-side application with offline capabilities, no server required

## The Three Modes

### 1. Quiz Mode - Interactive Assessment

**Purpose**: Gamified testing and scoring system for kanji knowledge assessment.

**Use Cases**:
- Self-assessment of kanji knowledge
- Classroom quizzes and tests
- JLPT preparation
- Identifying weak areas for focused study

**Key Features**:
- 6 question types (Kanji ↔ Hán Việt, Kanji ↔ Meaning, Kanji ↔ Onyomi)
- Configurable quiz length (10, 20, 30, 50, 100, or all)
- Time limits (10s, 30s, 60s, or unlimited)
- Random or sequential question order
- Detailed review screen with correct answers and time spent
- Quiz history (last 50 quizzes stored locally)
- Score tracking (0-10 scale and percentage)

**Typical Workflow**:
1. Configure quiz settings (level, question count, time limit)
2. Take the quiz with multiple-choice answers
3. Review results with detailed feedback
4. Track progress over time through quiz history

### 2. Sheet Mode - Writing Practice Worksheets

**Purpose**: Generate traditional kanji writing practice sheets with master cells and guided practice cells.

**Use Cases**:
- Creating handwriting practice materials
- Classroom worksheets
- Homework assignments
- Personal study sheets

**Key Features**:
- Master cell (2×2 size) showing the model kanji
- 4-13 practice cells with guide lines (vertical, horizontal, center square)
- First 3 practice cells show kanji with decreasing opacity (40%, 25%, 15%)
- Customizable metadata display (Hán Việt, meanings, mnemonics, onyomi/kunyomi)
- JLPT level, grade, frequency indicators
- Automatic pagination for A4 pages
- Professional print quality (300 DPI PDFs)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│ Explanation Text (1-3 lines)       │
│ - Kanji | JLPT | Hán Việt | Onyomi │
│ - English & Vietnamese meanings     │
│ - Vietnamese mnemonics (optional)   │
├─────────────────────────────────────┤
│ Writing Table                       │
│ ┌────────┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐│
│ │Master  │█│▓│░│ │ │ │ │ │ │ │ │ ││
│ │  日    │日│日│日│ │ │ │ │ │ │ │ │ ││
│ │  大    ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤│
│ │  漢    │+│+│+│+│+│+│+│+│+│+│+│+││
│ │  字    │ │ │ │ │ │ │ │ │ │ │ │ ││
│ └────────┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘│
└─────────────────────────────────────┘
Legend: █=40% opacity, ▓=25%, ░=15%, +=guide lines
```

**Typical Workflow**:
1. Select kanji to practice
2. Configure column count and display options
3. Preview the worksheet on screen
4. Export to PDF for printing

### 3. Board Mode - Reference Grid Display

**Purpose**: Display chosen kanjis in a responsive grid for flashcard-style review and high-quality printing.

**Use Cases**:
- Creating flashcards for review
- Kanji reference sheets
- Classroom posters
- Study guides organized by theme/level

**Key Features**:
- Responsive grid layout (4-16 columns)
- Square cards with kanji, Hán Việt, and indicators
- Customizable header with 5 animation styles
- Footer with automatic page numbers
- Empty cells handling (hide, fill page, fill row)
- Always fits A4 in viewport (no overflow)
- Professional export (PDF & PNG)

**Layout Example**:
```
┌─────────────────────────────────┐
│      Custom Header Text         │
├─────┬─────┬─────┬─────┬─────┬───┤
│  日 │  月 │  火 │  水 │  木 │ 金 │
│NHẬT│NGUYỆT│HỎA│THỦY│MỘC│KIM│
│ N5  │ N5  │ N5  │ N5  │ N5  │ N5 │
├─────┼─────┼─────┼─────┼─────┼───┤
│  土 │  人 │  山 │  川 │  田 │ 力 │
│ THỔ│NHÂN │SƠN │XUYÊN│ĐIỀN│LỰC│
│ N5  │ N5  │ N5  │ N5  │ N5  │ N5 │
└─────┴─────┴─────┴─────┴─────┴───┘
         Page 1 of 3
```

**Typical Workflow**:
1. Select kanji for the reference sheet
2. Configure grid columns and appearance
3. Customize header/footer
4. Export to PDF or PNG

## Technology Stack

- **Frontend**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7.2
- **State Management**: Redux Toolkit 2.2
- **Styling**: Tailwind CSS 3.4
- **Database**: IndexedDB (client-side storage)
- **Internationalization**: i18next (English & Vietnamese)
- **PDF Export**: @react-pdf/renderer (vector-based)
- **PNG Export**: html2canvas (raster-based)

## Data Coverage

- **Total Kanji**: 2000+ characters
- **JLPT Levels**: N5 (80), N4 (122), N3 (~360), N2 (~360), N1 (~1000+)
- **Categories**: 70 semantic categories (animals, food, verbs, adjectives, etc.)
- **Metadata**: Hán Việt, meanings (English & Vietnamese), onyomi, kunyomi, components, lookalikes, mnemonics, frequency rankings

## Key Features

### Advanced Search (KQL - Kanji Query Language)

A powerful query language for finding kanji based on multiple criteria:

```
Examples:
- jlpt:N5                              (all N5 kanji)
- hanviet:HÀNH AND freq:<500          (common HÀNH kanji)
- (jlpt:N5 OR jlpt:N4) AND on:コウ    (N5/N4 with コウ reading)
- freq:100-500                         (frequency range)
- en:sun OR vn:mặt trời               (search by meaning)
```

### Export Capabilities

- **PDF Export**: Vector-based, 300 DPI, A4 precision, perfect for printing
- **PNG Export**: Raster-based, 200/300/600 DPI options, single or multi-page ZIP
- **Multi-page Support**: Automatic pagination with progress tracking
- **WYSIWYG**: Screen display matches exported output exactly

### Customization Options

- **Fonts**: Multiple font options for kanji and Hán Việt
- **Sizes**: Adjustable font sizes (60%-120% for kanji, 35%-65% for Hán Việt)
- **Indicators**: Toggle JLPT level, grade level, frequency badges
- **Orientation**: Vertical or horizontal Hán Việt display
- **Colors**: JLPT level color coding (N5=green, N4=blue, N3=yellow, N2=orange, N1=red)
- **Headers/Footers**: Custom text with animated styles

### Responsive Design

- **Mobile** (<768px): Tab-based navigation, swipe gestures, single panel view
- **Tablet** (768-1512px): 2-column layout
- **Desktop** (>1512px): 3-column layout with proportional scaling
- **Always A4-Optimized**: Content scales to fit viewport while maintaining aspect ratio

### Offline Capabilities

- **IndexedDB Storage**: All 2000+ kanji stored locally
- **LocalStorage**: Settings and quiz history
- **No Server Required**: Fully client-side application
- **PWA-Ready**: Can be installed as a progressive web app

## Use Case Examples

### For Students

1. **JLPT Preparation**: Use Quiz Mode to test N5-N1 level kanji with timed questions
2. **Writing Practice**: Generate Sheet Mode worksheets for handwriting drills
3. **Flashcard Review**: Create Board Mode reference sheets organized by theme
4. **Self-Study**: Use KQL search to find kanji by meaning, reading, or frequency

### For Teachers

1. **Classroom Quizzes**: Generate custom quizzes by level or category
2. **Homework Assignments**: Create Sheet Mode worksheets with specific kanji sets
3. **Study Materials**: Design Board Mode reference sheets for classroom posters
4. **Progress Tracking**: Use Quiz Mode history to monitor student improvement

### For Curriculum Designers

1. **Themed Lessons**: Use 70 categories to create lessons (food, animals, verbs, etc.)
2. **Progressive Difficulty**: Leverage frequency rankings to sequence learning
3. **Comprehensive Materials**: Combine all three modes for complete lesson packages
4. **Bilingual Support**: English and Vietnamese UI for diverse classrooms

## Unique Selling Points

1. **Vietnamese-First Approach**: Hán Việt as a first-class citizen, not an afterthought
2. **Three-in-One Solution**: Assessment, practice, and reference in a single app
3. **Professional Quality**: Print-ready outputs with WYSIWYG guarantee
4. **Powerful Search**: KQL query language for complex filtering
5. **Free & Open**: No subscriptions, no server costs, fully client-side
6. **Extensive Data**: 2000+ kanji with rich metadata (mnemonics, components, lookalikes)
7. **Bilingual UI**: Full English and Vietnamese localization

## System Requirements

- **Browser**: Modern browser (Chrome, Firefox, Edge, Safari)
- **JavaScript**: Enabled (required for app functionality)
- **IndexedDB**: Enabled (for kanji data storage)
- **Screen**: Minimum 320px width (mobile-first design)
- **Storage**: ~10 MB for kanji database
- **Internet**: Required for initial load, optional thereafter (offline PWA)

## Getting Started

1. **Open the App**: Navigate to the application URL
2. **Wait for Data Load**: First load downloads and stores 2000+ kanji (~5 seconds)
3. **Select Kanji**: Use Input Panel to search, browse, or query for kanji
4. **Choose Mode**: Switch between Quiz, Sheet, or Board mode
5. **Customize**: Adjust settings in Control Panel
6. **Export**: Download PDF or PNG for printing or sharing

## Project Status

- **Version**: 1.0 (Production-ready)
- **Languages**: English, Vietnamese
- **Deployment**: GitHub Pages or self-hosted
- **License**: Check repository for license information
- **Documentation**: Comprehensive docs in `/docs/` folder

## Quick Reference

| Mode  | Purpose                | Output          | Use Case                    |
|-------|------------------------|-----------------|-----------------------------|
| Quiz  | Test knowledge         | Score & history | Assessment, JLPT prep       |
| Sheet | Writing practice       | PDF/PNG         | Handwriting drills          |
| Board | Reference display      | PDF/PNG         | Flashcards, study guides    |

## Support & Feedback

- **Documentation**: See `/docs/` folder for detailed guides
- **Issues**: Report bugs or request features via GitHub Issues
- **Community**: Join discussions in project repository

---

**Kanji App** - Professional kanji learning tools for Vietnamese speakers
