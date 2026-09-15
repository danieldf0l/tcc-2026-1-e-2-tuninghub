import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { EstilosProvider } from './src/context/EstilosContext';
import RootNavigator from './src/navigation';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EstilosProvider>
          <AppContent />
        </EstilosProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}