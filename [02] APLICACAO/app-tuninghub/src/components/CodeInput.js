import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const TAMANHO = 6;

export default function CodeInput({ value, onChange, error, autoFocus = true }) {
  const { colors, fonts, radius } = useTheme();
  const inputRef = useRef(null);
  const [focado, setFocado] = useState(false);
  const digitos = (value || '').split('');

  // No iOS, um campo com opacidade 0 não recebe toque — então a área das
  // caixas é que recebe o toque e foca o campo invisível
  function focar() {
    const input = inputRef.current;
    if (!input) return;

    // Android: o teclado pode ter sido fechado pelo "voltar" sem tirar o foco
    if (input.isFocused?.() && !Keyboard.isVisible?.()) {
      input.blur();
      setTimeout(() => input.focus(), 50);
      return;
    }
    input.focus();
  }

  return (
    <Pressable
      onPress={focar}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel="Digitar código de verificação de 6 dígitos"
    >
      <View style={styles.caixas} pointerEvents="none">
        {Array.from({ length: TAMANHO }).map((_, i) => {
          const indiceAtivo = Math.min(digitos.length, TAMANHO - 1);
          const ativo = focado && i === indiceAtivo;
          const preenchido = !!digitos[i];

          return (
            <View
              key={i}
              style={[
                styles.caixa,
                {
                  borderRadius: radius.md,
                  backgroundColor: colors.surface,
                  borderColor: error
                    ? colors.danger
                    : ativo
                    ? colors.primary
                    : preenchido
                    ? colors.textSecondary
                    : colors.border,
                },
              ]}
            >
              <Text style={[styles.digito, { color: colors.text, fontFamily: fonts.bold }]}>{digitos[i] || ''}</Text>
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, TAMANHO))}
        keyboardType="number-pad"
        maxLength={TAMANHO}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        caretHidden
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={styles.inputOculto}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  caixas: { flexDirection: 'row', gap: 8 },
  caixa: { flex: 1, height: 58, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  digito: { fontSize: 24 },
  inputOculto: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});