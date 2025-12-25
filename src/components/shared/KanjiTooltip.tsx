import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { KanjiData } from '../../features/kanji/kanjiSlice';
import { useAppSelector } from '../../app/hooks';

interface KanjiTooltipProps {
  kanji: KanjiData;
  children: React.ReactNode;
}

export const KanjiTooltip: React.FC<KanjiTooltipProps> = ({ kanji, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showBelow, setShowBelow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get all kanjis to lookup han-viet for components and lookalikes
  const allKanjis = useAppSelector(state => state.kanji.allKanjis);
  
  // Helper function to lookup han-viet for a kanji character
  const getHanViet = (kanjiChar: string): string | null => {
    const found = allKanjis.find(k => k.kanji === kanjiChar);
    return found?.sinoViet || null;
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Clear any pending hide timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Clear any pending show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Viewport boundaries
    const tooltipWidth = 448; // max-w-md = 448px (wider for better layout)
    const tooltipHeight = 500; // adjusted for optimized spacing
    const margin = 16; // safety margin
    
    // Calculate horizontal position
    let x = rect.left + rect.width / 2;
    
    // Adjust horizontal position if tooltip would overflow
    if (x - tooltipWidth / 2 < margin) {
      x = tooltipWidth / 2 + margin; // Too far left (common in input panel)
    } else if (x + tooltipWidth / 2 > window.innerWidth - margin) {
      x = window.innerWidth - tooltipWidth / 2 - margin; // Too far right
    }
    
    // Calculate vertical position and direction
    let y;
    let below = false;
    
    const wouldOverflowTop = rect.top - tooltipHeight - 10 < margin;
    const wouldOverflowBottom = rect.bottom + tooltipHeight + 10 > window.innerHeight - margin;
    
    if (wouldOverflowTop && !wouldOverflowBottom) {
      // Show below card if it doesn't fit above but fits below
      y = rect.bottom + 10;
      below = true;
    } else if (wouldOverflowTop && wouldOverflowBottom) {
      // If it doesn't fit either way, center vertically with scroll
      y = Math.max(margin + 200, rect.top - 100);
      below = true;
    } else {
      // Show above card (default)
      y = rect.top - 10;
      below = false;
    }
    
    // Set all states together to avoid flash
    setShowBelow(below);
    setPosition({ x, y });
    
    // Delay showing tooltip by 1000ms to prevent accidental triggers
    showTimeoutRef.current = setTimeout(() => {
      // Use requestAnimationFrame to ensure position is set before showing
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, 1000);
  };

  const handleMouseLeave = () => {
    // Clear show timeout if mouse leaves before tooltip appears
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    // Delay hiding to allow mouse to move into tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150); // 150ms delay
  };
  
  const handleTooltipMouseEnter = () => {
    // Clear both timeouts if mouse enters tooltip
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  };
  
  const handleTooltipMouseLeave = () => {
    // Hide tooltip when mouse leaves tooltip
    setIsVisible(false);
  };

  // Format readings
  const onyomiText = kanji.onyomi?.length > 0 ? kanji.onyomi.join(', ') : '';
  const kunyomiText = kanji.kunyomi?.length > 0 ? kanji.kunyomi.join(', ') : '';
  const readingsText = [onyomiText, kunyomiText].filter(Boolean).join(' / ');
  
  // Format info badges
  const infoParts: string[] = [];
  if (kanji.jlptLevel) infoParts.push(kanji.jlptLevel);
  if (kanji.gradeLevel) infoParts.push(`Grade ${kanji.gradeLevel}`);
  if (kanji.frequency) infoParts.push(`Freq ${kanji.frequency}`);
  const infoText = infoParts.join(' • ');
  
  // Parse components (comma-separated)
  const componentsList = kanji.components
    ? kanji.components.split(',').map(c => c.trim()).filter(c => c.length > 0)
    : [];
  
  // Parse lookalikes (comma-separated or array for legacy data)
  const lookalikesList = kanji.lookalikes
    ? (typeof kanji.lookalikes === 'string' 
        ? kanji.lookalikes.split(',').map(l => l.trim()).filter(l => l.length > 0)
        : Array.isArray(kanji.lookalikes) 
          ? kanji.lookalikes 
          : [])
    : [];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {children}
      
      {isVisible && createPortal(
        <div
          className="fixed z-[9999]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: showBelow ? 'translate(-50%, 0%)' : 'translate(-50%, -100%)',
            opacity: 1,
            transition: 'opacity 0.15s ease-in',
            maxHeight: `${window.innerHeight - 32}px`,
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 px-4 py-3 max-w-md overflow-y-auto select-text" style={{ maxHeight: `${window.innerHeight - 64}px` }}>
            {/* Kanji Character - OPTIMIZED SIZE */}
            <div className="text-center text-5xl font-bold mb-2">
              {kanji.kanji}
            </div>
            
            {/* INFO Section */}
            {infoText && (
              <div className="text-xs text-gray-400 text-center mb-2 pb-2 border-b border-gray-700">
                ℹ️ {infoText}
              </div>
            )}
            
            {/* READINGS Section */}
            <div className="mb-2 pb-2 border-b border-gray-700">
              <div className="text-xs font-semibold text-gray-400 mb-1">📖 READINGS</div>
              {kanji.sinoViet && (
                <div className="text-lg font-semibold text-blue-300 mb-1">
                  {kanji.sinoViet}
                </div>
              )}
              {readingsText && (
                <div className="text-sm text-yellow-200 font-mono">
                  {readingsText}
                </div>
              )}
            </div>
            
            {/* MEANINGS Section */}
            <div className="mb-2 pb-2 border-b border-gray-700">
              <div className="text-xs font-semibold text-gray-400 mb-1">📝 MEANINGS</div>
              <div className="text-sm">
                <span className="text-gray-300">{kanji.meaning}</span>
                {kanji.vietnameseMeaning && (
                  <>
                    {' • '}
                    <span className="text-green-300">{kanji.vietnameseMeaning}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* WRITING Section */}
            {(kanji.components || kanji.lookalikes) && (
              <div className="mb-2 pb-2 border-b border-gray-700">
                <div className="text-xs font-semibold text-gray-400 mb-1">✍️ WRITING</div>
                
                {/* Components - show with han-viet next to each */}
                {kanji.components && componentsList.length > 0 && (
                  <div className="mb-2">
                    <div className="text-sm text-gray-400 mb-1">Components:</div>
                    <div className="flex flex-wrap gap-2">
                      {componentsList.map((component, idx) => {
                        const hanViet = getHanViet(component);
                        return (
                          <div key={idx} className="text-base text-cyan-300 font-semibold">
                            {component}
                            {hanViet && (
                              <span className="text-xs text-cyan-400 ml-1">({hanViet})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Lookalikes - show line by line with han-viet */}
                {kanji.lookalikes && lookalikesList.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Lookalikes:</div>
                    <div className="space-y-1">
                      {lookalikesList.map((lookalike, idx) => {
                        const hanViet = getHanViet(lookalike);
                        return (
                          <div key={idx} className="text-base text-pink-300 font-semibold">
                            {lookalike}
                            {hanViet && (
                              <span className="text-xs text-pink-400 ml-1">({hanViet})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* LEARNING AIDS Section */}
            {(kanji.vietnameseMnemonic || kanji.lucThu) && (
              <div>
                <div className="text-xs font-semibold text-gray-400 mb-1">💡 LEARNING AIDS</div>
                {kanji.vietnameseMnemonic && (
                  <div className="text-sm text-purple-300 italic mb-1">
                    💡 {kanji.vietnameseMnemonic}
                  </div>
                )}
                {kanji.lucThu && (
                  <div className="text-sm text-orange-300">
                    🖋️ Lục thư: {kanji.lucThu}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Tooltip Arrow */}
          {!showBelow && (
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 pointer-events-none"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid rgb(55, 65, 81)', // gray-700
              }}
            />
          )}
          {showBelow && (
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-2 pointer-events-none"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid rgb(55, 65, 81)', // gray-700
              }}
            />
          )}
        </div>,
        document.body
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -100%) translateY(-5px); }
          to { opacity: 1; transform: translate(-50%, -100%) translateY(0); }
        }
      `}</style>
    </div>
  );
};
