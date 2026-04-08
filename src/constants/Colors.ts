/**
 * Dutchify Design System
 * Inspired by: Duolingo (gamification), Headspace (calm clarity), Apple HIG (native feel)
 * Palette: Warm Dutch Orange + Soft Neutrals
 */

export const Colors = {
  light: {
    // Core
    text: '#1a1a2e',
    textSecondary: '#64748b',
    background: '#faf8f5',
    tint: '#e86912',

    // Brand
    primary: '#e86912',       // Dutch Orange
    primaryLight: '#2A4F7F',
    accent: '#e86912',        // Orange accent
    accentLight: '#fff3e8',

    // Surfaces
    cardBackground: '#ffffff',
    surfaceSecondary: '#f3f0ec',
    surfaceTertiary: '#e8e5e0',

    // Semantic
    success: '#059669',
    successLight: '#d1fae5',
    danger: '#dc2626',
    dangerLight: '#fee2e2',
    warning: '#d97706',

    // Tab Bar
    tabBarBackground: '#ffffff',
    tabIconDefault: '#b0aeb8',
    tabIconSelected: '#e86912',

    // Borders & Dividers
    border: '#e8e5e0',
    divider: '#f3f0ec',
    separator: '#d1cdc7',

    // Shadows
    shadowColor: '#000000',
  },
  dark: {
    // Core
    text: '#f5f3f0',
    textSecondary: '#94a3b8',
    background: '#121218',
    tint: '#f59e0b',

    // Brand
    primary: '#f59e0b',       // Amber for dark mode
    primaryLight: '#2a2015',
    accent: '#f59e0b',
    accentLight: '#2a2015',

    // Surfaces
    cardBackground: '#1e1e28',
    surfaceSecondary: '#1a1a24',
    surfaceTertiary: '#252530',

    // Semantic
    success: '#34d399',
    successLight: '#064e3b',
    danger: '#f87171',
    dangerLight: '#7f1d1d',
    warning: '#fbbf24',

    // Tab Bar
    tabBarBackground: '#1e1e28',
    tabIconDefault: '#5e5d66',
    tabIconSelected: '#f59e0b',

    // Borders & Dividers
    border: '#2e2e3a',
    divider: '#1a1a24',
    separator: '#3a3a48',

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
