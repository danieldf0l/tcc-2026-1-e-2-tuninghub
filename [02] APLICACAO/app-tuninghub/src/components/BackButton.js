import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function BackButton({ onPress }) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? (isDark ? '#2A2B2C' : '#E2DFDD') : 'transparent' },
      ]}
    >
      <Text style={[styles.arrow, { color: colors.text }]}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: { fontSize: 30, fontWeight: '600', marginTop: -2 },
});