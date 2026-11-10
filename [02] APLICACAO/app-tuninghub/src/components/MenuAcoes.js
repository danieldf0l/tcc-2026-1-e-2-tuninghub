import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

// opcoes: [{ chave, rotulo, descricao?, Icone?, onPress, perigo?, desabilitado?, chevron? }]
export default function MenuAcoes({ visivel, onFechar, titulo, subtitulo, opcoes = [] }) {
  const { colors, fonts, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();

  function escolher(opcao) {
    onFechar();
    // Espera o sheet fechar: abrir um Alert durante o fechamento do Modal falha no iOS
    setTimeout(() => opcao.onPress?.(), 300);
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" statusBarTranslucent onRequestClose={onFechar}>
      <View style={styles.raiz}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onFechar}
          accessibilityLabel="Fechar"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <View style={[styles.alca, { backgroundColor: colors.border }]} />

          {titulo ? <Text style={[typography.h3, styles.titulo, { color: colors.text }]}>{titulo}</Text> : null}
          {subtitulo ? (
            <Text style={[typography.caption, styles.subtitulo, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {subtitulo}
            </Text>
          ) : null}

          {opcoes.map((op) => {
            const cor = op.perigo ? colors.danger : colors.text;
            return (
              <Pressable
                key={op.chave}
                onPress={() => escolher(op)}
                disabled={op.desabilitado}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.opcao,
                  { backgroundColor: pressed ? colors.surface : 'transparent', opacity: op.desabilitado ? 0.45 : 1 },
                ]}
              >
                {op.Icone ? (
                  <View
                    style={[
                      styles.opcaoIcone,
                      { backgroundColor: op.perigo ? colors.dangerSoft : colors.surface, borderRadius: radius.sm + 2 },
                    ]}
                  >
                    <op.Icone size={18} color={cor} strokeWidth={2} />
                  </View>
                ) : null}
                <View style={styles.opcaoTextos}>
                  <Text style={[typography.bodyStrong, { color: cor }]} numberOfLines={1}>
                    {op.rotulo}
                  </Text>
                  {op.descricao ? (
                    <Text
                      style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}
                      numberOfLines={2}
                    >
                      {op.descricao}
                    </Text>
                  ) : null}
                </View>
                {op.chevron ? <ChevronRight size={18} color={colors.textSecondary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '80%' },
  alca: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 12 },
  titulo: { paddingHorizontal: 20 },
  subtitulo: { paddingHorizontal: 20, marginTop: 4 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 20, marginTop: 4 },
  opcaoIcone: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  opcaoTextos: { flex: 1, gap: 2 },
});