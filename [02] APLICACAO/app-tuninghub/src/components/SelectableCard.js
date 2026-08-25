import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SelectableCard({ title, subtitle, selected, onPress }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: pressed ? colors.surface : selected ? `${colors.primary}14` : colors.surface,
          borderWidth: selected ? 2 : 1.5,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      <View
        style={[
          styles.radio,
          { borderColor: selected ? colors.primary : colors.border },
        ]}
      >
        {selected ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 3 },
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