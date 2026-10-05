import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatarMoeda } from '../utils/formatters';
import Button from './Button';

export default function PlanoCard({ plano, onAssinar, loading }) {
  const { colors } = useTheme();
  const gratuito = !Number(plano.Valor) || Number(plano.Valor) <= 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.nome, { color: colors.text }]}>{plano.Nome}</Text>
        {gratuito ? (
          <View style={[styles.badge, { backgroundColor: colors.border }]}>
            <Text style={[styles.badgeTexto, { color: colors.text }]}>Grátis</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.valor, { color: gratuito ? colors.text : colors.primary }]}>
        {formatarMoeda(plano.Valor)}
        {!gratuito ? <Text style={[styles.duracao, { color: colors.textSecondary }]}> / {plano.DuracaoDias} dias</Text> : null}
      </Text>

      <View style={{ height: 12 }} />
      <Button title={gratuito ? 'Ativar gratuitamente' : 'Assinar com PIX'} onPress={onAssinar} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  nome: { fontSize: 17, fontWeight: '800' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '700' },
  valor: { fontSize: 22, fontWeight: '800' },
  duracao: { fontSize: 13, fontWeight: '600' },
});