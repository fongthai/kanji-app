I have input files as json under json/ foler.
Sample data:
  {
    "kanji": "行",
    "jlpt-level": "N5",
    "grade-level": 2,
    "sino-viet": "HÀNH, HẠNH, HÀNG",
    "onyomi": ["コウ", "ギョウ", "アン"],
    "kunyomi": ["い-く", "ゆ-く", "おこな-う"],
    "meaning": "to go; to do",
    "category": "Actions"
  }

Please help me to design a ReactJS website with morden UI and css animation.
Please ask me a lot of questions and document it as a file under docs/ folder.
Do not implement any code yet, just get my requirements. Please ask if you need more details of specicfic things you need to build a well test and modern of the art website.

I need these functions:

1. Generate a main view, same ratio for an A4 paper and fit it the available screen, repsonsive and scable, respect all the margins and window border, browser border, no overflow issue.
2. In that main view, it will be WYSIWYG, so I can see in the screen, print it out or export it to PDF, they all must have the same layout, using same font / style / size / color / ... as they are just identical. 
3. Main view will have header and footer with predefined branding string, page number, space to write the name in (for usage after printing).
4. Main view content will be groups of kanji characters. Each group is a rectangle as describe below.
- The outer border cover all element in a group.
- a small padding as margin in 4 edges.
- a table with 2 rows and flexible columns. Number of column are defined by users adjustment using a slider in "Control Panel" part. 
- Every cell in the table must always be squared, they're scable / responsive to the available of the space. Each cell have some helper lines for writing practice.
- The first 2 columns consist of 4 cells will be merged / seen as one big master cell. This master cell is be showed the master kanji, Then kanji is pick from the available list as they are from the input json files.
- The master kanji must be generate as using the technique from this repo: https://github.com/KanjiVG/kanjivg Please let me know if you need me to clone it locally.
- The master kanji must show as 80% fit into its master cell.
- Other cells in the table are called writing cells or normal cells. Because they're for users to practice writing the kanji letters follow the master kanji as instruction.
- On top of each table, still inside the kanji group, show an explanation string combining the data from the jason of its kanji as: kanji | sino-vietnamese | jlpt-level | O: onyumi | K: kunyomi. Those data are inside json data.
- Except for the margins and paddings, everthing inside a kanji group must be repsonsive and scale but do not overflow the main view or browser borders.

5. So user will adjust how many cell for the writing cells would be. And the kanji group need to ultilize the available width of the main view (or virtually this is an A4 paper) after respecting the margins. So the width of the table must grow to fit main view width. And because the cells are squared, that mean the size of the cells are somehow defined by the number of the column of the writing cells (please note that we have 2 first columns reserved and used for master cell).

6. With the cells size calculated, you can know what is the size the a kanji group. And you must know the mainview (A4 paper) available space after reserving for margins, header, footer. So now you can calculate to know how many kanji groups can be fit into the A4 mainview / paper.

7. If there are more kanji groups to put in the page, it should go to next page, and then vertical scroll bar should appear for scrolling. pdf export should export the same mainview/A4 paper with identical UI design for the cells, tables, kanji groups and pages. Same thing with the print preview feature directly on browser.

