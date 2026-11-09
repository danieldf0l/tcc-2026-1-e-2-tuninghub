import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getEstiloVisual } from '../constants/estilos';
import { useEstilos } from '../context/EstilosContext';

export default function ProjetoCard({ nome, nomeCarro, estilo, progresso, onPress }) {
  const { colors, fonts, typography, radius, shadows } = useTheme();
  const { getNomeEstilo } = useEstilos();

  const visual = getEstiloVisual(estilo);
  const nomeEstiloExibicao = estilo ? getNomeEstilo(estilo) : 'Personalizado';

  const total = progresso?.total ?? 0;
  const concluidos = progresso?.concluidos ?? 0;
  const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  const completo = total > 0 && concluidos === total;

  const titulo = nome || nomeCarro || 'Projeto sem nome';
  const mostrarSubtitulo = !!nome && !!nomeCarro;
  const raioCard = radius.lg + 2;
  const corBarra = completo ? colors.success : visual.cor;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Projeto ${titulo}, ${percentual}% concluído`}
      style={({ pressed }) => [
        styles.sombraWrapper,
        { borderRadius: raioCard, backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.985 : 1 }] },
        shadows.md,
      ]}
    >
      <View style={[styles.interno, { borderRadius: raioCard, borderColor: colors.border }]}>
        <View style={[styles.banner, { backgroundColor: visual.cor }]}>
          <View style={[styles.badge, { borderRadius: radius.pill }]}>
            <Text style={[styles.badgeTexto, { fontFamily: fonts.semibold }]}>{nomeEstiloExibicao}</Text>
          </View>
          <Text style={styles.iconeGrande}>{visual.icone}</Text>
        </View>

        <View style={styles.corpo}>
          <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>
            {titulo}
          </Text>
          {mostrarSubtitulo ? (
            <Text
              style={[typography.caption, styles.subtitulo, { color: colors.textSecondary, fontFamily: fonts.regular }]}
              numberOfLines={1}
            >
              {nomeCarro}
            </Text>
          ) : null}

          <View style={styles.progressoTopo}>
            <Text style={[typography.overline, { color: colors.textSecondary }]}>Progresso</Text>
            <Text style={[styles.percentual, { fontFamily: fonts.bold, color: completo ? colors.success : colors.text }]}>
              {total > 0 ? `${percentual}%` : '—'}
            </Text>
          </View>

          <View style={[styles.barraFundo, { backgroundColor: colors.border }]}>
            <View style={[styles.barraPreenchida, { width: `${percentual}%`, backgroundColor: corBarra }]} />
          </View>

          <Text
            style={[typography.caption, styles.resumo, { color: colors.textSecondary, fontFamily: fonts.regular }]}
          >
            {total > 0
              ? `${concluidos} de ${total} ${total === 1 ? 'serviço concluído' : 'serviços concluídos'}`
              : 'Nenhum serviço na lista ainda'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sombraWrapper: { marginBottom: 16 },
  interno: { borderWidth: 1, overflow: 'hidden' },
  banner: { height: 100, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTexto: { color: '#FEFEFE', fontSize: 11 },
  iconeGrande: { fontSize: 40 },
  corpo: { padding: 16 },
  subtitulo: { marginTop: 2 },
  progressoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  percentual: { fontSize: 13 },
  barraFundo: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barraPreenchida: { height: 6, borderRadius: 3 },
  resumo: { marginTop: 8 },
});