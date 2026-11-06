import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function QuickActionCard({ Icone, titulo, subtitulo, onPress, corFundo, corIcone }) {
  const { colors, shadows, typography, fonts, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        shadows.sm,
      ]}
    >
      <View style={[styles.icone, { backgroundColor: corFundo || colors.primarySoft, borderRadius: radius.md }]}>
        <Icone size={22} color={corIcone || colors.primary} strokeWidth={2.25} />
      </View>

      <View style={styles.textos}>
        <Text style={[typography.bodyStrong, { color: colors.text }]} numberOfLines={1}>
          {titulo}
        </Text>
        {subtitulo ? (
          <Text
            style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}
            numberOfLines={2}
          >
            {subtitulo}
          </Text>
        ) : null}
      </View>

      <ChevronRight size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 14, marginBottom: 12 },
  icone: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  textos: { flex: 1, gap: 2 },
});