8. Another view (Let's call it Input view for now), I don't know where to put it in the UI. But it would show search box, category filter, available input data from the json as sections. A special section called "CHOSEN KANJIS" as the 1st section to show which kanji was chosen from other section.
9. For input json data: every files become a session with filename becomes section name. Section would also show how many kanji letter it has inside. Section must be collapsed as default. When expanded, it will show all kanji letters as a beautiful squared boxes. each box also has a small badge on top to indicate jlpt level (N5, N4, N3, N2, or N1). Each JLPT level shoul have it unique color as below:
N5: green
N4: blue
N3: yellow
N2: organ
N1: red
There is also the Hán Việt meaning (as sino-vietname field in json) for each kanji, with an option to show it vertically (default) or horizontal (at the bottom). When it's show vertically, if it has 2 or 3 meanings, show it as this order: 1st meaning on the right, 2nd meaning on the left, and 3rd meaning at the bottom of the kanji.

10. In input view, when a kanji is selected, there will be 3 actions happens:
- The kanji would be highligted with a dark color in its section.
- The kanji would be show in the top "CHOSEN KANJIS" section.
- The kanji would be show in the master kanji as a new addition kanji group in the main View, respecting all design, scale, style, repsonsiveness, ...
Once a kanji is chosen, its section still keep expanded and focused.
When we click a chosen kanji (in either its original highlighted one or in the CHOSEN KANJIS section), it would be doing 3 actions:
- Remove from the mainview.
- Remove from the CHOSEN KANJIS section.
- Un-highlighted in its original section.

11. Each sections has a title (same as filename) and there are 2 buttons on the same section header called "Add all" and "clear". "Add all" button will add all kanjis to the CHOSEN KANJIS section. "Clear" will reset all kanjis as they're not chosen.

12. Control panel views: This is where we allow users do change some settings: fonts/size/ how the Hán Việt text will be showed (vertical or horizontal as mentioned in #9 part)
We can have option for Kanji and Hán Việt font and size in Input View with slider adjustment.
We also have Hán Việt font and size for mainview with slider adjustment.
The master kanji size adjusment. Master kanji will use the vector generator from from this repo: https://github.com/KanjiVG/kanjivg - so it doesn't really need a font customization but just the size.
Another option user can chose is: how many columns will be for the writing cells.
Hán Việt text orientation will be a check-box if they want it to be vertical or not. Please refer to part #9 above about the Hán Việt position, it will be applied for both Input View and Main View.

13. We need 2 buttons: "Make PDF" and "Print".
"Make PDF" will generate the MainView as PDF, it can be single or multiple pages depend on the number of kanji was chosen. UI / layout / ... must be identical as WYSIWYG as the main view. Once PDF is generated, show it as a new browser tab.
"Print" will call browser print feature to show print preview for Main View, also must be WYSIWYG, identical to Main View and PDF file export.

14. Main View will also have a toggle to switch between "sheet" or "board" mode.
- Sheet mode as default mode: to show as writing prative sheet.
- Board mode: will only decorate the kanjis only in a big grid, each kanji as a cell. all cells are squared and same side. How big the cell is will be follow these rules:
- ultilize the space availble, fit into the Main View with respect to margins and edges, no overflow.
- kanji size option that user can adjust in "Control Panel".

Main view is expect to show as A4 size, scable all the unit inside this view, respect the available width and height of the browser available window and always fit to screen. If browser resized, main view will scale to always fit the page as 1 A4 view, user will scroll to see other page.

15. All variables and constants (predefined values, srings, messages, ...) please put them in a separated file, so I can revise easier.

16. Target users: all who are learning/teaching Japanese, so either learners or teach at all lelvel can use, as this aims for making kanji writing materials.

17. Layout priority: perfect A4 print quality for PCs. Mobile users still can use it.

18. KanjiVG perference: Use stroke order as static display for mobile printing. If user are on on mobiles or tables, we can show as animation.

19. Mobile and tablet users can do writing directly on their device with touchscreen (either by hand or pen). In this case, "undo" and "clear screen" buttons needed.

20. Performance scope: Input View, can load all kanji as input.
Main View: can load first page first, and lazy loading next pages.

21. Please make the app work even without internet after initial load.

## Enhanced Features (Approved)

22. Smart Templates: Pre-configured worksheet types for quick generation:
- "Quick Start" templates for common use cases
- "N5 Numbers Practice" (1-10 kanji)
- "Daily Kanji Set" (20 random from chosen level)
- "Vocabulary Theme" (same category kanji)

23. Custom branding/headers for schools: Allow educational institutions to customize worksheet headers with their logo, name, and contact information.

24. Stroke Order Hints: Toggle stroke numbers in practice cells to show proper writing sequence when needed.

25. PWA Features: Install as desktop app, work fully offline after initial load with complete functionality.

26. Smart Caching: Pre-load commonly used kanji SVGs (N5, N4 levels) locally, fetch rare ones (N3-N1) dynamically.

27. Export Quality: Vector PDF generation for crisp printing at any resolution.

## Smart Kanji Suggestions (New Feature)

28. Intelligent Kanji Recommendations: The app will suggest related kanjis based on:
- **Similar Shape/Visual**: Kanjis that look similar and are easily mis-identified (e.g., 人/入, 土/士, 目/日)
- **Same Hán Việt Sound**: Kanjis sharing the same Vietnamese pronunciation (e.g., all kanjis pronounced "NHẬT")
- **Word Family/Category**: Kanjis in the same semantic group (e.g., numbers, colors, family members, body parts)
- **Stroke Count Similarity**: Kanjis with similar complexity for balanced practice sessions
- **JLPT Level Progression**: Suggest next-level kanjis that build on current knowledge

This feature helps create more effective practice sessions by grouping kanjis that benefit from comparative learning.

## Technical Stack (Finalized)

29. Frontend Framework: React 18 + TypeScript + Vite
30. State Management: Zustand for simple, performant state handling
31. Document Generation: React-PDF for consistent PDF export
32. Animations: Framer Motion for smooth UI transitions
33. Touch Interactions: React-Spring for natural touch/gesture handling
34. Offline Support: Workbox for PWA functionality and caching strategies
35. Styling: Tailwind CSS + CSS Modules for component isolation

## Critical Technical Implementation

36. A4 Precision: CSS @page rules + print media queries for exact sizing matching physical paper
37. KanjiVG Loading: Bundle common kanji locally (N5, N4), fetch rare ones dynamically with smart caching
38. Touch Drawing: HTML5 Canvas with proper pressure sensitivity for natural writing experience
39. Vietnamese Fonts: Ensure proper diacritic rendering across all devices and browsers
40. Performance: Virtual scrolling for large datasets, lazy loading, and optimized rendering

HOw do you think? Is there any issues or concern on this enhanced feature set?
What is your suggestion or recommendation to make this idea even better?
Should we proceed with the technical prototype for the A4 scaling system?


IMPLEMENTATION PLAN:

🤔 Questions for You:
1. Prototype Scope Confirmation:
Is this the right level of prototype? Should I add more working features, or is validating the A4 scaling the main goal for now?

2. Implementation Priority:
What should we tackle next? Options:

A) KanjiVG Integration - Get real stroke-order SVGs working
B) Data Loading - Connect your JSON files to the interface
C) Full Input Panel - Make kanji selection functional
D) Touch Drawing Canvas - Implement writing functionality
3. Technical Approach Validation:
Are you satisfied with:

The 3-panel desktop layout structure?
The CSS Grid + Custom Properties scaling method?
The component architecture I've outlined?
4. Development Strategy:
Should we:

Incremental: Build one feature at a time, testing each thoroughly?
Parallel: Work on multiple features simultaneously?
Foundation-first: Complete the core React setup before adding features?
5. KanjiVG Integration:
Do you want me to:

Download/bundle some KanjiVG files locally for testing?
Show you how to integrate the SVGs into the React components?
Create a loader system that fetches SVGs dynamically?
The prototype has successfully validated the hardest technical challenge (A4 scaling). Everything else is standard React development - the foundation is rock solid! 🎯