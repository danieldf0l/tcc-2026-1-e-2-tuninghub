import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ServicoCheckItem({ nome, selecionado, jaAdicionado, desabilitado, onToggle }) {
  const { colors, typography, fonts, radius } = useTheme();
  const bloqueado = jaAdicionado || desabilitado;

  return (
    <Pressable
      onPress={bloqueado ? undefined : onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selecionado, disabled: !!bloqueado }}
      style={({ pressed }) => [
        styles.row,
        {
          borderRadius: radius.md,
          backgroundColor: selecionado ? colors.primarySoft : colors.surface,
          borderColor: selecionado ? colors.primary : colors.border,
          opacity: bloqueado ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.caixa,
          {
            borderRadius: radius.sm - 2,
            borderColor: selecionado ? colors.primary : colors.placeholder,
            backgroundColor: selecionado ? colors.primary : 'transparent',
          },
        ]}
      >
        {selecionado ? <Check size={14} color={colors.textOnPrimary} strokeWidth={3} /> : null}
      </View>

      <Text style={[typography.body, styles.nome, { color: colors.text, fontFamily: fonts.medium }]}>
        {nome}
      </Text>

      {jaAdicionado ? (
        <View style={[styles.badge, { backgroundColor: colors.surfaceElevated, borderRadius: radius.pill }]}>
          <Check size={12} color={colors.textSecondary} strokeWidth={2.5} />
          <Text style={[styles.badgeTexto, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
            Já adicionado
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, padding: 14, marginBottom: 10 },
  caixa: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nome: { flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  badgeTexto: { fontSize: 11 },
});