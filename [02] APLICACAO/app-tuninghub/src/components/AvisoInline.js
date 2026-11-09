import { View, Text, StyleSheet } from 'react-native';
import { X, Info, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

// tipo: 'erro' | 'sucesso' | 'info'
export default function AvisoInline({ mensagem, tipo = 'erro' }) {
  const { colors, fonts, radius } = useTheme();
  if (!mensagem) return null;

  const tipos = {
    erro: { Icone: X, cor: colors.danger, fundo: colors.dangerSoft, texto: colors.danger },
    sucesso: { Icone: Check, cor: colors.success, fundo: colors.successSoft, texto: colors.success },
    info: { Icone: Info, cor: colors.textSecondary, fundo: colors.surface, texto: colors.text },
  };
  const t = tipos[tipo] || tipos.erro;

  return (
    <View
      style={[styles.caixa, { backgroundColor: t.fundo, borderRadius: radius.md }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.icone, { borderColor: t.cor }]}>
        <t.Icone size={11} color={t.cor} strokeWidth={3} />
      </View>
      <Text style={[styles.texto, { color: t.texto, fontFamily: fonts.medium }]}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, marginBottom: 16 },
  icone: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  texto: { flex: 1, fontSize: 13.5, lineHeight: 19 },
});