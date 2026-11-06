import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Chip({ label, selected, onPress, small }) {
  const { colors, fonts, radius } = useTheme();
  const estiloTexto = { fontFamily: fonts.semibold, fontSize: small ? 11.5 : 13 };

  // Chip informativo (sem toque) — ex.: serviços no card da oficina
  if (!onPress) {
    return (
      <View
        style={[
          styles.base,
          styles.estatico,
          { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.pill },
        ]}
      >
        <Text style={[estiloTexto, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.normal,
        {
          borderRadius: radius.pill,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[estiloTexto, { color: selected ? colors.textOnPrimary : colors.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, marginRight: 8 },
  normal: { paddingHorizontal: 14, paddingVertical: 8 },
  small: { paddingHorizontal: 10, paddingVertical: 5 },
  estatico: { paddingHorizontal: 10, paddingVertical: 5, marginRight: 6 },
});