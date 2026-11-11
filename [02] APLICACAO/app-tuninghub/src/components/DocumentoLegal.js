import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function DocumentoLegal({ introducao, clausulas }) {
  const { colors, typography, fonts, radius } = useTheme();

  return (
    <View>
      {introducao ? (
        <View style={[styles.introducao, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{introducao}</Text>
        </View>
      ) : null}

      {clausulas.map((clausula) => (
        <View key={clausula.titulo} style={styles.bloco}>
          <Text style={[typography.h3, styles.titulo, { color: colors.text }]}>{clausula.titulo}</Text>
          {clausula.itens.map((item, index) => (
            <Text
              key={index}
              style={[typography.body, styles.paragrafo, { color: colors.textSecondary, fontFamily: fonts.regular }]}
            >
              {item}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  introducao: { borderWidth: 1, padding: 16, marginBottom: 28 },
  bloco: { marginBottom: 24 },
  titulo: { marginBottom: 10 },
  paragrafo: { lineHeight: 23, marginBottom: 10 },
});