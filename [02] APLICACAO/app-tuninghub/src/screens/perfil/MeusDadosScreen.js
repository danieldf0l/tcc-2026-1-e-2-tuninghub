import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import BackButton from '../../components/BackButton';

export default function MeusDadosScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Meus dados</Text>
      <Text style={[styles.aviso, { color: colors.textSecondary }]}>
        A edição desses dados estará disponível em breve.
      </Text>

      <Input label="Nome" value={usuario?.Nome || usuario?.nome || ''} editable={false} />
      <Input label="Email" value={usuario?.Email || usuario?.email || ''} editable={false} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 6 },
  aviso: { fontSize: 13, marginBottom: 24 },
});