import { Pressable, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Checkbox({ marcado, onToggle, children }) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      style={styles.row}
      hitSlop={6}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!marcado }}
    >
      <View
        style={[
          styles.caixa,
          {
            borderRadius: radius.sm - 2,
            borderColor: marcado ? colors.primary : colors.placeholder,
            backgroundColor: marcado ? colors.primary : 'transparent',
          },
        ]}
      >
        {marcado ? <Check size={14} color={colors.textOnPrimary} strokeWidth={3} /> : null}
      </View>
      <View style={styles.conteudo}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  caixa: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  conteudo: { flex: 1 },
});