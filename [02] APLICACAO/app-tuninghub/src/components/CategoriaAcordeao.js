import { View, Text, Pressable, LayoutAnimation, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { toqueSelecao } from '../utils/haptics';

// Linha de categoria que abre/fecha (acordeão). O conteúdo vem em `children`.
export default function CategoriaAcordeao({ Icone, titulo, contador, aberto, onAlternar, ultimo, children }) {
  const { colors, fonts, typography, radius } = useTheme();

  function alternar() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toqueSelecao();
    onAlternar?.();
  }

  return (
    <View
      style={[
        styles.wrapper,
        !ultimo && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <Pressable
        onPress={alternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: !!aberto }}
        accessibilityLabel={contador ? `${titulo}, ${contador}` : titulo}
        style={({ pressed }) => [styles.topo, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={[styles.icone, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.md }]}>
          {Icone ? <Icone size={16} color={colors.text} strokeWidth={2.25} /> : null}
        </View>

        <Text style={[typography.bodyStrong, styles.titulo, { color: colors.text }]} numberOfLines={1}>
          {titulo}
        </Text>

        {contador ? (
          <Text style={[typography.caption, styles.contador, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
            {contador}
          </Text>
        ) : null}

        <View style={{ transform: [{ rotate: aberto ? '180deg' : '0deg' }] }}>
          <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2.25} />
        </View>
      </Pressable>

      {aberto ? <View style={styles.conteudo}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  topo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  icone: { width: 32, height: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { flex: 1 },
  contador: { marginRight: 2 },
  conteudo: { paddingBottom: 14 },
});
