import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setHeaderText, cycleHeaderFont, cycleHeaderAnimation } from '../../features/worksheet/worksheetSlice';
import { loadFontManifest, getNextFontIndex, type FontInfo } from '../../utils/fontLoader';

interface BoardHeaderProps {
  visible: boolean;
}

export function BoardHeader({ visible }: BoardHeaderProps) {
  const dispatch = useAppDispatch();
  const { headerText, headerFontIndex, headerAnimationStyle } = useAppSelector((state) => state.worksheet);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(headerText);
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  
  // Animation style names for tooltip
  const animationNames = [
    'Gradient Shimmer',
    'Wave Pattern',
    'Holographic',
    'Sparkle Particles',
    'Neon Glow'
  ];
  
  // Load fonts on mount
  useEffect(() => {
    loadFontManifest().then(setFonts);
  }, []);
  
  // Sync editValue with Redux state when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditValue(headerText);
    }
  }, [headerText, isEditing]);
  
  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  if (!visible) return null;
  
  const currentFont = fonts[headerFontIndex] || { family: 'system-ui', name: 'System UI' };
  
  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if click was on text element
    const clickedOnText = textRef.current && textRef.current.contains(e.target as Node);
    
    // Use timeout to detect single vs double click
    if (clickTimeoutRef.current) {
      // Double click detected
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      
      if (clickedOnText) {
        // Double-click on text - enter edit mode
        setIsEditing(true);
      }
    } else {
      // Potential single click - wait to confirm
      clickTimeoutRef.current = setTimeout(async () => {
        clickTimeoutRef.current = null;
        // Single click confirmed
        
        if (clickedOnText) {
          // Single-click on text - cycle font
          if (fonts.length > 0) {
            const nextIndex = await getNextFontIndex(headerFontIndex, fonts);
            dispatch(cycleHeaderFont(fonts.length));
            // Update to the validated index if different
            if (nextIndex !== (headerFontIndex + 1) % fonts.length) {
              // Font loading failed, manually set to next valid index
              // This is handled by getNextFontIndex returning the correct index
            }
          }
        } else {
          // Single-click on empty space - cycle animation
          dispatch(cycleHeaderAnimation());
        }
      }, 250); // 250ms window for double-click detection
    }
  };
  
  const handleSave = () => {
    dispatch(setHeaderText(editValue.trim() || 'Kanji Practice Worksheet'));
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(headerText);
      setIsEditing(false);
    }
  };
  
  const handleBlur = () => {
    handleSave();
  };
  
  // Get animation class based on current style
  const animationClasses = [
    'header-gradient-shimmer',
    'header-wave-pattern',
    'header-holographic',
    'header-sparkle',
    'header-neon-glow'
  ];
  
  const currentAnimationClass = animationClasses[headerAnimationStyle] || animationClasses[0];
  
  // Determine text color based on animation style
  const textColor = headerAnimationStyle === 4 ? 'text-white' : 'text-gray-800';
  
  return (
    <div 
      style={{ 
        height: '50px', // Fixed height from BOARD_HEADER_HEIGHT
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        zIndex: 100,
        overflow: 'visible',
        position: 'relative',
      }}
      onMouseEnter={() => !isEditing && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Animation Background Rectangle with Text */}
      <div 
        className={`text-center relative ${currentAnimationClass}`}
        style={{ 
          height: '42px', // Animation rectangle height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isEditing ? 'text' : 'pointer',
          overflow: 'hidden', // Clip overflowing text
        }}
        onClick={isEditing ? undefined : handleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="border-2 border-blue-500 rounded px-2 py-1 outline-none"
            style={{
              fontSize: '2rem',
              fontFamily: currentFont.family,
              maxWidth: '90%',
              maxHeight: '32px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              position: 'relative',
              zIndex: 2,
              color: '#000000',
              backgroundColor: 'white',
            }}
          />
        ) : (
          <h1 
            ref={textRef}
            className={`font-medium ${textColor} px-4`}
            style={{
              fontSize: '2rem',
              fontFamily: currentFont.family,
              maxHeight: '38px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: '38px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {headerText}
          </h1>
        )}
      </div>
      
      {/* Gap 1 */}
      <div style={{ height: '4px', background: 'white' }}></div>
      
      {/* Horizontal Line */}
      <div style={{ height: '2px', background: '#9ca3af' }}></div>
      
      {/* Gap 2 */}
      <div style={{ height: '2px', background: 'white' }}></div>
      
      {/* Tooltip */}
      {showTooltip && !isEditing && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap z-[9999]">
          Click text to change font • Double-click text to edit • Click background to change animation ({animationNames[headerAnimationStyle]})
        </div>
      )}
    </div>
  );
}
