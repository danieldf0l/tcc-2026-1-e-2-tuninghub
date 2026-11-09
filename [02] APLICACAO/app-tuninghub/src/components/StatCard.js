import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function StatCard({ valor, rotulo, destaque, Icone }) {
  const { colors, fonts, typography, radius } = useTheme();

  const corIcone = destaque ? colors.primary : colors.textSecondary;
  const fundoIcone = destaque ? colors.primarySoft : colors.surfaceElevated;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
      ]}
    >
      {Icone ? (
        <View style={[styles.icone, { backgroundColor: fundoIcone, borderRadius: radius.sm }]}>
          <Icone size={16} color={corIcone} strokeWidth={2.25} />
        </View>
      ) : null}

      <Text
        style={[styles.valor, { fontFamily: fonts.extrabold, color: destaque ? colors.primary : colors.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {valor}
      </Text>

      <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={2}>
        {rotulo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1, padding: 16, alignItems: 'flex-start' },
  icone: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  valor: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5, marginBottom: 2 },
});