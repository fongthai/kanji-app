import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { setCurrentPage } from '../../features/worksheet/worksheetSlice';

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onHeightChange?: (height: number) => void;
}

export function Paginator({ currentPage, totalPages, onHeightChange }: PaginatorProps) {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputPage, setInputPage] = useState(currentPage.toString());
  const [error, setError] = useState('');

  // Report height changes to parent
  useEffect(() => {
    if (containerRef.current && onHeightChange) {
      const height = containerRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, [onHeightChange]);

  // Sync input with current page
  useEffect(() => {
    setInputPage(currentPage.toString());
    setError('');
  }, [currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      // Don't intercept if user is typing in an input or textarea
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      switch (e.key) {
        case 'Home':
          e.preventDefault();
          handleFirst();
          break;
        case 'End':
          e.preventDefault();
          handleLast();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const handleFirst = () => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(1));
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };

  const handleLast = () => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(totalPages));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputPage(value);
    setError('');
  };

  const handleInputBlur = () => {
    const pageNum = parseInt(inputPage, 10);
    
    if (isNaN(pageNum)) {
      setError('Invalid page number');
      setInputPage(currentPage.toString());
      return;
    }

    if (pageNum < 1 || pageNum > totalPages) {
      setError(`Page must be between 1 and ${totalPages}`);
      setInputPage(currentPage.toString());
      return;
    }

    dispatch(setCurrentPage(pageNum));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  if (totalPages <= 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center gap-2 bg-white py-3 px-4 rounded shadow"
    >
      {/* First Button */}
      <button
        onClick={handleFirst}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="First page (Home)"
      >
        First
      </button>

      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Previous page (←)"
      >
        ← Prev
      </button>

      {/* Page Input / Total */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={inputPage}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-16 px-2 py-1 text-center text-sm font-semibold text-blue-700 bg-blue-50 border-2 border-blue-300 rounded focus:border-blue-500 focus:bg-white focus:outline-none"
              title="Enter page number and press Enter"
            />
            <span className="text-gray-600 font-medium">/</span>
            <span className="w-16 px-2 py-1 text-center text-sm text-gray-600 bg-gray-50 rounded">
              {totalPages}
            </span>
          </div>
          {error && (
            <span className="text-xs text-red-500 mt-1">{error}</span>
          )}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Next page (→)"
      >
        Next →
      </button>

      {/* Last Button */}
      <button
        onClick={handleLast}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Last page (End)"
      >
        Last
      </button>
    </div>
  );
}
