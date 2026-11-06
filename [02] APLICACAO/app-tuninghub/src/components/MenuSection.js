import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function MenuSection({ title, children }) {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={styles.wrapper}>
      {title ? (
        <Text style={[typography.overline, styles.title, { color: colors.textSecondary }]}>{title}</Text>
      ) : null}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  title: { marginBottom: 8, marginLeft: 4 },
  card: { borderWidth: 1, overflow: 'hidden' },
});