import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from './Button';

// Botão de alternar tema claro/escuro (header e tela de login)
const ThemeToggle = () => {
  const { isDark, alternarTema } = useTheme();

  return (
    <IconButton
      icone={isDark ? Sun : Moon}
      rotulo={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      onClick={alternarTema}
    />
  );
};

export default ThemeToggle;