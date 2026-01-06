import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslationEntry {
  key: string;
  vi: string;
  en: string;
  namespace: string;
}

export const TranslationEditor: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeNamespace, setActiveNamespace] = useState('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ vi: string; en: string }>({ vi: '', en: '' });
  const [loadingNamespace, setLoadingNamespace] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const namespaces = ['common', 'controls', 'categories', 'messages', 'sheet', 'board', 'export'];

  // Lazy load namespace when switching tabs
  useEffect(() => {
    const loadNamespace = async () => {
      const hasVi = i18n.hasResourceBundle('vi', activeNamespace);
      const hasEn = i18n.hasResourceBundle('en', activeNamespace);
      
      if (!hasVi || !hasEn) {
        setLoadingNamespace(true);
        
        try {
          // Load for both languages explicitly
          const basePath = '/kanji-app/locales'; // Match i18n backend config
          const promises = [];
          if (!hasVi) {
            promises.push(
              fetch(`${basePath}/vi/${activeNamespace}.json`)
                .then(res => {
                  if (!res.ok) throw new Error(`Failed to load vi/${activeNamespace}`);
                  return res.json();
                })
                .then(data => i18n.addResourceBundle('vi', activeNamespace, data, true, true))
            );
          }
          if (!hasEn) {
            promises.push(
              fetch(`${basePath}/en/${activeNamespace}.json`)
                .then(res => {
                  if (!res.ok) throw new Error(`Failed to load en/${activeNamespace}`);
                  return res.json();
                })
                .then(data => i18n.addResourceBundle('en', activeNamespace, data, true, true))
            );
          }
          
          await Promise.all(promises);
        } catch (error) {
          console.error('Error loading translations:', error);
        } finally {
          setLoadingNamespace(false);
          setDataVersion(prev => prev + 1); // Force refresh
        }
      }
    };
    
    loadNamespace();
  }, [activeNamespace, i18n]);


  // Keyboard shortcut: Cmd+Option+T (Mac) or Ctrl+Alt+T (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use e.code (physical key) instead of e.key (character produced)
      // On Mac, Option+T produces '†' character, so we check the key code
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === 'KeyT') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setEditingKey(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Flatten nested objects into dot notation keys
  const flattenTranslations = (obj: any, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {};
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenTranslations(obj[key], fullKey));
      } else {
        result[fullKey] = obj[key];
      }
    }
    
    return result;
  };

  // Get all translation entries for active namespace
  const translations = useMemo(() => {
    // Don't compute if still loading
    if (loadingNamespace) return [];
    
    const entries: TranslationEntry[] = [];
    
    const viData = i18n.getResourceBundle('vi', activeNamespace) || {};
    const enData = i18n.getResourceBundle('en', activeNamespace) || {};
    
    const viFlat = flattenTranslations(viData);
    const enFlat = flattenTranslations(enData);
    
    // Combine all keys from both languages
    const allKeys = new Set([...Object.keys(viFlat), ...Object.keys(enFlat)]);
    
    allKeys.forEach(key => {
      entries.push({
        key,
        vi: viFlat[key] || '',
        en: enFlat[key] || '',
        namespace: activeNamespace
      });
    });
    
    return entries.sort((a, b) => a.key.localeCompare(b.key));
  }, [activeNamespace, loadingNamespace, dataVersion]);

  // Filter translations by search term
  const filteredTranslations = useMemo(() => {
    if (!searchTerm) return translations;
    
    const term = searchTerm.toLowerCase();
    return translations.filter(t => {
      const keyMatch = t.key.toLowerCase().includes(term);
      const viMatch = (t.vi || '').toLowerCase().includes(term);
      const enMatch = (t.en || '').toLowerCase().includes(term);
      return keyMatch || viMatch || enMatch;
    });
  }, [translations, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = translations.length;
    const missingVi = translations.filter(t => !t.vi).length;
    const missingEn = translations.filter(t => !t.en).length;
    const complete = total - Math.max(missingVi, missingEn);
    const completion = total > 0 ? Math.round((complete / total) * 100) : 0;
    
    return { total, missingVi, missingEn, complete, completion };
  }, [translations]);

  const handleEdit = (entry: TranslationEntry) => {
    setEditingKey(entry.key);
    setEditValues({ vi: entry.vi, en: entry.en });
  };

  const handleSave = () => {
    if (!editingKey) return;
    
    // Save to localStorage for this session
    const savedEdits = JSON.parse(localStorage.getItem('translation-edits') || '{}');
    
    if (!savedEdits[activeNamespace]) {
      savedEdits[activeNamespace] = {};
    }
    
    savedEdits[activeNamespace][editingKey] = editValues;
    localStorage.setItem('translation-edits', JSON.stringify(savedEdits));
    
    // Update i18n resources
    const viBundle = i18n.getResourceBundle('vi', activeNamespace) || {};
    const enBundle = i18n.getResourceBundle('en', activeNamespace) || {};
    
    // Set values using dot notation
    const setNestedValue = (obj: any, path: string, value: string) => {
      const keys = path.split('.');
      let current = obj;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    };
    
    setNestedValue(viBundle, editingKey, editValues.vi);
    setNestedValue(enBundle, editingKey, editValues.en);
    
    i18n.addResourceBundle('vi', activeNamespace, viBundle, true, true);
    i18n.addResourceBundle('en', activeNamespace, enBundle, true, true);
    
    setEditingKey(null);
  };

  const handleCancel = () => {
    setEditingKey(null);
  };

  const exportEdits = () => {
    const savedEdits = localStorage.getItem('translation-edits');
    if (!savedEdits) {
      alert('No edits to export');
      return;
    }
    
    const blob = new Blob([savedEdits], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translation-edits.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-900 to-purple-900">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🌐</span> Translation Editor
              <span className="text-sm font-normal text-gray-300">(Dev Only)</span>
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Statistics Bar */}
        <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Total:</span>
            <span className="font-bold text-white">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Complete:</span>
            <span className="font-bold text-green-400">{stats.complete}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Missing VI:</span>
            <span className="font-bold text-red-400">{stats.missingVi}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Missing EN:</span>
            <span className="font-bold text-red-400">{stats.missingEn}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Completion:</span>
            <span className="font-bold text-blue-400">{stats.completion}%</span>
          </div>
          <div className="ml-auto">
            <button
              onClick={exportEdits}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              💾 Export Edits
            </button>
          </div>
        </div>

        {/* Namespace Tabs */}
        <div className="flex gap-1 p-2 bg-gray-800 border-b border-gray-700 overflow-x-auto">
          {namespaces.map(ns => (
            <button
              key={ns}
              onClick={() => setActiveNamespace(ns)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                activeNamespace === ns
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {ns}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-gray-800 border-b border-gray-700">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search by key, Vietnamese, or English..."
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            {searchTerm && (
              <div className="px-3 py-2 bg-gray-700 text-white rounded text-sm whitespace-nowrap">
                {filteredTranslations.length} of {translations.length}
              </div>
            )}
          </div>
        </div>

        {/* Translations Table */}
        <div className="flex-1 overflow-auto">
          {loadingNamespace ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">⏳</div>
                <div>Loading {activeNamespace} translations...</div>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800 text-gray-300 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold w-1/4">Key</th>
                <th className="px-4 py-3 text-left font-semibold w-3/8">Vietnamese</th>
                <th className="px-4 py-3 text-left font-semibold w-3/8">English</th>
                <th className="px-4 py-3 text-center font-semibold w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTranslations.map((entry, index) => {
                const isEditing = editingKey === entry.key;
                const missingVi = !entry.vi;
                const missingEn = !entry.en;
                
                return (
                  <tr
                    key={entry.key}
                    className={`border-b border-gray-800 hover:bg-gray-800 ${
                      (missingVi || missingEn) ? 'bg-red-900 bg-opacity-10' : ''
                    } ${index % 2 === 0 ? 'bg-gray-900 bg-opacity-50' : ''}`}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-blue-400">
                      {entry.key}
                    </td>
                    <td className={`px-4 py-2 ${missingVi ? 'bg-red-900 bg-opacity-30' : ''}`}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValues.vi}
                          onChange={(e) => setEditValues(prev => ({ ...prev, vi: e.target.value }))}
                          className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className={missingVi ? 'text-red-400 italic' : 'text-white'}>
                          {entry.vi || '(missing)'}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-2 ${missingEn ? 'bg-red-900 bg-opacity-30' : ''}`}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValues.en}
                          onChange={(e) => setEditValues(prev => ({ ...prev, en: e.target.value }))}
                          className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className={missingEn ? 'text-red-400 italic' : 'text-white'}>
                          {entry.en || '(missing)'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={handleSave}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
          
          {!loadingNamespace && filteredTranslations.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No translations found matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-800 text-xs text-gray-400">
          <p>💡 Tip: Edits are saved to localStorage and can be exported. Changes persist until browser data is cleared.</p>
        </div>
      </div>
    </div>
  );
};
