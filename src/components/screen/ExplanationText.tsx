import React, { useRef, useEffect, useState } from 'react';
import { type KanjiData } from '../../features/kanji/kanjiSlice';

interface ExplanationTextProps {
  kanji: KanjiData;
  maxWidth: number; // Available width in pixels
  className?: string;
  lineCount?: 1 | 2 | 3; // Number of lines to display (default: 3)
}

/**
 * ExplanationText - 2-3 line info display for kanji metadata
 * 
 * Line 1: KANJI | HAN-VIET | ON: ONYOMI | KUN: KUNYOMI | 🤯LOOKALIKES🤔 (if not empty)
 * Line 2: 🇻🇳 VIETNAMESE-MEANING | 🇺🇸 ENGLISH-MEANING
 * Line 3: VIET-MNEMONICS (optional)
 * 
 * Truncates at end with ellipsis if too long
 */
export const ExplanationText: React.FC<ExplanationTextProps> = ({
  kanji,
  maxWidth,
  className = '',
  lineCount = 3,
}) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [measuredMaxWidth, setMeasuredMaxWidth] = useState<number>(maxWidth);
  
  // Reference string to measure actual visual width
  const referenceString = "上 | THƯỢNG, THƯỚNG | ON: ジョウ, ショウ | KUN: うえ, -うえ, うわ-, かみ, あ.げる, -あ.げる, あ";
  
  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.offsetWidth;
      setMeasuredMaxWidth(width);
    }
  }, []);
  
  // Build Line 1: KANJI | HAN-VIET | ON: ONYOMI | KUN: KUNYOMI | 🤯LOOKALIKES🤔
  const hasKunyomi = kanji.kunyomi.length > 0;
  const kunPart = hasKunyomi 
    ? `KUN: ${kanji.kunyomi.join(', ')}`
    : `KUN:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`; // Non-breaking spaces for manual writing
  
  const line1Parts: string[] = [
    kanji.kanji,
    kanji.hanViet,
    `ON: ${kanji.onyomi.join(', ')}`,
    kunPart,
  ];
  // Only add lookalikes if the field exists and is not empty
  if (kanji.lookalikes) {
    const lookalikeText = Array.isArray(kanji.lookalikes) 
      ? kanji.lookalikes.join(', ') 
      : kanji.lookalikes;
    if (lookalikeText.trim()) {
      line1Parts.push(`🤯 ${lookalikeText} 🤔`);
    }
  }
  const line1FullText = line1Parts.filter(Boolean).join(' | ');
  
  // Build Line 2 content: 🇻🇳 VIETNAMESE-MEANING | 🇺🇸 ENGLISH-MEANING
  const line2Parts: string[] = [
    kanji.vietnameseMeaning ? `🇻🇳 ${kanji.vietnameseMeaning}` : '',
    kanji.meaning ? `🇺🇸 ${kanji.meaning}` : '',
  ];
  const meaningText = line2Parts.filter(Boolean).join(' | ');
  
  // Line 3: VIET-MNEMONICS
  const line3 = kanji.vietnameseMnemonic || '';
  
  // Helper function to truncate text
  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };
  
  // Conservative estimate to match PDF behavior (divide by 4 for wider glyphs)
  // Use same formula as PDF: (width / 1.33) / 4
  const estimatedMaxChars = Math.floor((measuredMaxWidth / 1.33) / 3.53);
  
  // Helper to render text with bold labels (ON:, KUN:, 🇻🇳, 🇺🇸)
  const renderWithBold = (text: string) => {
    const parts = text.split(/(\bON:|\bKUN:|🇻🇳|🇺🇸)/);
    return (
      <>
        {parts.map((part, i) => 
          (part === 'ON:' || part === 'KUN:' || part === '🇻🇳' || part === '🇺🇸') 
            ? <strong key={i}>{part}</strong> 
            : part
        )}
      </>
    );
  };
  
  // Algorithm: Same as PDF - ensure lines 1+2 always take exactly 2 physical lines
  let line1A: string; // Physical line 1
  let line2: string;  // Physical line 2
  
  if (line1FullText.length <= estimatedMaxChars) {
    // Line 1 fits in one physical line
    line1A = line1FullText;
    // Line 2 is just meanings
    line2 = meaningText;
  } else {
    // Line 1 is too long - split it
    line1A = line1FullText.substring(0, estimatedMaxChars);
    const line1B = line1FullText.substring(estimatedMaxChars);
    
    // Line 2: Combine line1B + meaningLine
    line2 = meaningText 
      ? `${line1B} | ${meaningText}` 
      : line1B;
  }
  
  // Truncate line2 if needed
  const line2Final = truncate(line2, estimatedMaxChars);
  
  return (
    <>
      {/* Hidden element to measure reference string width */}
      <div 
        ref={measureRef}
        className="font-medium absolute opacity-0 pointer-events-none whitespace-nowrap"
        style={{ left: '-9999px', fontSize: '11px' }}
      >
        {referenceString}
      </div>
      
      <div
        className={`explanation-text text-gray-700 space-y-0.5 overflow-hidden ${className}`}
        style={{ maxWidth: `${maxWidth}px`, fontSize: '11px' }}
      >
        {/* Physical Line 1: line1A */}
        <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis" title={line1FullText}>
          {renderWithBold(line1A)}
        </div>
        
        {/* Physical Line 2: line1B + meanings (or just meanings) */}
        {lineCount >= 2 && line2Final && (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={line2}>
            {renderWithBold(line2Final)}
          </div>
        )}
        
        {/* Physical Line 3: Vietnamese mnemonics */}
        {lineCount >= 3 && line3 && (
          <div className="italic text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={line3}>
            {line3}
          </div>
        )}
      </div>
    </>
  );
};
