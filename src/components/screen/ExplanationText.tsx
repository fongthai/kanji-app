import React from 'react';
import { type KanjiData } from '../../features/kanji/kanjiSlice';

interface ExplanationTextProps {
  kanji: KanjiData;
  maxWidth: number; // Available width in pixels
  className?: string;
  lineCount?: 1 | 2 | 3; // Number of lines to display (default: 3)
}

/**
 * ExplanationText - 3-line info display for kanji metadata
 * 
 * Line 1: KANJI | JLPT-LEVEL | HAN-VIET | ONYOMI | KUNYOMI | COMPONENTS
 * Line 2: ENGLISH-MEANING | VIETNAMESE-MEANING
 * Line 3: VIET-MNEMONICS
 * 
 * Truncates at end with ellipsis if too long
 */
export const ExplanationText: React.FC<ExplanationTextProps> = ({
  kanji,
  maxWidth,
  className = '',
  lineCount = 3,
}) => {
  // Helper function to truncate text
  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };
  
  // Calculate max characters based on width (approximate)
  // More generous estimation to use available space (avg char width ~5px at base font size)
  const estimatedMaxChars = Math.floor(maxWidth / 5);
  
  // Line 1: KANJI | JLPT-LEVEL | HAN-VIET | ONYOMI | KUNYOMI | COMPONENTS
  const line1Parts: string[] = [
    kanji.kanji,
    kanji.jlptLevel || '',
    kanji.hanViet,
    kanji.onyomi.join(', '),
    kanji.kunyomi.join(', '),
    kanji.components || '',
  ];
  const line1 = truncate(line1Parts.filter(Boolean).join(' | '), estimatedMaxChars);
  
  // Line 2: ENGLISH-MEANING | VIETNAMESE-MEANING
  const line2Parts: string[] = [
    kanji.meaning || '',
    kanji.vietnameseMeaning || '',
  ];
  const line2 = truncate(line2Parts.filter(Boolean).join(' | '), estimatedMaxChars);
  
  // Line 3: VIET-MNEMONICS
  const line3 = kanji.vietnameseMnemonic
    ? truncate(kanji.vietnameseMnemonic, estimatedMaxChars)
    : '';
  
  return (
    <div
      className={`explanation-text text-sm text-gray-700 space-y-0.5 ${className}`}
      style={{
        maxWidth: `${maxWidth}px`,
      }}
    >
      {/* Line 1 */}
      <div className="font-medium truncate" title={line1Parts.filter(Boolean).join(' | ')}>
        {line1}
      </div>
      
      {/* Line 2 */}
      {lineCount >= 2 && line2 && (
        <div className="truncate" title={line2Parts.filter(Boolean).join(' | ')}>
          {line2}
        </div>
      )}
      
      {/* Line 3 */}
      {lineCount >= 3 && line3 && (
        <div className="italic text-gray-600 truncate" title={kanji.vietnameseMnemonic || ''}>
          {line3}
        </div>
      )}
    </div>
  );
};
