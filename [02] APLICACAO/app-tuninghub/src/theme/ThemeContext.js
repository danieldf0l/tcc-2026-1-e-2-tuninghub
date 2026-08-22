import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette } from './palette';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme(); // 'light' | 'dark' | null

  // Se o sistema não informar (raro), cai no escuro — combina mais com a marca
  const isDark = scheme !== 'light';
  const colors = isDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}