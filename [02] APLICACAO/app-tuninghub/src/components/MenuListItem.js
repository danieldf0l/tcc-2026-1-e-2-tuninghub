import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function MenuListItem({ Icone, titulo, subtitulo, onPress, ultimo, chevron = true, perigo, semCard }) {
  const { colors } = useTheme();
  const corTexto = perigo ? colors.danger : colors.text;
  const corIcone = perigo ? colors.danger : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !ultimo && !semCard && { borderBottomWidth: 1, borderBottomColor: colors.border },
        semCard && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16 },
        { opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.iconeCirculo, { backgroundColor: colors.background }]}>
        <Icone size={18} color={corIcone} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.titulo, { color: corTexto }]}>{titulo}</Text>
        {subtitulo ? <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>{subtitulo}</Text> : null}
      </View>
      {chevron && onPress ? <ChevronRight size={18} color={colors.textSecondary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14 },
  iconeCirculo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 14.5, fontWeight: '700' },
  subtitulo: { fontSize: 12, marginTop: 2 },
});