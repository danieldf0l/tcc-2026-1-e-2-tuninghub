import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Skeleton from './Skeleton';

// Placeholder no formato do ProjetoCard, exibido enquanto os dados carregam
export default function ProjetoCardSkeleton() {
  const { colors, radius } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg + 2 },
      ]}
    >
      <Skeleton height={100} borderRadius={0} />
      <View style={styles.corpo}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="40%" height={13} style={styles.linha} />
        <Skeleton height={6} borderRadius={3} style={styles.barra} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  corpo: { padding: 16 },
  linha: { marginTop: 8 },
  barra: { marginTop: 22 },
});