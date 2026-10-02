import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const OPCOES = ['$', '$$', '$$$'];

export default function FaixaPrecoSelector({ valor, onSelecionar, disabled }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {OPCOES.map((opcao) => {
        const selecionado = valor === opcao;
        return (
          <Pressable
            key={opcao}
            onPress={() => !disabled && onSelecionar(opcao)}
            style={[
              styles.opcao,
              {
                backgroundColor: selecionado ? colors.primary : colors.surface,
                borderColor: selecionado ? colors.primary : colors.border,
                opacity: disabled ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.texto, { color: selecionado ? colors.background : colors.text }]}>
              {opcao}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  opcao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  texto: { fontSize: 16, fontWeight: '800' },
});