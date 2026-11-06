import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function MenuListItem({ Icone, titulo, subtitulo, onPress, ultimo, chevron = true, perigo, semCard }) {
  const { colors, typography, fonts, radius } = useTheme();

  const corTexto = perigo ? colors.danger : colors.text;
  const corIcone = perigo ? colors.danger : colors.text;
  const fundoIcone = perigo ? colors.dangerSoft : colors.surfaceElevated;
  const mostrarDivisoria = !ultimo && !semCard;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.row,
        semCard && {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
        },
        pressed && { backgroundColor: colors.surfaceElevated },
      ]}
    >
      <View style={[styles.icone, { backgroundColor: fundoIcone, borderRadius: radius.sm + 2 }]}>
        <Icone size={18} color={corIcone} strokeWidth={2} />
      </View>

      <View
        style={[
          styles.conteudo,
          mostrarDivisoria && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.textos}>
          <Text style={[typography.bodyStrong, { color: corTexto }]} numberOfLines={1}>
            {titulo}
          </Text>
          {subtitulo ? (
            <Text
              style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}
              numberOfLines={2}
            >
              {subtitulo}
            </Text>
          ) : null}
        </View>
        {chevron && onPress ? <ChevronRight size={18} color={colors.textSecondary} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14 },
  icone: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  conteudo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingVertical: 14,
    paddingRight: 14,
    minHeight: 58,
  },
  textos: { flex: 1, gap: 2 },
});