import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Mesma chave usada pelo script inline do index.html
const CHAVE_TEMA = 'tuninghub-tema';

const ThemeContext = createContext(null);

const consultaEscuro = () => window.matchMedia('(prefers-color-scheme: dark)');

// 'light' | 'dark' = escolha manual; 'system' = segue o sistema
const lerModoSalvo = () => {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    return salvo === 'light' || salvo === 'dark' ? salvo : 'system';
  } catch {
    return 'system';
  }
};

export const ThemeProvider = ({ children }) => {
  const [modo, setModo] = useState(lerModoSalvo);
  const [sistemaEscuro, setSistemaEscuro] = useState(() => consultaEscuro().matches);

  // Acompanha a troca de tema do sistema operacional em tempo real
  useEffect(() => {
    const mq = consultaEscuro();
    const aoMudar = (e) => setSistemaEscuro(e.matches);
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  }, []);

  const tema = modo === 'system' ? (sistemaEscuro ? 'dark' : 'light') : modo;

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
  }, [tema]);

  const definirModo = useCallback((novoModo) => {
    setModo(novoModo);
    try {
      if (novoModo === 'system') localStorage.removeItem(CHAVE_TEMA);
      else localStorage.setItem(CHAVE_TEMA, novoModo);
    } catch {
      // localStorage indisponível (modo privado restrito): só não persiste
    }
  }, []);

  const alternarTema = useCallback(() => {
    definirModo(tema === 'dark' ? 'light' : 'dark');
  }, [tema, definirModo]);

  const valor = useMemo(
    () => ({ modo, tema, isDark: tema === 'dark', definirModo, alternarTema }),
    [modo, tema, definirModo, alternarTema]
  );

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  return ctx;
};
