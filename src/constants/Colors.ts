/**
 * Dutchify Design System
 * Inspired by: Duolingo (gamification), Headspace (calm clarity), Apple HIG (native feel)
 * Palette: Dutch Royal Blue + Warm Amber on soft neutral backgrounds
 */

export const Colors = {
  light: {
    // Core
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    background: '#F8F7F4',
    tint: '#1E3A5F',

    // Brand
    primary: '#1E3A5F',       // Dutch Royal Blue
    primaryLight: '#2A4F7F',
    accent: '#F5A623',        // Warm Amber
    accentLight: '#FFF3DC',

    // Surfaces
    cardBackground: '#FFFFFF',
    surfaceSecondary: '#F2F1EE',
    surfaceTertiary: '#E8E6E1',

    // Semantic
    success: '#34C759',
    successLight: '#E8FAE8',
    danger: '#FF3B30',
    dangerLight: '#FFE5E3',
    warning: '#FF9500',

    // Tab Bar
    tabBarBackground: '#FFFFFF',
    tabIconDefault: '#C7C7CC',
    tabIconSelected: '#1E3A5F',

    // Borders & Dividers
    border: '#E5E5EA',
    divider: '#F2F2F7',
    separator: '#C6C6C8',

    // Shadows
    shadowColor: '#000000',
  },
  dark: {
    // Core
    text: '#F5F5F7',
    textSecondary: '#98989D',
    background: '#000000',
    tint: '#5B9BD5',

    // Brand
    primary: '#5B9BD5',       // Lighter blue for dark mode
    primaryLight: '#1E3A5F',
    accent: '#FFD060',        // Brighter amber for dark mode
    accentLight: '#2C2510',

    // Surfaces
    cardBackground: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    surfaceTertiary: '#3A3A3C',

    // Semantic
    success: '#30D158',
    successLight: '#0D2E12',
    danger: '#FF453A',
    dangerLight: '#3A1510',
    warning: '#FF9F0A',

    // Tab Bar
    tabBarBackground: '#1C1C1E',
    tabIconDefault: '#636366',
    tabIconSelected: '#5B9BD5',

    // Borders & Dividers
    border: '#38383A',
    divider: '#2C2C2E',
    separator: '#48484A',

    // Shadows
    shadowColor: '#000000',
  },
};

// Shared design tokens
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const FontSize = {
  caption: 12,
  footnote: 13,
  subhead: 15,
  body: 17,
  title3: 20,
  title2: 22,
  title1: 28,
  largeTitle: 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export default Colors;
