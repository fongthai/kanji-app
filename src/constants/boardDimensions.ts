/**
 * Board Grid Layout Constants
 * 
 * These constants define the A4 paper dimensions and component heights
 * used for calculating the board grid layout. Values are in pixels at
 * 96 DPI (standard screen resolution).
 */

// A4 Paper dimensions at 96 DPI
export const A4_WIDTH = 698;  // Width in px
export const A4_HEIGHT = 1027; // Height in px

// Component heights (measured from actual DOM rendering)
// These account for padding, line-height, and borders
export const BOARD_HEADER_HEIGHT = 50; // Fixed height with 2rem text + border
export const BOARD_FOOTER_HEIGHT = 40; // Fixed height with text-sm + border

// Grid spacing
export const GRID_GAP = 4; // Gap between grid cells in px
