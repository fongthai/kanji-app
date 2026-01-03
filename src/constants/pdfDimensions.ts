/**
 * Shared PDF dimension constants for both Sheet and Board modes
 * These ensure consistent margins, header/footer heights across all PDF exports
 */

// A4 dimensions in PDF points (72 DPI)
export const A4_WIDTH_PT = 595;
export const A4_HEIGHT_PT = 842;

// PDF Page Margins (in points) - please DO NOT modify these without having my confirmation!
export const PDF_MARGIN_TOP = 25;
export const PDF_MARGIN_BOTTOM = 25; 
export const PDF_MARGIN_LEFT = 35; 
export const PDF_MARGIN_RIGHT = 25;

// PDF-specific header/footer heights (compressed to fit more content)
export const PDF_HEADER_HEIGHT = 45;
export const PDF_FOOTER_HEIGHT = 30;

// PDF spacing constants
export const PDF_OUTER_TABLE_SPACING = 8; // Sheet mode: Gap between outer-tables
export const PDF_HEADER_TO_CONTENT_SPACING = 8; // Gap from header to first content (sheet: outer-table, board: kanji row)
export const PDF_CONTENT_TO_FOOTER_SPACING = 8; // Gap from last content to footer (sheet: outer-table, board: kanji row)

// PDF Board mode card border (2pt on each side = 4pt total)
export const PDF_CARD_BORDER_TOTAL = 4;
