import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addKanji, removeKanji, setAllKanjis, clearChosenKanjis, reorderChosenKanjis, type KanjiData } from '../kanji/kanjiSlice';
import { seedKanjisFromJSON, checkIfDataExists, getAllKanjis } from '../../db/indexedDB';
import { startQuiz, setQuizQuestions, type QuizSettings } from '../quiz/quizSlice';
import { generateQuestions } from '../../utils/questionGenerator';
import QuizCountdown from '../../components/QuizCountdown';
import { KanjiSearch } from '../search/KanjiSearch';
import { KanjiCard } from '../../components/screen/KanjiCard';
import { SECTION_COLOR_PAIRS } from '../../constants/indicators';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Kanji Item Component
interface SortableKanjiItemProps {
  kanji: KanjiData;
  colors?: {
    header: string;
    body: string;
    border: string;
    chosenBorder: string;
  };
  onRemove: () => void;
  kanjiFont: string;
  kanjiSize: number;
  hanVietFont: string;
  hanVietSize: number;
}

function SortableKanjiItem({ kanji, colors, onRemove, kanjiFont, kanjiSize, hanVietFont, hanVietSize }: SortableKanjiItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: kanji.kanji });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="relative">
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
          style={{ touchAction: 'none' }}
          onDoubleClick={onRemove}
        />
        <KanjiCard
          kanji={kanji}
          isChosen={true}
          colors={colors}
          kanjiFont={kanjiFont}
          kanjiSize={kanjiSize}
          hanVietFont={hanVietFont}
          hanVietSize={hanVietSize}
        />
      </div>
    </div>
  );
}

interface KanjiSection {
  name: string;
  file: string;
  kanjis: KanjiData[];
  expanded: boolean;
  colors?: {
    header: string;
    body: string;
    border: string;
    chosenBorder: string;
    text: string;
  };
}

// Get random section color from 30 professional color pairs
// Kanji text is always white for input panel
const getSectionColor = () => {
  const randomIndex = Math.floor(Math.random() * SECTION_COLOR_PAIRS.length);
  const colorPair = SECTION_COLOR_PAIRS[randomIndex];
  
  return {
    header: colorPair.header,    // Dark color for section header
    body: colorPair.area,         // Lighter color for kanji cards
    border: colorPair.header,     // Dark color for card borders
    chosenBorder: '#FFFFFF',      // White border in Chosen Kanjis section
    text: '#FFFFFF',              // White text for kanji
  };
};

