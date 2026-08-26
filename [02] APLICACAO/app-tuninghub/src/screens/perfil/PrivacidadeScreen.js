import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { POLITICA_DE_PRIVACIDADE, DATA_ATUALIZACAO } from '../../constants/textosLegais';
import DocumentoLegal from '../../components/DocumentoLegal';
import BackButton from '../../components/BackButton';

export default function PrivacidadeScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Política de Privacidade</Text>
      <Text style={[styles.atualizado, { color: colors.textSecondary }]}>
        Atualizado em: {DATA_ATUALIZACAO}
      </Text>

      <DocumentoLegal introducao={POLITICA_DE_PRIVACIDADE.introducao} clausulas={POLITICA_DE_PRIVACIDADE.clausulas} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 4 },
  atualizado: { fontSize: 12, marginBottom: 20 },
});