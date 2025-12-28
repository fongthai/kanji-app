import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import type { KanjiData } from '../kanji/kanjiSlice';
import { executeKQLQuery, getKQLSuggestions, validateKQLSyntax } from '../../utils/kqlParser';
import { EXAMPLES, STATIC_FILTERS } from './searchExamples';
import { getRandomCategoryChips, type CategoryChip } from './categoryChips';
import { highlightKQLSyntax } from '../../utils/kqlSyntaxHighlighter';
import { CategoryBrowser } from './CategoryBrowser';

interface MinimalSearchProps {
  onResultsChange: (results: KanjiData[]) => void;
  onToast?: (message: string) => void;
}

export const MinimalSearch: React.FC<MinimalSearchProps> = ({ onResultsChange, onToast }) => {
  const allKanjis = useAppSelector((state) => state.kanji.allKanjis);
  
  const [query, setQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [syntaxError, setSyntaxError] = useState<{ message: string; position: number } | null>(null);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [savedQueries, setSavedQueries] = useState<Array<{ name: string; query: string }>>([]);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
  const [categoryChips, setCategoryChips] = useState<CategoryChip[]>([]);
  const [showCategoryBrowser, setShowCategoryBrowser] = useState(false);
  const [triggerShake, setTriggerShake] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const savedDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized syntax highlighting
  const highlightedSegments = useMemo(() => highlightKQLSyntax(query), [query]);

  // Load saved queries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kql-saved-queries');
    if (saved) {
      try {
        setSavedQueries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved queries:', e);
      }
    }
  }, []);

  // Rotate examples every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and rotate category chips every 45 seconds
  useEffect(() => {
    // Initial load
    setCategoryChips(getRandomCategoryChips(3));
    
    // Rotate every 45 seconds
    const interval = setInterval(() => {
      setCategoryChips(getRandomCategoryChips(3));
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
      if (savedDropdownRef.current && !savedDropdownRef.current.contains(event.target as Node)) {
        setShowSavedDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search execution (auto-search while typing)
  const executeSearch = useCallback((searchQuery: string, validateFirst: boolean = false) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        onResultsChange([]);
        setSyntaxError(null);
        setShowErrorPopup(false);
        return;
      }

      // Only validate if explicitly requested (on Enter/Blur)
      if (validateFirst) {
        const validation = validateKQLSyntax(searchQuery);
        if (!validation.valid) {
          const error = validation.errors[0];
          setSyntaxError({ 
            message: error?.message || 'Invalid syntax',
            position: error?.position || 0
          });
          setShowErrorPopup(true);
          onResultsChange([]);
          // Trigger shake animation only on explicit execution
          setTriggerShake(true);
          setTimeout(() => {
            setTriggerShake(false);
            setShowErrorPopup(false);
          }, 3000);
          return;
        }
      }

      setSyntaxError(null);
      setShowErrorPopup(false);
      
      const { results, errors } = executeKQLQuery(searchQuery, allKanjis);
      
      if (errors.length > 0) {
        if (validateFirst) {
          const error = errors[0];
          setSyntaxError({ 
            message: error?.message || 'Query error',
            position: error?.position || 0
          });
          setShowErrorPopup(true);
          onResultsChange([]);
          setTriggerShake(true);
          setTimeout(() => {
            setTriggerShake(false);
            setShowErrorPopup(false);
          }, 3000);
        }
        return;
      }
      
      onResultsChange(results);
      
      // Only shake on no results if explicitly executed
      if (results.length === 0 && validateFirst) {
        setTriggerShake(true);
        setTimeout(() => setTriggerShake(false), 600);
      }
    }, validateFirst ? 0 : 300); // No delay for explicit execution
  }, [allKanjis, onResultsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Sync overlay scroll with textarea scroll
    if (highlightRef.current && inputRef.current) {
      highlightRef.current.scrollTop = inputRef.current.scrollTop;
    }

    // Get autocomplete suggestions
    if (newQuery.trim()) {
      const cursorPos = e.target.selectionStart || newQuery.length;
      const newSuggestions = getKQLSuggestions(newQuery, cursorPos);
      setSuggestions(newSuggestions);
      setShowAutocomplete(newSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowAutocomplete(false);
    }

    // Execute search
    executeSearch(newQuery);
  };
  
  const handleInputScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    // Sync overlay scroll with textarea scroll
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only handle specific autocomplete keys, let everything else pass through
    if (e.key === 'Tab' && showAutocomplete && suggestions.length > 0) {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: Previous suggestion
        setSelectedSuggestionIndex((prev) => {
          if (prev <= 0) return suggestions.length - 1;
          return prev - 1;
        });
      } else {
        // Tab: Next suggestion
        setSelectedSuggestionIndex((prev) => {
          if (prev < 0) return 0;
          return prev < suggestions.length - 1 ? prev + 1 : 0;
        });
      }
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showAutocomplete && selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        applySuggestion(suggestions[selectedSuggestionIndex]);
      } else {
        executeSearch(query, true);
      }
      return;
    }
    
    if (e.key === 'Escape' && showAutocomplete) {
      e.preventDefault();
      setShowAutocomplete(false);
      setSelectedSuggestionIndex(-1);
      return;
    }
    
    // All other keys (arrows, Home, End, typing, etc.) - default textarea behavior
  };

  const applySuggestion = (suggestion: string) => {
    // Get cursor position
    const cursorPos = inputRef.current?.selectionStart || query.length;
    
    // Find the start of the current word being completed
    const beforeCursor = query.slice(0, cursorPos);
    const lastSpaceIndex = beforeCursor.lastIndexOf(' ');
    const wordStart = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;
    
    // Build the new query: before + suggestion + after
    const before = query.slice(0, wordStart);
    const after = query.slice(cursorPos);
    const newQuery = before + suggestion + ' ' + after;
    
    setQuery(newQuery);
    setShowAutocomplete(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // Move cursor to after the inserted suggestion
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = wordStart + suggestion.length + 1;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current.focus();
      }
    }, 0);
    
    executeSearch(newQuery, false);
  };

  const handleBlur = () => {
    // Validate query when user clicks away (but don't execute)
    if (query.trim()) {
      const validation = validateKQLSyntax(query);
      if (!validation.valid) {
        const error = validation.errors[0];
        setSyntaxError({ 
          message: error?.message || 'Invalid syntax',
          position: error?.position || 0
        });
      } else {
        setSyntaxError(null);
      }
    }
  };

  const handleSaveQuery = () => {
    if (!query.trim()) {
      onToast?.('Please enter a query first');
      return;
    }

    const name = prompt('Enter a name for this query:');
    if (!name) return;

    const newQuery = { name, query };
    const updated = [...savedQueries, newQuery].slice(-10); // Keep last 10
    setSavedQueries(updated);
    localStorage.setItem('kql-saved-queries', JSON.stringify(updated));
    onToast?.('Query saved!');
  };

  const handleLoadSavedQuery = (savedQuery: string) => {
    setQuery(savedQuery);
    setShowSavedDropdown(false);
    executeSearch(savedQuery);
  };

  const handleDeleteSavedQuery = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedQueries.filter((_, i) => i !== index);
    setSavedQueries(updated);
    localStorage.setItem('kql-saved-queries', JSON.stringify(updated));
    onToast?.('Query deleted');
  };

  const handleExampleClick = () => {
    const example = EXAMPLES[currentExampleIndex];
    setQuery(example);
    executeSearch(example);
    inputRef.current?.focus();
  };

  const handleChipClick = (chipQuery: string) => {
    const isActive = activeChips.has(chipQuery);
    const newActiveChips = new Set(activeChips);

    if (isActive) {
      newActiveChips.delete(chipQuery);
    } else {
      newActiveChips.add(chipQuery);
    }

    setActiveChips(newActiveChips);

    // Build combined query from active chips
    if (newActiveChips.size === 0) {
      setQuery('');
      onResultsChange([]);
    } else {
      const combined = Array.from(newActiveChips).join(' & ');
      setQuery(combined);
      executeSearch(combined);
    }
  };

  const handleRemoveChip = (chipQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newActiveChips = new Set(activeChips);
    newActiveChips.delete(chipQuery);
    setActiveChips(newActiveChips);

    if (newActiveChips.size === 0) {
      setQuery('');
      onResultsChange([]);
    } else {
      const combined = Array.from(newActiveChips).join(' & ');
      setQuery(combined);
      executeSearch(combined);
    }
  };

  const handleCategoryBrowserApply = (query: string) => {
    setQuery(query);
    executeSearch(query, true);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2 relative">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-gray-500 z-10">🔍</span>
            
            {/* Syntax Highlighting Overlay - scrollable container */}
            <div
              ref={highlightRef}
              className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden rounded-lg z-10"
              style={{
                height: '4.5rem'
              }}
              aria-hidden="true"
            >
              <div className="pl-9 pr-2 py-1.5 whitespace-pre-wrap font-mono text-xs break-words"
                style={{
                  lineHeight: '1.5'
                }}
              >
                {highlightedSegments.map((segment, index) => (
                  <span key={index} className={segment.color}>
                    {segment.text}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Actual Textarea (very dim text for cursor visibility, overlay provides main colors) */}
            <textarea
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onScroll={handleInputScroll}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="hanviet:NGHỈ | en:rest | freq:>500 ..."
              readOnly={false}
              disabled={false}
              tabIndex={0}
              className={`w-full pl-9 pr-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 font-mono text-xs bg-gray-700 placeholder-gray-500 resize-none overflow-y-auto ${
                syntaxError && showErrorPopup
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-blue-500'
              } ${triggerShake ? 'animate-flash-shake' : ''}`}
              style={{
                color: 'transparent',
                caretColor: 'white',
                WebkitTextFillColor: 'transparent',
                height: '4.5rem',
                maxHeight: '4.5rem'
              }}
              spellCheck={false}
            />
            {/* Error position indicator - red underline */}
            {syntaxError && query && (
              <div 
                className="absolute bottom-0 h-0.5 bg-red-400"
                style={{
                  left: `${Math.min((syntaxError.position / query.length) * 100, 95)}%`,
                  width: '5%'
                }}
              />
            )}
            {/* Error popup - only show on explicit validation */}
            {syntaxError && showErrorPopup && (
              <div className="absolute left-0 top-full mt-2 z-10">
                <div className="bg-red-50 border-2 border-red-500 rounded-lg px-3 py-2 shadow-lg max-w-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 text-lg">⚠️</span>
                    <div>
                      <div className="text-xs font-semibold text-red-700">Invalid KQL Syntax</div>
                      <div className="text-xs text-red-600 mt-1">{syntaxError.message}</div>
                      <div className="text-xs text-gray-400 mt-1">Position: {syntaxError.position}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={handleSaveQuery}
            className="px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex-shrink-0"
            title="Save Query"
          >
            💾
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowSavedDropdown(!showSavedDropdown)}
              className="px-2 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex-shrink-0"
              title="Load Saved Queries"
            >
              📚
            </button>
            
            {/* Saved Queries Dropdown */}
            {showSavedDropdown && (
              <div
                ref={savedDropdownRef}
                className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50"
              >
                {savedQueries.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No saved queries yet
                  </div>
                ) : (
                  <div className="p-2">
                    {savedQueries.map((saved, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-700 rounded cursor-pointer group"
                        onClick={() => handleLoadSavedQuery(saved.query)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-200">{saved.name}</div>
                            <div className="text-xs text-gray-400 truncate">{saved.query}</div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteSavedQuery(index, e)}
                            className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && (
          <div
            ref={autocompleteRef}
            className="absolute left-0 right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer ${
                  index === selectedSuggestionIndex
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-200'
                }`}
                onClick={() => applySuggestion(suggestion)}
              >
                <code className="text-sm">{suggestion}</code>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {/* Static filters (JLPT, Top 100, KOTY) */}
        {STATIC_FILTERS.map((filter) => {
          const isActive = activeChips.has(filter.query);
          return (
            <button
              key={filter.query}
              onClick={() => handleChipClick(filter.query)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter.label}
              {isActive && (
                <span
                  onClick={(e) => handleRemoveChip(filter.query, e)}
                  className="ml-1 font-bold"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
        
        {/* Rotating category chips */}
        {categoryChips.map((chip) => {
          const isActive = activeChips.has(chip.query);
          return (
            <button
              key={chip.query}
              onClick={() => handleChipClick(chip.query)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {chip.label}
              {isActive && (
                <span
                  onClick={(e) => handleRemoveChip(chip.query, e)}
                  className="ml-1 font-bold"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
        
        {/* Category Browser Button */}
        <button
          onClick={() => setShowCategoryBrowser(true)}
          className="px-3 py-1 rounded-full text-sm transition-colors bg-purple-600 text-white hover:bg-purple-700"
          title="Browse all 53 categories"
        >
          📂 All Categories
        </button>
      </div>

      {/* Rotating Example */}
      <div className="text-xs text-gray-400 h-5 flex items-center">
        <span className="mr-1 flex-shrink-0">ⓘ Try:</span>
        <code
          onClick={handleExampleClick}
          className="cursor-pointer text-blue-400 hover:underline truncate"
        >
          {EXAMPLES[currentExampleIndex]}
        </code>
      </div>
      
      {/* Category Browser Modal */}
      <CategoryBrowser
        isOpen={showCategoryBrowser}
        onClose={() => setShowCategoryBrowser(false)}
        onApply={handleCategoryBrowserApply}
      />
    </div>
  );
};
