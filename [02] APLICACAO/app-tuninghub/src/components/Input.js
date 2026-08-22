import { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Input({ label, secureText, error, ...props }) {
  const { colors } = useTheme();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          { borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surface },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureText && !mostrarSenha}
          autoCapitalize="none"
          {...props}
        />
        {secureText && (
          <Pressable onPress={() => setMostrarSenha((v) => !v)}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        )}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: { flex: 1, fontSize: 15 },
  error: { fontSize: 12, marginTop: 4 },
});