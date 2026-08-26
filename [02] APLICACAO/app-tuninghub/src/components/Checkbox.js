import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Checkbox({ marcado, onToggle, children }) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onToggle} style={styles.row} hitSlop={6}>
      <View
        style={[
          styles.caixa,
          {
            borderColor: marcado ? colors.primary : colors.border,
            backgroundColor: marcado ? colors.primary : 'transparent',
          },
        ]}
      >
        {marcado ? <Check size={13} color={colors.background} strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  caixa: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
});