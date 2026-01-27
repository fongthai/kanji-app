/**
 * Utility to read feature control settings
 * This is for use in non-React contexts (like PDF generation)
 */

// Import ft-control.json directly
import ftControl from '../hooks/ft-control.json';

interface FeatureControlConfig {
  watermark?: boolean;
}

// Store skip watermark flag for current export
let skipWatermarkForCurrentExport = false;

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
  // If skip watermark flag is set, don't show watermark
  if (skipWatermarkForCurrentExport) {
    return false;
  }
  const config = getFeatureControl();
  return config.watermark === true;
}

/**
 * Set skip watermark flag for current export
 */
export function setSkipWatermarkFlag(skip: boolean): void {
  skipWatermarkForCurrentExport = skip;
}

/**
 * Get skip watermark flag
 */
export function getSkipWatermarkFlag(): boolean {
  return skipWatermarkForCurrentExport;
}
