import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { usuario, sair } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Bem-vindo, {usuario?.nome || usuario?.email}!
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Login realizado com sucesso. As telas do app vêm nos próximos módulos.
      </Text>
      <Button title="Sair" variant="outline" onPress={sair} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 24 },
});