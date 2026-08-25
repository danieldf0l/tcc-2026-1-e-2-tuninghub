import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ProjetoCard from '../components/ProjetoCard';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario, sair } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.saudacao, { color: colors.textSecondary }]}>Olá,</Text>
      <Text style={[styles.nome, { color: colors.text }]}>{usuario?.Nome || usuario?.nome || 'Entusiasta'}</Text>

      <View style={{ height: 32 }} />
      <ProjetoCard titulo="Meus Projetos" subtitulo="Ver todos" onPress={() => navigation.navigate('Projetos')} />

      <View style={{ flex: 1 }} />
      <Button title="Sair" variant="outline" onPress={sair} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 70, paddingBottom: 30 },
  saudacao: { fontSize: 16 },
  nome: { fontSize: 28, fontWeight: '800' },
});