/**
 * Utility to read feature control settings
 * This is for use in non-React contexts (like PDF generation)
 */

// Import ft-control.json directly
import ftControl from '../hooks/ft-control.json';

interface FeatureControlConfig {
  watermark?: boolean;
}

/**
 * Get feature control settings synchronously
 */
export function getFeatureControl(): FeatureControlConfig {
  return ftControl as FeatureControlConfig;
}

/**
 * Check if watermark should be shown
 */
export function shouldShowWatermark(): boolean {
  const config = getFeatureControl();
  return config.watermark === true;
}
