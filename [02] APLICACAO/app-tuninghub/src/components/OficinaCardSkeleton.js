import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Skeleton from './Skeleton';

// Placeholder no formato do OficinaCard, exibido enquanto a busca carrega
export default function OficinaCardSkeleton() {
  const { colors, radius } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg + 2 },
      ]}
    >
      <Skeleton height={170} borderRadius={0} />
      <View style={styles.corpo}>
        <Skeleton width="55%" height={18} />
        <Skeleton width="35%" height={12} style={styles.linha} />
        <View style={styles.chips}>
          <Skeleton width={72} height={22} borderRadius={radius.pill} />
          <Skeleton width={88} height={22} borderRadius={radius.pill} />
          <Skeleton width={60} height={22} borderRadius={radius.pill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden', marginBottom: 18 },
  corpo: { padding: 14 },
  linha: { marginTop: 8 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 12 },
});