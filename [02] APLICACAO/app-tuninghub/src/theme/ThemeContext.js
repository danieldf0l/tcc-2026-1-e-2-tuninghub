import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette } from './palette';
import { spacing, radius, typography, layout, getShadows } from './tokens';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme(); // 'light' | 'dark' | null

  // Se o sistema não informar (raro), cai no escuro — combina mais com a marca
  const isDark = scheme !== 'light';

  const value = useMemo(
    () => ({
      colors: isDark ? darkPalette : lightPalette,
      isDark,
      spacing,
      radius,
      typography,
      layout,
      shadows: getShadows(isDark),
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}