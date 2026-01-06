import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common');
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // Update URL with new language parameter
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url.toString());
  };
  
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-400">{t('labels.language')}</label>
      <select 
        value={i18n.language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 hover:border-gray-500 focus:outline-none focus:border-blue-500"
      >
        <option value="vi">🇻🇳 Tiếng Việt</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  );
};
