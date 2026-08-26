import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import BackButton from '../../components/BackButton';

export default function PrivacidadeScreen({ navigation }) {
  const { colors } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Política de Privacidade</Text>
      <Text style={[styles.texto, { color: colors.textSecondary }]}>
        Este é um texto provisório. O conteúdo oficial da Política de Privacidade do TuningHub, incluindo como
        tratamos os dados pessoais coletados no cadastro e uso do aplicativo, será definido pela equipe e publicado
        aqui em conformidade com a LGPD.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 16 },
  texto: { fontSize: 14, lineHeight: 22 },
});