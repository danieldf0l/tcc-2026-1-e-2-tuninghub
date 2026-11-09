import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { REGRAS_SENHA } from '../utils/validadores';

// Nada com o campo vazio; uma linha com o que falta; "Senha válida" quando ok
export default function RequisitosSenha({ senha = '' }) {
  const { colors, fonts } = useTheme();
  if (!senha) return null;

  const pendentes = REGRAS_SENHA.filter((r) => !r.testa(senha));
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