function InputPanel() {
  const { t } = useTranslation(['common', 'messages', 'quiz']);
  const dispatch = useAppDispatch();
  const allKanjis = useAppSelector((state) => state.kanji.allKanjis);
  const chosenKanjis = useAppSelector((state) => state.kanji.chosenKanjis);
  const inputPanelSettings = useAppSelector((state) => state.displaySettings.inputPanel);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<KanjiSection[]>([]);
  const [chosenExpanded, setChosenExpanded] = useState(false);
  const [kanjiColors, setKanjiColors] = useState<Map<string, { header: string; body: string; border: string; chosenBorder: string; text: string }>>(new Map());
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [quizSectionKanjis, setQuizSectionKanjis] = useState<KanjiData[]>([]);
  const [showAskFieldMenu, setShowAskFieldMenu] = useState(false);
  const [showAnswerTypeMenu, setShowAnswerTypeMenu] = useState<boolean>(false);
  const [selectedAnswerTypes, setSelectedAnswerTypes] = useState<Set<'hanViet' | 'onyomi' | 'vietnamese' | 'english'>>(new Set(['hanViet']));
  const loadDataAttemptedRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const chosenMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAskFieldMenu(false);
      }
      if (chosenMenuRef.current && !chosenMenuRef.current.contains(event.target as Node)) {
        setShowAnswerTypeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fixed card size: always 4.05rem (based on 3rem kanji * 1.35)
  const fixedCardSize = 4.05;
  
  // Calculate kanji font size based on percentage slider (60% - 120%)
  // Base is 3rem, slider adjusts from 60% to 120% of base
  const baseKanjiFontSize = 3;
  const kanjiFontSizePercentage = Math.max(60, Math.min(120, inputPanelSettings.kanjiSize)); // Clamp 60-120
  const calculatedKanjiSize = baseKanjiFontSize * (kanjiFontSizePercentage / 100);
  
  // Han-viet and indicator: 20% of kanji base size, adjusted by surround-text slider
  const baseHanVietSize = baseKanjiFontSize * 0.20; // 0.6rem
  const hanVietSizePercentage = Math.max(60, Math.min(120, inputPanelSettings.hanVietSize)); // Clamp 60-120
  const calculatedHanVietSize = baseHanVietSize * (hanVietSizePercentage / 100);

  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = chosenKanjis.findIndex((k) => k.kanji === active.id);
      const newIndex = chosenKanjis.findIndex((k) => k.kanji === over.id);
      
      dispatch(reorderChosenKanjis({ oldIndex, newIndex }));
    }
  };

  useEffect(() => {
    if (!loadDataAttemptedRef.current && !isLoadingData) {
      loadDataAttemptedRef.current = true;
      loadData();
    }
  }, []);

  const loadData = async () => {
    if (isLoadingData) {
      console.log('[InputPanel] Already loading, skipping duplicate call');
      return;
    }
    
    try {
      console.log('[InputPanel] Starting data load...');
      setIsLoadingData(true);
      setLoading(true);
      
      // Set a timeout to detect if loading hangs
      const timeoutId = setTimeout(() => {
        console.error('[InputPanel] Loading timeout - database may be stuck. Try clearing browser data.');
      }, 10000); // 10 second timeout
      
      // Check if IndexedDB is available
      if (!('indexedDB' in window)) {
        clearTimeout(timeoutId);
        throw new Error('IndexedDB is not supported in this browser');
      }
      
      console.log('[InputPanel] Checking if data exists...');
      // Check if data exists, if not seed it
      let dataExists = false;
      try {
        dataExists = await checkIfDataExists();
        clearTimeout(timeoutId);
        console.log('[InputPanel] Data exists:', dataExists);
      } catch (checkError) {
        clearTimeout(timeoutId);
        console.error('[InputPanel] Error checking data existence:', checkError);
        // Assume data doesn't exist if check fails
        dataExists = false;
      }
      
      if (!dataExists) {
        console.log('[InputPanel] Data does not exist, seeding from JSON...');
        
        // Load manifest file to get list of JSON files
        let jsonFiles: string[] = [];
        try {
          const manifestResponse = await fetch(`${import.meta.env.BASE_URL}json/input-json-manifest.txt`);
          
          if (manifestResponse.ok) {
            const manifestText = await manifestResponse.text();
            
            // Parse manifest: each line is a filename, ignore empty lines
            jsonFiles = manifestText
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0 && !line.startsWith('#'))
              .map(filename => `${import.meta.env.BASE_URL}json/${filename}`);
          } else {
            throw new Error(`Manifest file not found: ${manifestResponse.status}`);
          }
        } catch (manifestError) {
          console.error('Could not load manifest file:', manifestError);
          // Fallback to hardcoded list if manifest fails
          jsonFiles = [
            `${import.meta.env.BASE_URL}json/koty-2025.json`,
            `${import.meta.env.BASE_URL}json/n5.json`,
            `${import.meta.env.BASE_URL}json/n4.json`,
            `${import.meta.env.BASE_URL}json/n3-A.json`,
            `${import.meta.env.BASE_URL}json/n3-B.json`,
            `${import.meta.env.BASE_URL}json/n2-A.json`,
            `${import.meta.env.BASE_URL}json/n2-B.json`,
            `${import.meta.env.BASE_URL}json/n1-A.json`,
            `${import.meta.env.BASE_URL}json/n1-B.json`,
            `${import.meta.env.BASE_URL}json/n1-C.json`,
            `${import.meta.env.BASE_URL}json/n1-D.json`,
            `${import.meta.env.BASE_URL}json/n1-E.json`,
            `${import.meta.env.BASE_URL}json/n1-F.json`,
            `${import.meta.env.BASE_URL}json/n1-G.json`,
          ];
        }
        
        await seedKanjisFromJSON(jsonFiles);
        console.log('[InputPanel] Data seeded successfully');
      }

      // Load all kanjis
      const kanjis = await getAllKanjis();
      console.log('[InputPanel] Loaded kanjis:', kanjis.length);
      dispatch(setAllKanjis(kanjis));

      // Group kanjis by section name (using filename)
      const grouped = kanjis.reduce((acc: Record<string, KanjiData[]>, kanji) => {
        const level = kanji.sectionName || 'Unknown';
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(kanji);
        return acc;
      }, {});

      const colorMap = new Map();
      const newSections: KanjiSection[] = Object.entries(grouped).map(([level, kanjis]: [string, any]) => {
        const colors = getSectionColor(); // Random color for each section
        // Store colors for each kanji in this section
        kanjis.forEach((k: KanjiData) => {
          colorMap.set(k.kanji, colors);
        });
        
        // Sort kanjis by orderIndex to preserve original JSON file order
        kanjis.sort((a: KanjiData, b: KanjiData) => {
          const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        
        return {
          name: level,
          file: level,
          kanjis,
          expanded: false,
          colors
        };
      });

      setKanjiColors(colorMap);
      // Sort sections in reverse alphabetical order (n5-org, n4-org, ..., n1-A-org)
      newSections.sort((a, b) => b.name.localeCompare(a.name));

      console.log('[InputPanel] Sections created:', newSections.length);
      setSections(newSections);
      setLoading(false);
      setIsLoadingData(false);
      console.log('[InputPanel] Loading complete');
    } catch (error) {
      console.error('[InputPanel] Failed to load kanji data:', error);
      console.error('[InputPanel] Error stack:', error instanceof Error ? error.stack : 'No stack');
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  const toggleSection = (index: number) => {
    setSections(sections.map((s, i) => {
      if (i === index) {
        return { ...s, expanded: !s.expanded };
      } else {
        // Collapse all other sections (accordion behavior)
        return { ...s, expanded: false };
      }
    }));
  };

  const handleKanjiClick = (kanji: KanjiData) => {
    const isChosen = chosenKanjis.some(k => k.kanji === kanji.kanji);
    if (isChosen) {
      dispatch(removeKanji(kanji.kanji));
    } else {
      dispatch(addKanji(kanji));
      setChosenExpanded(true); // Auto-expand when adding
    }
  };

  const addAllFromSection = (sectionIndex: number) => {
    sections[sectionIndex].kanjis.forEach(kanji => {
      if (!chosenKanjis.some(k => k.kanji === kanji.kanji)) {
        dispatch(addKanji(kanji));
      }
    });
  };

  const clearSection = (sectionIndex: number) => {
    sections[sectionIndex].kanjis.forEach(kanji => {
      dispatch(removeKanji(kanji.kanji));
    });
  };

  const startQuizFromSection = (sectionIndex: number, _askField: 'hanViet' | 'onyomi' | 'vietnamese' | 'english') => {
    // Get section kanjis (use full list if sectionIndex >= 0, otherwise use chosen)
    const sectionKanjis = sectionIndex >= 0 ? sections[sectionIndex].kanjis : chosenKanjis;
    
    if (sectionKanjis.length === 0) {
      alert('This section has no kanjis');
      return;
    }
    
    setQuizSectionKanjis(sectionKanjis);
    setShowAskFieldMenu(false);
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    
    // Create 10 random kanjis from section (or less if section has fewer)
    const quizCount = Math.min(10, quizSectionKanjis.length);
    const randomKanjis: KanjiData[] = [];
    const available = [...quizSectionKanjis];
    
    for (let i = 0; i < quizCount; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      randomKanjis.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }

    // Extract unique JLPT levels from the random kanjis
    const jlptLevelsSet = new Set<string>();
    randomKanjis.forEach(k => {
      if (k.jlptLevel) {
        jlptLevelsSet.add(k.jlptLevel);
      }
    });
    const selectedJlptLevels = Array.from(jlptLevelsSet);

    // Convert selected answer types to array for askFields
    const askFieldsArray = Array.from(selectedAnswerTypes);

    // Create quiz settings with defaults
    const quizSettings: QuizSettings = {
      numberSelection: 'all',
      levelType: 'jlpt',
      selectedJlptLevels: selectedJlptLevels,
      selectedGradeLevels: [],
      showField: 'kanji',
      askField: askFieldsArray[0],
      askFields: askFieldsArray as any,
      questionOrder: 'sequential',
      maxTimePerQuestion: 30,
      includeKanji: true,
      includeVocabulary: false,
    };

    // Generate questions from random kanjis using full kanji pool for wrong answers
    const questions = generateQuestions(quizSettings, allKanjis, randomKanjis);
    
    if (questions.length === 0) {
      alert('Could not generate questions. Please try again.');
      return;
    }

    // Start the quiz
    dispatch(startQuiz({ allKanjis }));
    dispatch(setQuizQuestions(questions));
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto">
        <div className="text-center py-8 text-gray-400">Loading kanji data...</div>
      </div>
    );
  }

  return (
    <div data-testid="input-panel" className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto h-full">
      {/* Search Component with Tabs */}
      <div className="mb-3 overflow-visible">
        <KanjiSearch kanjiColors={kanjiColors} />
      </div>
      
      <div className="mb-4 bg-green-900 border border-green-600 rounded">
        <div 
          className="p-3 cursor-pointer hover:bg-green-800 transition-colors flex justify-between items-center"
          onClick={() => setChosenExpanded(!chosenExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{chosenExpanded ? '▼' : '▶'}</span>
            <strong>{t('common:labels.chosen_kanjis')} ({chosenKanjis.length})</strong>
          </div>
          <div className="flex gap-2 items-center">
            {chosenKanjis.length > 0 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch(clearChosenKanjis()); }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                  title={t('common:tooltips.clear_all_kanjis')}
                >
                  {t('common:buttons.clear_all')}
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (chosenKanjis.length >= 20) {
                        setShowAnswerTypeMenu(!showAnswerTypeMenu);
                      } else {
                        alert(`Need at least 20 kanjis for quiz (have ${chosenKanjis.length})`);
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                    title={t('common:tooltips.quiz_this_section')}
                  >
                    {t('quiz:settings.quickQuiz')}
                  </button>
                  {showAnswerTypeMenu && (
                    <div ref={chosenMenuRef} className="absolute right-0 mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 min-w-52">
                      <div className="p-2 border-b border-gray-700 text-white text-xs font-semibold px-3 py-2">
                        Choose answer types (select at least 1):
                      </div>
                      <div className="p-2 space-y-2">
                        {['hanViet', 'onyomi', 'vietnamese', 'english'].map((type) => (
                          <label key={type} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 hover:bg-gray-800 px-2 py-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedAnswerTypes.has(type as any)}
                              onChange={(e) => {
                                e.stopPropagation();
                                const newTypes = new Set(selectedAnswerTypes);
                                if (e.target.checked) {
                                  newTypes.add(type as any);
                                } else if (newTypes.size > 1) {
                                  newTypes.delete(type as any);
                                }
                                setSelectedAnswerTypes(newTypes);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-white text-sm">
                              {type === 'hanViet' && 'Hán-Việt'}
                              {type === 'onyomi' && 'Onyomi'}
                              {type === 'vietnamese' && 'Vietnamese'}
                              {type === 'english' && 'English'}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="border-t border-gray-700 p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuizSectionKanjis(chosenKanjis);
                            setShowAnswerTypeMenu(false);
                            setShowCountdown(true);
                          }}
                          className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors font-medium"
                        >
                          Start Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        {chosenExpanded && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chosenKanjis.map((k) => k.kanji)}
              strategy={rectSortingStrategy}
            >
              <div 
                className="p-3 grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${fixedCardSize}rem, 1fr))`,
                }}
              >
                {chosenKanjis.map((k) => {
                  const colors = kanjiColors.get(k.kanji);
                  return (
                    <SortableKanjiItem
                      key={k.kanji}
                      kanji={k}
                      colors={colors}
                      onRemove={() => dispatch(removeKanji(k.kanji))}
                      kanjiFont={inputPanelSettings.kanjiFont}
                      kanjiSize={calculatedKanjiSize}
                      hanVietFont={inputPanelSettings.hanVietFont}
                      hanVietSize={calculatedHanVietSize}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {sections.map((section, index) => {
        const selectedCount = section.kanjis.filter((k: KanjiData) => 
          chosenKanjis.some(chosen => chosen.kanji === k.kanji)
        ).length;
        
        return (
        <div key={section.file} className="mb-1 rounded-lg overflow-hidden" style={{ borderWidth: '2px', borderColor: section.colors?.border }}>
          <div 
            className="p-3 cursor-pointer transition-colors"
            style={{ backgroundColor: section.colors?.header }}
            onClick={() => toggleSection(index)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{section.expanded ? '▼' : '▶'}</span>
                <span className="font-medium">{section.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {selectedCount} / {section.kanjis.length}
                </span>
                {section.expanded && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); addAllFromSection(index); }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                      title={t('common:tooltips.add_all_section')}
                    >
                      {t('common:buttons.add_all')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); clearSection(index); }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors"
                      title={t('common:tooltips.clear_section')}
                    >
                      {t('common:buttons.clear')}
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowAskFieldMenu(!showAskFieldMenu); }}
                        className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors font-medium"
                        title="Start quick quiz"
                      >
                        {t('quiz:settings.quickQuiz')}
                      </button>
                      {showAskFieldMenu && (
                        <div ref={menuRef} className="absolute right-0 mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 min-w-52">
                          <div className="p-2 border-b border-gray-700 text-white text-xs font-semibold px-3 py-2">
                            Choose answer types (select at least 1):
                          </div>
                          <div className="p-2 space-y-2">
                            {['hanViet', 'onyomi', 'vietnamese', 'english'].map((type) => (
                              <label key={type} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 hover:bg-gray-800 px-2 py-1 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedAnswerTypes.has(type as any)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const newTypes = new Set(selectedAnswerTypes);
                                    if (e.target.checked) {
                                      newTypes.add(type as any);
                                    } else if (newTypes.size > 1) {
                                      newTypes.delete(type as any);
                                    }
                                    setSelectedAnswerTypes(newTypes);
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-white text-sm">
                                  {type === 'hanViet' && 'Hán-Việt'}
                                  {type === 'onyomi' && 'Onyomi'}
                                  {type === 'vietnamese' && 'Vietnamese'}
                                  {type === 'english' && 'English'}
                                </span>
                              </label>
                            ))}
                          </div>
                          <div className="border-t border-gray-700 p-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startQuizFromSection(index, Array.from(selectedAnswerTypes)[0]);
                              }}
                              className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors font-medium"
                            >
                              Start Quiz
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {section.expanded && (
            <div className="p-3" style={{ backgroundColor: section.colors?.body }}>
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fill, ${fixedCardSize}rem)`,
                  gap: '4px',
                  justifyContent: 'center',
                }}
              >
                {section.kanjis.map((kanji) => {
                  const isChosen = chosenKanjis.some(k => k.kanji === kanji.kanji);
                  return (
                    <KanjiCard
                      key={kanji.kanji}
                      kanji={kanji}
                      isChosen={isChosen}
                      colors={section.colors}
                      onClick={() => handleKanjiClick(kanji)}
                      kanjiFont={inputPanelSettings.kanjiFont}
                      kanjiSize={calculatedKanjiSize}
                      hanVietFont={inputPanelSettings.hanVietFont}
                      hanVietSize={calculatedHanVietSize}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
      })}
      
      {showCountdown && <QuizCountdown onComplete={handleCountdownComplete} />}
    </div>
  );
}

export default InputPanel;
