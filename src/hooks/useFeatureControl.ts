import { useState, useEffect } from 'react';

interface FeatureControlConfig {
  watermark?: boolean;
}

/**
 * Hook to read feature control settings from ft-control.json
 * This provides hidden controls not exposed in the UI
 */
export function useFeatureControl(): FeatureControlConfig {
  const [config, setConfig] = useState<FeatureControlConfig>({});

  useEffect(() => {
    // Load ft-control.json
    fetch('/src/hooks/ft-control.json')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => {
        console.warn('Could not load ft-control.json, using defaults:', err);
        setConfig({});
      });
  }, []);

  return config;
}
