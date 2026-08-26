import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import BackButton from '../../components/BackButton';

export default function TermosScreen({ navigation }) {
  const { colors } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Termos de Uso</Text>
      <Text style={[styles.texto, { color: colors.textSecondary }]}>
        Este é um texto provisório. Os Termos de Uso oficiais do TuningHub, definindo as regras de utilização do
        aplicativo, responsabilidades do usuário e da plataforma, serão definidos pela equipe e publicados aqui.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 16 },
  texto: { fontSize: 14, lineHeight: 22 },
});