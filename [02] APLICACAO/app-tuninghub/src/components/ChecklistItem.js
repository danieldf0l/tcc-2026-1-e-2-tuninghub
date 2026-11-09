import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ChecklistItem({ titulo, concluido, onToggle }) {
  const { colors, typography, fonts, radius } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!concluido }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            borderColor: concluido ? colors.primary : colors.placeholder,
            backgroundColor: concluido ? colors.primary : 'transparent',
          },
        ]}
      >
        {concluido ? <Check size={14} color={colors.textOnPrimary} strokeWidth={3} /> : null}
      </View>

      <Text
        style={[
          typography.body,
          styles.titulo,
          {
            fontFamily: concluido ? fonts.regular : fonts.medium,
            color: concluido ? colors.textSecondary : colors.text,
            textDecorationLine: concluido ? 'line-through' : 'none',
          },
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 14, marginBottom: 10 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titulo: { flex: 1 },
});