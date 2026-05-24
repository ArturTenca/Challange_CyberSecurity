/**
 * Color palette for the app
 * Following Ford brand guidelines
 */

export const colors = {
  // Ford Brand Colors
  ford: {
    blue: '#003478',
    lightBlue: '#0066CC',
    darkBlue: '#001D3D',
    electric: '#00A8E8',
  },

  // Status Colors
  primary: '#003478',
  secondary: '#0066CC',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Dark Mode
  dark: {
    bg: '#0a0e14',
    surface: '#1a1f2e',
    border: '#2d3748',
    text: '#f0f4f8',
    textSecondary: '#cbd5e1',
  },

  // Light Mode
  light: {
    bg: '#ffffff',
    surface: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
  },

  // Semantic
  background: (isDark: boolean) => (isDark ? colors.dark.bg : colors.light.bg),
  surface: (isDark: boolean) => (isDark ? colors.dark.surface : colors.light.surface),
  text: (isDark: boolean) => (isDark ? colors.dark.text : colors.light.text),
  textSecondary: (isDark: boolean) =>
    isDark ? colors.dark.textSecondary : colors.light.textSecondary,
  border: (isDark: boolean) => (isDark ? colors.dark.border : colors.light.border),
};

export type Colors = typeof colors;
