import React, { createContext, useContext, useMemo } from 'react';
import { colors } from '../constants/colors';
import { layout } from '../constants/layout';
import { useColorScheme } from '../hooks/use-color-scheme';

interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    [key: string]: string;
  };
  spacing: typeof layout.spacing;
  borderRadius: typeof layout.borderRadius;
  fontSize: typeof layout.fontSize;
  lineHeight: typeof layout.lineHeight;
  fontWeight: typeof layout.fontWeight;
  duration: typeof layout.duration;
  shadow: typeof layout.shadow;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';

  const theme: Theme = useMemo(() => ({
    isDark,
    colors: {
      primary: colors.ford.blue,
      secondary: colors.ford.lightBlue,
      background: isDark ? colors.dark.bg : colors.light.bg,
      surface: isDark ? colors.dark.surface : colors.light.surface,
      text: isDark ? colors.dark.text : colors.light.text,
      textSecondary: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
      border: isDark ? colors.dark.border : colors.light.border,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
    },
    spacing: layout.spacing,
    borderRadius: layout.borderRadius,
    fontSize: layout.fontSize,
    lineHeight: layout.lineHeight,
    fontWeight: layout.fontWeight,
    duration: layout.duration,
    shadow: layout.shadow,
  }), [isDark]);

  const toggleTheme = () => {
    // Note: In a real app, you might want to store this preference
    console.log('Theme toggle requested - system preference:', systemColorScheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export type { Theme, ThemeContextType };

