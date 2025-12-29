import { useState, useEffect } from 'react';
import InputPanel from './features/inputPanel/InputPanel';
import MainView from './features/mainView/MainView';
import ControlPanel from './features/controlPanel/ControlPanel';
import { useAppSelector } from './app/hooks';

type ActivePanel = 'input' | 'main' | 'control';

function App() {
  const currentMode = useAppSelector(state => state.worksheet.currentMode);
  const [activePanel, setActivePanel] = useState<ActivePanel>('input');
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('kanji-worksheet-mode', currentMode);
  }, [currentMode]);

  // Detect mobile based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    let timeoutId: number;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(checkMobile, 300);
    };
    
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  // Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left: go to next panel
      if (activePanel === 'input') setActivePanel('main');
      else if (activePanel === 'main') setActivePanel('control');
    }
    
    if (isRightSwipe) {
      // Swipe right: go to previous panel
      if (activePanel === 'control') setActivePanel('main');
      else if (activePanel === 'main') setActivePanel('input');
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Mobile Navigation Tabs */}
        <div className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 flex">
          <button
            onClick={() => setActivePanel('input')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'input'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Input Panel
          </button>
          <button
            onClick={() => setActivePanel('main')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'main'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Main View
          </button>
          <button
            onClick={() => setActivePanel('control')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'control'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Mobile Panel Container with Swipe */}
        <div
          className="pt-12 h-screen overflow-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {activePanel === 'input' && <InputPanel />}
          {activePanel === 'main' && <MainView />}
          {activePanel === 'control' && <ControlPanel />}
        </div>
      </div>
    );
  }

  // Desktop/Tablet landscape layout
  return (
    <div className="h-screen bg-gray-900 text-gray-100 p-4 overflow-hidden">
      <div className="grid gap-5 h-full w-full grid-cols-[20%_1fr_20%] md:grid-cols-[25%_1fr_25%] lg:grid-cols-[28%_1fr_28%] xl:grid-cols-[30%_1fr_30%] 2xl:grid-cols-[35%_1fr_35%]">
        <InputPanel />
        <MainView />
        <ControlPanel />
      </div>
    </div>
  );
}

export default App;
