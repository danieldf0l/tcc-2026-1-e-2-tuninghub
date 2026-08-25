import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function QuickActionCard({ Icone, titulo, subtitulo, onPress, corFundo, corIcone }) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        !isDark && styles.sombra,
      ]}
    >
      <View style={[styles.icone, { backgroundColor: corFundo || colors.primary }]}>
        <Icone size={22} color={corIcone || colors.background} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.titulo, { color: colors.text }]}>{titulo}</Text>
        <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>{subtitulo}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  sombra: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  icone: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  titulo: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  subtitulo: { fontSize: 12.5 },
});