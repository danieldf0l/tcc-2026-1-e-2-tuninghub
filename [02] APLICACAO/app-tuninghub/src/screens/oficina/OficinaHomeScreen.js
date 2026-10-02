import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

export default function OficinaHomeScreen() {
  const { colors } = useTheme();
  const { usuario, sair } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <Text style={[styles.saudacao, { color: colors.textSecondary }]}>Bem-vindo,</Text>
      <Text style={[styles.nome, { color: colors.text }]}>{usuario?.NomeOficina || 'Oficina'}</Text>
      <Text style={[styles.subtexto, { color: colors.textSecondary }]}>
        O painel completo da oficina (endereço, serviços, assinatura e imagens) chega nas próximas etapas.
      </Text>

      <View style={{ flex: 1 }} />
      <Button title="Sair" variant="outline" onPress={sair} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 70 },
  saudacao: { fontSize: 16 },
  nome: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  subtexto: { fontSize: 14, lineHeight: 21 },
});