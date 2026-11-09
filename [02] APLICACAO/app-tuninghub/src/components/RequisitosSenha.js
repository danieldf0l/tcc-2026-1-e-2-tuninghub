import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

// Espelha a regra do backend (validação real continua lá)
const REGRAS = [
  { rotulo: '8 caracteres', testa: (s) => s.length >= 8 },
  { rotulo: 'letra maiúscula', testa: (s) => /[A-Z]/.test(s) },
  { rotulo: 'número', testa: (s) => /\d/.test(s) },
  { rotulo: 'símbolo', testa: (s) => /[^A-Za-z0-9]/.test(s) },
];

// Nada com o campo vazio; uma linha com o que falta; "Senha válida" quando ok
export default function RequisitosSenha({ senha = '' }) {
  const { colors, fonts } = useTheme();
  if (!senha) return null;

  const pendentes = REGRAS.filter((r) => !r.testa(senha));
  const ok = pendentes.length === 0;

  return (
    <View style={styles.linha}>
      {ok ? <Check size={14} color={colors.success} strokeWidth={3} /> : null}
      <Text
        style={[
          styles.texto,
          { color: ok ? colors.success : colors.textSecondary, fontFamily: ok ? fonts.semibold : fonts.regular },
        ]}
      >
        {ok ? 'Senha válida' : `Falta: ${pendentes.map((r) => r.rotulo).join(' · ')}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -6, marginBottom: 14, paddingLeft: 4 },
  texto: { fontSize: 12.5 },
});