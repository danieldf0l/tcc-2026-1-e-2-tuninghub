import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const OPCOES = ['$', '$$', '$$$'];

export default function FaixaPrecoSelector({ valor, onSelecionar, disabled }) {
  const { colors, fonts, radius } = useTheme();

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {OPCOES.map((opcao) => {
        const selecionado = valor === opcao;
        return (
          <Pressable
            key={opcao}
            onPress={() => !disabled && onSelecionar(opcao)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected: selecionado, disabled: !!disabled }}
            accessibilityLabel={`Faixa de preço ${opcao.length} de 3`}
            style={({ pressed }) => [
              styles.opcao,
              {
                borderRadius: radius.md,
                backgroundColor: selecionado ? colors.primarySoft : colors.surface,
                borderColor: selecionado ? colors.primary : colors.border,
                opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.texto,
                { fontFamily: fonts.extrabold, color: selecionado ? colors.primary : colors.textSecondary },
              ]}
            >
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
  opcao: { flex: 1, paddingVertical: 14, borderWidth: 1.5, alignItems: 'center' },
  texto: { fontSize: 16, letterSpacing: 1 },
});