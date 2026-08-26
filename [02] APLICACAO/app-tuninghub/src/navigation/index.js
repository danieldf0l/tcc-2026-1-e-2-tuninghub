import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import AceiteTermosScreen from '../screens/auth/AceiteTermosScreen';

export default function RootNavigator() {
  const { carregando, autenticado, usuario } = useAuth();
  const { colors, isDark } = useTheme();
  const precisaAceitarTermos = autenticado && usuario && usuario.TermosAceitos === 0;

  if (carregando) return null;

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {!autenticado ? (
        <AuthNavigator />
      ) : precisaAceitarTermos ? (
        <AceiteTermosScreen />
      ) : (
        <AppNavigator />
      )}
    </NavigationContainer>
  );
}