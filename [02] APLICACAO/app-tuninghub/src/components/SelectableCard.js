import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SelectableCard({ title, subtitle, selected, onPress }) {
  const { colors, typography, fonts, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: radius.lg,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={styles.textos}>
        <Text style={[typography.bodyStrong, { color: colors.text, fontFamily: fonts.bold }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.placeholder }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, padding: 16, marginBottom: 12 },
  textos: { flex: 1, gap: 3 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
});