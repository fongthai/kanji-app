import { useEffect, useRef, useState, type ReactNode } from 'react';

// A4 dimensions at 300 DPI for high-quality PDF export
export const A4_WIDTH_PX = 2480;
export const A4_HEIGHT_PX = 3508;
export const A4_RATIO = A4_WIDTH_PX / A4_HEIGHT_PX;

// Display dimensions (scaled down for screen)
export const A4_DISPLAY_WIDTH = 794; // ~96 DPI
export const A4_DISPLAY_HEIGHT = 1123;

// Minimum viewport dimensions
export const MIN_VIEWPORT_WIDTH = 320;
export const MIN_VIEWPORT_HEIGHT = 450; // Maintains roughly the A4 ratio (320 * 1.4)

interface A4PaperProps {
  children: ReactNode;
  className?: string;
}

export function A4Paper({ children, className = '' }: A4PaperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null); // Persistent ref for ResizeObserver
  const [scale, setScale] = useState(1);
  const [isViewportTooSmall, setIsViewportTooSmall] = useState(false);

  useEffect(() => {
    let debounceTimer: number | undefined;
    
    const calculateScale = () => {
      // Use wrapperRef which is always mounted, not containerRef
      if (!wrapperRef.current) return;
      
      const parentRect = wrapperRef.current.getBoundingClientRect();
      
      // Check minimum viewport dimensions
      // Width must be at least 320px, height at least 450px (roughly maintains A4 ratio)
      const isWidthTooSmall = parentRect.width < MIN_VIEWPORT_WIDTH;
      const isHeightTooSmall = parentRect.height < MIN_VIEWPORT_HEIGHT;
      const shouldShowWarning = isWidthTooSmall || isHeightTooSmall;
      
      // Always update warning state immediately (not debounced)
      setIsViewportTooSmall(shouldShowWarning);
      
      // If viewport is too small, don't calculate scale
      if (shouldShowWarning) {
        return;
      }

      // Use parent's dimensions for available space
      const availableWidth = parentRect.width;
      const availableHeight = parentRect.height;

      // Calculate scale factors for both dimensions
      const scaleWidth = availableWidth / A4_DISPLAY_WIDTH;
      const scaleHeight = availableHeight / A4_DISPLAY_HEIGHT;

      // Use the smaller scale to ensure both dimensions fit
      let calculatedScale = Math.min(scaleWidth, scaleHeight);

      // Apply minimum scale factor (25%)
      calculatedScale = Math.max(calculatedScale, 0.25);

      setScale(calculatedScale);
    };

    // Initial calculation
    calculateScale();

    // Use ResizeObserver for more accurate container size tracking
    // Observe wrapperRef so it continues working even when warning is shown
    const resizeObserver = new ResizeObserver(calculateScale);
    
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    // Fallback to window resize (also immediate)
    window.addEventListener('resize', calculateScale);
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  if (isViewportTooSmall) {
    return (
      <div ref={wrapperRef} className="flex items-center justify-center h-full w-full bg-gray-800 text-white p-4 text-center">
        <div>
          <svg
            className="w-16 h-16 mx-auto mb-4 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold mb-2">Viewport Too Small</h2>
          <p className="text-gray-400">
            Minimum size required:
            <br />
            Width: {MIN_VIEWPORT_WIDTH}px, Height: {MIN_VIEWPORT_HEIGHT}px
            <br />
            Please resize your browser window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="flex items-center justify-center h-full w-full"
    >
      <div
        ref={containerRef}
        data-component="a4-paper"
        className={`bg-white shadow-2xl relative ${className}`}
        style={{
          width: `${A4_DISPLAY_WIDTH}px`,
          height: `${A4_DISPLAY_HEIGHT}px`,
          aspectRatio: '794 / 1123',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          padding: '48px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
