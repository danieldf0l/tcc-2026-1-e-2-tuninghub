import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function StatCard({ valor, rotulo, destaque, Icone }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {Icone ? (
        <Icone size={18} color={destaque ? colors.primary : colors.textSecondary} style={{ marginBottom: 8 }} />
      ) : null}
      <Text style={[styles.valor, { color: destaque ? colors.primary : colors.text }]}>{valor}</Text>
      <Text style={[styles.rotulo, { color: colors.textSecondary }]}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'flex-start' },
  valor: { fontSize: 26, fontWeight: '800', marginBottom: 2 },
  rotulo: { fontSize: 12, fontWeight: '600' },
});