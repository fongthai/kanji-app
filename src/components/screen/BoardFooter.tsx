import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getFooterText } from '../../constants/appText';

interface BoardFooterProps {
  currentPage: number;
  totalPages: number;
  visible: boolean;
  timestamp?: number; // Optional timestamp to force re-generation
}

export function BoardFooter({ currentPage, totalPages, visible, timestamp }: BoardFooterProps) {
  const { t } = useTranslation('common');
  if (!visible) return null;
  
  // Regenerate footer text when timestamp changes (or on mount)
  const footerText = useMemo(() => getFooterText(t), [timestamp, t]);
  
  return (
    <div 
      style={{ 
        height: '40px',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
      }}
    >
      {/* Gap above line */}
      <div style={{ height: '2px', background: 'white' }}></div>
      
      {/* Horizontal Line */}
      <div style={{ height: '2px', background: '#9ca3af' }}></div>
      
      {/* Footer Content */}
      <div 
        className="px-4 bg-white flex justify-between items-center"
        style={{ height: '36px' }}
      >
        {/* Left: Generation text */}
        <p className="text-sm text-gray-600">
          {footerText}
        </p>
        
        {/* Right: Page numbers */}
        <p className="text-sm text-gray-600">
          {t('labels.page_of', { current: currentPage, total: totalPages })}
        </p>
      </div>
    </div>
  );
}
