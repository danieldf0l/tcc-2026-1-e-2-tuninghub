import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ProgressoEtapas({ atual, total = 3 }) {
  const { colors, fonts, radius } = useTheme();

  return (
    <View style={styles.wrapper} accessibilityLabel={`Etapa ${atual} de ${total}`}>
      <View style={styles.barras}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.barra,
              { borderRadius: radius.pill, backgroundColor: i < atual ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.texto, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
        {atual}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barras: { flexDirection: 'row', gap: 4 },
  barra: { width: 22, height: 4 },
  texto: { fontSize: 12 },
});