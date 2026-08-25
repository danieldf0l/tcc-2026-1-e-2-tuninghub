import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ServicoCheckItem({ nome, selecionado, jaAdicionado, onToggle }) {
  const { colors } = useTheme();
  const desabilitado = jaAdicionado;

  return (
    <Pressable
      onPress={desabilitado ? undefined : onToggle}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: selecionado ? colors.primary : colors.border,
          borderWidth: selecionado ? 2 : 1,
          opacity: desabilitado ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: selecionado ? colors.primary : colors.border,
            backgroundColor: selecionado ? colors.primary : 'transparent',
          },
        ]}
      >
        {selecionado ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={[styles.nome, { color: colors.text }]}>{nome}</Text>
      {jaAdicionado ? (
        <Text style={[styles.tag, { color: colors.textSecondary }]}>Já adicionado</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  check: { color: '#FEFEFE', fontSize: 13, fontWeight: '900' },
  nome: { fontSize: 14, fontWeight: '600', flex: 1 },
  tag: { fontSize: 11, fontWeight: '600' },
});