import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getEstiloVisual } from '../constants/estilos';
import { useEstilos } from '../context/EstilosContext';

export default function ProjetoCard({ nome, nomeCarro, estilo, progresso, onPress }) {
  const { colors, isDark } = useTheme();
  const { getNomeEstilo } = useEstilos();

  const visual = getEstiloVisual(estilo);
  const nomeEstiloExibicao = estilo ? getNomeEstilo(estilo) : 'Personalizado';

  const total = progresso?.total ?? 0;
  const concluidos = progresso?.concluidos ?? 0;
  const percentual = total > 0 ? concluidos / total : 0;

  const titulo = nome || nomeCarro || 'Projeto sem nome';
  const mostrarSubtitulo = !!nome && !!nomeCarro;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
        !isDark && styles.sombra,
      ]}
    >
      <View style={[styles.banner, { backgroundColor: visual.cor }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{nomeEstiloExibicao}</Text>
        </View>
        <Text style={styles.iconeGrande}>{visual.icone}</Text>
      </View>

      <View style={styles.corpo}>
        <Text style={[styles.titulo, { color: colors.text }]} numberOfLines={1}>
          {titulo}
        </Text>
        {mostrarSubtitulo ? (
          <Text style={[styles.subtitulo, { color: colors.textSecondary }]} numberOfLines={1}>
            {nomeCarro}
          </Text>
        ) : null}

        <View style={[styles.divisor, { backgroundColor: colors.border }]} />

        <View style={styles.statsRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Progresso</Text>
            <Text style={[styles.statValor, { color: colors.text }]}>
              {total > 0 ? `${concluidos}/${total} concluídos` : 'Sem itens ainda'}
            </Text>
            <View style={[styles.barraFundo, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barraPreenchida,
                  { width: `${percentual * 100}%`, backgroundColor: visual.cor },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  sombra: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  banner: { height: 100, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: '#FEFEFE', fontSize: 11, fontWeight: '700' },
  iconeGrande: { fontSize: 40 },
  corpo: { padding: 16 },
  titulo: { fontSize: 17, fontWeight: '800' },
  subtitulo: { fontSize: 13, marginTop: 2 },
  divisor: { height: 1, marginVertical: 12 },
  statsRow: { flexDirection: 'row' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 },
  statValor: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  barraFundo: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barraPreenchida: { height: 6, borderRadius: 3 },
});