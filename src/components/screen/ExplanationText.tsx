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
  // Helper function to truncate text
  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };
  
  // Calculate max characters based on width (approximate)
  // More generous estimation to use available space (avg char width ~5px at base font size)
  const estimatedMaxChars = Math.floor(maxWidth / 5);
  
  // Build Line 1: KANJI | HAN-VIET | ON: ONYOMI | KUN: KUNYOMI | 🤯LOOKALIKES🤔
  const line1Parts: string[] = [
    kanji.kanji,
    kanji.hanViet,
    `ON: ${kanji.onyomi.join(', ')}`,
    `KUN: ${kanji.kunyomi.join(', ')}`,
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
  
  // Check if Line 1 overflows by measuring actual visual width
  // For now, use character-based estimation with measured max width
  const estimatedMaxCharsForLine1 = Math.floor(measuredMaxWidth / 5);
  const line1OverflowsVisually = line1FullText.length > estimatedMaxCharsForLine1;
  
  // DEBUG LOGS
  console.log('=== ExplanationText Debug ===');
  console.log('Kanji:', kanji.kanji);
  console.log('maxWidth:', maxWidth);
  console.log('measuredMaxWidth:', measuredMaxWidth);
  console.log('estimatedMaxCharsForLine1:', estimatedMaxCharsForLine1);
  console.log('line1FullText length:', line1FullText.length);
  console.log('line1OverflowsVisually:', line1OverflowsVisually);
  console.log('=============================');
  
  return (
    <>
      {/* Hidden element to measure reference string width */}
      <div 
        ref={measureRef}
        className="text-sm font-medium absolute opacity-0 pointer-events-none whitespace-nowrap"
        style={{ left: '-9999px' }}
      >
        {referenceString}
      </div>
      
      <div
        className={`explanation-text text-sm text-gray-700 space-y-0.5 overflow-hidden ${className}`}
        style={{
          maxWidth: `${maxWidth}px`,
        }}
      >
        {line1OverflowsVisually ? (
          // Line 1 overflows: Display as 3 lines
          <>
            {/* Line 1 content wraps to 2 lines */}
            <div className="font-medium" style={{ maxWidth: `${maxWidth}px` }} title={line1FullText}>
              {line1FullText}
            </div>
            
            {/* Line 2: Meanings (always show when overflow) */}
            <div 
              className="overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ width: '100%', maxWidth: `${maxWidth}px` }}
              title={meaningText}
            >
              {meaningText}
            </div>
            
            {/* Line 3: Mnemonics (if checked) */}
            {lineCount >= 3 && line3 && (
              <div className="italic text-gray-600 truncate" title={line3}>
                {line3}
              </div>
            )}
          </>
        ) : (
          // Line 1 fits: Normal 2-3 line layout
          <>
            {/* Line 1 */}
            <div className="font-medium truncate" title={line1FullText}>
              {line1FullText}
            </div>
            
            {/* Line 2 - Show if lineCount >= 2 */}
            {lineCount >= 2 && meaningText && (
              <div 
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ width: '100%', maxWidth: `${maxWidth}px` }} 
                title={meaningText}
              >
                {meaningText}
              </div>
            )}
            
            {/* Line 3 */}
            {lineCount >= 3 && line3 && (
              <div className="italic text-gray-600 truncate" title={line3}>
                {line3}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
