import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export const FAB: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize position (top-right by default)
  useEffect(() => {
    const updatePosition = () => {
      const savedPosition = localStorage.getItem('fab-position');
      if (savedPosition) {
        setPosition(JSON.parse(savedPosition));
      } else {
        // Default position: top-right
        setPosition({
          x: window.innerWidth - 80,
          y: 20
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    // Set initial time
    updateTime();

    // Update every minute (60000ms)
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K / Ctrl+K: Toggle FAB menu
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Cmd+L / Ctrl+L: Quick language toggle
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault();
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLang);
        window.history.pushState({}, '', url);
      }
      
      // Escape: Close menu
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [i18n, isOpen]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking inside the menu
    if (isOpen && e.target !== buttonRef.current) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const fabSize = 56; // 14 * 4 = 56px
      const newX = Math.max(0, Math.min(window.innerWidth - fabSize, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - fabSize, e.clientY - dragOffset.y));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Save position to localStorage
        localStorage.setItem('fab-position', JSON.stringify(position));
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  const toggleMenu = () => {
    // Only toggle if not dragging
    if (!isDragging) {
      setIsOpen(prev => !prev);
    }
  };

  const getCurrentLanguageFlag = () => {
    return i18n.language === 'vi' ? '🇻🇳' : '🇬🇧';
  };

  // Calculate tooltip position to avoid overflow
  const getTooltipPosition = () => {
    if (!fabRef.current) return {};

    const fabSize = 56;
    const tooltipWidth = 250; // Approximate width
    const tooltipHeight = 40; // Approximate height
    const gap = 8;
    const margin = 10; // Minimum distance from viewport edge

    const style: React.CSSProperties = {};

    // Check if tooltip should be above or below
    const spaceBelow = window.innerHeight - (position.y + fabSize);
    const shouldBeAbove = spaceBelow < tooltipHeight + gap;

    if (shouldBeAbove) {
      style.bottom = `${fabSize + gap}px`;
    } else {
      style.top = `${fabSize + gap}px`;
    }

    // Calculate horizontal positioning relative to viewport
    const fabCenterX = position.x + fabSize / 2;
    const tooltipLeftIfCentered = fabCenterX - tooltipWidth / 2;
    const tooltipRightIfCentered = fabCenterX + tooltipWidth / 2;

    // Determine the best horizontal position
    if (tooltipLeftIfCentered < margin) {
      // Would overflow left - anchor to left edge with margin
      const offset = margin - tooltipLeftIfCentered;
      style.left = '50%';
      style.transform = `translateX(calc(-50% + ${offset}px))`;
    } else if (tooltipRightIfCentered > window.innerWidth - margin) {
      // Would overflow right - anchor to right edge with margin
      const overflow = tooltipRightIfCentered - (window.innerWidth - margin);
      style.left = '50%';
      style.transform = `translateX(calc(-50% - ${overflow}px))`;
    } else {
      // Fits perfectly centered
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    }

    return style;
  };

  // Calculate menu position to avoid overflow
  const getMenuPosition = () => {
    if (!fabRef.current) return {};

    const fabSize = 56;
    const menuWidth = 280;
    const menuHeight = 240;
    const gap = 8;

    // Determine if menu should be on left or right
    const shouldMenuBeOnLeft = position.x + fabSize + gap + menuWidth > window.innerWidth;
    // Determine if menu should be above or below
    const shouldMenuBeAbove = position.y + fabSize + gap + menuHeight > window.innerHeight;

    let style: React.CSSProperties = {};

    if (shouldMenuBeOnLeft) {
      style.right = fabSize + gap + 'px';
    } else {
      style.left = fabSize + gap + 'px';
    }

    if (shouldMenuBeAbove) {
      style.bottom = '0px';
    } else {
      style.top = '0px';
    }

    return style;
  };

  return (
    <div
      ref={fabRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Menu Items - Smart positioning to avoid overflow */}
      {isOpen && (
        <div 
          className="absolute flex flex-col gap-2 items-stretch w-64"
          style={getMenuPosition()}
        >
          {/* Language Switcher */}
          <div
            className="bg-gray-800 rounded-lg shadow-2xl p-3 border border-gray-700 transform transition-all duration-200 opacity-100 scale-100"
            style={{
              animation: 'fadeInUp 0.2s ease-out',
            }}
          >
            <LanguageSwitcher />
          </div>

          {/* About Link */}
          <button
            onClick={() => {
              // Placeholder for future About page
              setIsOpen(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200"
            style={{
              animation: 'fadeInUp 0.25s ease-out',
            }}
          >
            <span>ℹ️</span>
            <span className="text-sm font-medium">{t('fab.about')}</span>
          </button>

          {/* Keyboard Shortcuts Hint */}
          <div
            className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg shadow-lg text-xs border border-gray-600"
            style={{
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            <div className="whitespace-nowrap">
              <kbd className="bg-gray-600 px-1.5 py-0.5 rounded text-xs">⌘/Ctrl+K</kbd> <span className="text-xs">{t('fab.toggle_menu')}</span>
            </div>
            <div className="whitespace-nowrap mt-1">
              <kbd className="bg-gray-600 px-1.5 py-0.5 rounded text-xs">⌘/Ctrl+L</kbd> <span className="text-xs">{t('fab.switch_language')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={toggleMenu}
        onMouseEnter={() => !isOpen && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-14 h-14 rounded-full shadow-lg flex flex-col items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-red-600 hover:bg-red-700 rotate-45'
            : 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        }`}
        aria-label={isOpen ? t('fab.close_menu') : t('fab.open_menu')}
      >
        {isOpen ? (
          <span className="text-3xl">×</span>
        ) : (
          <>
            <span className="text-2xl leading-none" style={{ animation: 'windBlow 3s ease-in-out infinite', transformOrigin: 'center left' }}>
              {getCurrentLanguageFlag()}
            </span>
            <span className="text-[10px] font-mono text-white/90 mt-0.5 leading-none">{currentTime}</span>
          </>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div
          className="absolute px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50 border border-gray-700"
          style={{
            ...getTooltipPosition(),
            animation: 'fadeInUp 0.2s ease-out'
          }}
        >
          {t('fab.tooltip')}
        </div>
      )}

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes windBlow {
          0%, 100% {
            transform: skewY(0deg) scaleX(1);
          }
          25% {
            transform: skewY(3deg) scaleX(1.05);
          }
          50% {
            transform: skewY(-2deg) scaleX(0.98);
          }
          75% {
            transform: skewY(4deg) scaleX(1.08);
          }
        }
      `}</style>
    </div>
  );
};
