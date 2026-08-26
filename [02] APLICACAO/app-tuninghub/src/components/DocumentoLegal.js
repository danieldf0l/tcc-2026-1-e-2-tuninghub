import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function DocumentoLegal({ introducao, clausulas }) {
  const { colors } = useTheme();

  return (
    <View>
      {introducao ? (
        <Text style={[styles.introducao, { color: colors.textSecondary }]}>{introducao}</Text>
      ) : null}

      {clausulas.map((clausula) => (
        <View key={clausula.titulo} style={styles.bloco}>
          <Text style={[styles.tituloClausula, { color: colors.text }]}>{clausula.titulo}</Text>
          {clausula.itens.map((item, index) => (
            <Text key={index} style={[styles.paragrafo, { color: colors.textSecondary }]}>
              {item}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  introducao: { fontSize: 13.5, lineHeight: 21, marginBottom: 24, fontStyle: 'italic' },
  bloco: { marginBottom: 22 },
  tituloClausula: { fontSize: 14, fontWeight: '800', marginBottom: 10, letterSpacing: 0.2 },
  paragrafo: { fontSize: 13.5, lineHeight: 21, marginBottom: 10 },
});