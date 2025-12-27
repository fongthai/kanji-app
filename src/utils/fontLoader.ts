/**
 * Font Loader Utility
 * 
 * Manages loading and caching of fonts from manifest files:
 * - fonts-manifest-for-non-kanji.txt: for header text
 * - fonts-manifest-for-kanji.txt: for kanji display in panels
 */

export interface FontInfo {
  name: string; // Display name (e.g., "System UI", "Noto Sans JP")
  family: string; // CSS font-family value (e.g., "system-ui", "NotoSansJP-Regular")
  filename: string; // File path (e.g., "/fonts/NotoSansJP-Regular.ttf")
  loaded: boolean; // Whether font has been loaded successfully
  error: boolean; // Whether font failed to load
}

// Font list caches
let cachedHeaderFonts: FontInfo[] | null = null;
let cachedKanjiFonts: FontInfo[] | null = null;

/**
 * Load fonts from a manifest file
 */
async function loadFontsFromManifest(manifestFile: string, cache: FontInfo[] | null): Promise<FontInfo[]> {
  if (cache) return cache;

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}fonts/${manifestFile}`);
    if (!response.ok) throw new Error(`Failed to fetch ${manifestFile}`);
    
    const text = await response.text();
    const filenames = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line !== 'manifest.txt'); // Skip comments and old manifest

    // Add system-ui as first option (always available)
    const fonts: FontInfo[] = [{
      name: 'System UI',
      family: 'system-ui',
      filename: '',
      loaded: true, // System font is always loaded
      error: false,
    }];

    // Parse each font file
    for (const filename of filenames) {
      const family = getFontFamilyFromFilename(filename);
      const name = getDisplayName(family);
      
      fonts.push({
        name,
        family,
        filename: `${import.meta.env.BASE_URL}fonts/${filename}`,
        loaded: false,
        error: false,
      });
    }

    return fonts;
  } catch (error) {
    console.error('Failed to load font manifest:', error);
    // Return minimal fallback
    return [{
      name: 'System UI',
      family: 'system-ui',
      filename: '',
      loaded: true,
      error: false,
    }];
  }
}

/**
 * Load kanji fonts from fonts-manifest-for-kanji.txt
 * Used for: Input Panel, Main Panel, and Control Panel kanji font dropdowns
 */
export async function loadKanjiFontManifest(): Promise<FontInfo[]> {
  if (!cachedKanjiFonts) {
    cachedKanjiFonts = await loadFontsFromManifest('fonts-manifest-for-kanji.txt', cachedKanjiFonts);
  }
  return cachedKanjiFonts;
}

/**
 * Load header fonts from fonts-manifest-for-non-kanji.txt
 * Used for: Header text in worksheets
 */
export async function loadHeaderFontManifest(): Promise<FontInfo[]> {
  if (!cachedHeaderFonts) {
    cachedHeaderFonts = await loadFontsFromManifest('fonts-manifest-for-non-kanji.txt', cachedHeaderFonts);
  }
  return cachedHeaderFonts;
}

/**
 * Extract font family name from filename
 * Example: "NotoSansJP-Regular.ttf" → "NotoSansJP-Regular"
 */
function getFontFamilyFromFilename(filename: string): string {
  return filename.replace(/\.(ttf|woff2?|otf)$/i, '');
}

/**
 * Convert font family to display name
 * Example: "NotoSansJP-Regular" → "Noto Sans JP"
 */
function getDisplayName(family: string): string {
  return family
    .replace(/-Regular$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

/**
 * Preload a font by creating a @font-face dynamically
 * Returns true if successful, false if failed
 */
export async function preloadFont(font: FontInfo): Promise<boolean> {
  if (font.family === 'system-ui' || font.loaded || font.error) {
    return font.loaded;
  }

  try {
    // Check if font already registered in CSS
    const existingFontFace = Array.from(document.fonts.values()).find(
      (f) => f.family === font.family
    );
    if (existingFontFace) {
      font.loaded = true;
      return true;
    }

    // Create and add new font face
    // Wrap URL in quotes if it contains spaces (required by FontFace API)
    const fontUrl = font.filename.includes(' ') 
      ? `url("${font.filename}")`
      : `url(${font.filename})`;
    
    const fontFace = new FontFace(
      font.family,
      fontUrl,
      { weight: 'normal', style: 'normal' }
    );

    await fontFace.load();
    document.fonts.add(fontFace);
    
    font.loaded = true;
    return true;
  } catch (error) {
    console.warn(`Failed to load font ${font.name} (${font.filename}):`, error);
    font.error = true;
    return false;
  }
}

/**
 * Get next valid font index (skip fonts that failed to load)
 */
export async function getNextFontIndex(
  currentIndex: number,
  fonts: FontInfo[]
): Promise<number> {
  if (fonts.length === 0) return 0;
  
  let nextIndex = (currentIndex + 1) % fonts.length;
  let attempts = 0;
  const maxAttempts = fonts.length;

  // Keep cycling until we find a valid font or exhaust all options
  while (attempts < maxAttempts) {
    const font = fonts[nextIndex];
    
    // If system font or already loaded successfully, use it
    if (font.family === 'system-ui' || font.loaded) {
      return nextIndex;
    }
    
    // If not loaded yet and no error, try loading
    if (!font.error) {
      const success = await preloadFont(font);
      if (success) return nextIndex;
    }
    
    // Move to next font
    nextIndex = (nextIndex + 1) % fonts.length;
    attempts++;
  }

  // All fonts failed, return system-ui (index 0)
  return 0;
}
