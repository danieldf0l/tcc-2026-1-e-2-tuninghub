import { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Input({ label, secureText, error, Icone, onFocus, onBlur, ...props }) {
  const { colors, typography, fonts, layout, radius } = useTheme();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focado, setFocado] = useState(false);

  const temErro = !!error;
  const mensagemErro = typeof error === 'string' ? error : null;
  const multiline = !!props.multiline;

  const corBorda = temErro ? colors.danger : focado ? colors.primary : colors.border;
  const corIcone = temErro ? colors.danger : focado ? colors.primary : colors.placeholder;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[typography.caption, styles.label, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputRow,
          {
            height: multiline ? undefined : layout.controlHeight,
            minHeight: multiline ? 110 : undefined,
            alignItems: multiline ? 'flex-start' : 'center',
            paddingVertical: multiline ? 12 : 0,
            borderRadius: radius.md,
            borderColor: corBorda,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {Icone ? (
          <View style={[styles.iconeEsquerda, multiline && { marginTop: 2 }]}>
            <Icone size={18} color={corIcone} strokeWidth={2} />
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: fonts.regular,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureText && !mostrarSenha}
          autoCapitalize="none"
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {secureText && (
          <Pressable
            onPress={() => setMostrarSenha((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            style={styles.iconeDireita}
          >
            {mostrarSenha ? (
              <EyeOff size={20} color={colors.textSecondary} strokeWidth={2} />
            ) : (
              <Eye size={20} color={colors.textSecondary} strokeWidth={2} />
            )}
          </Pressable>
        )}
      </View>

      {mensagemErro ? (
        <Text style={[typography.caption, styles.error, { color: colors.danger }]}>{mensagemErro}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  iconeEsquerda: { marginRight: 10 },
  iconeDireita: { marginLeft: 10 },
  error: { marginTop: 6 },
});