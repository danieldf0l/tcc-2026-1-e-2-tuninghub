import { Pressable, View, Text, Image, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Chip from './Chip';
import { formatarFaixaPreco } from '../utils/faixaPreco';

function Iniciais({ nome, tamanho, cor, background }) {
  const iniciais = (nome || '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.avatarFallback, { width: tamanho, height: tamanho, borderRadius: 14, backgroundColor: background }]}>
      <Text style={[styles.avatarTexto, { color: cor, fontSize: tamanho * 0.35 }]}>{iniciais}</Text>
    </View>
  );
}

export default function OficinaCard({ oficina, fotoUrl, servicos = [], onPress }) {
  const { colors, isDark } = useTheme();
  const faixaPreco = formatarFaixaPreco(oficina.FaixaPreco);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
        !isDark && styles.sombra,
      ]}
    >
      {fotoUrl ? (
        <Image source={{ uri: fotoUrl }} style={styles.foto} resizeMode="cover" />
      ) : (
        <View style={[styles.foto, styles.fotoVazia, { backgroundColor: colors.background }]}>
          <Iniciais nome={oficina.NomeOficina} tamanho={64} cor={colors.background} background={colors.primary} />
        </View>
      )}

      <View style={styles.corpo}>
        <View style={styles.linhaTopo}>
          <Text style={[styles.nome, { color: colors.text }]} numberOfLines={1}>
            {oficina.NomeOficina}
          </Text>
          <Text style={[styles.distancia, { color: colors.primary }]}>{oficina.distanciaKm} km</Text>
        </View>

        <Text style={[styles.local, { color: colors.textSecondary }]} numberOfLines={1}>
          {[oficina.Bairro, oficina.Cidade].filter(Boolean).join(', ')}
        </Text>

        {servicos.length > 0 && (
          <View style={styles.chipsRow}>
            {servicos.slice(0, 3).map((s) => (
              <Chip key={s.IdServico} label={s.Nome} small />
            ))}
          </View>
        )}

        {faixaPreco ? (
          <Text style={[styles.faixaPreco, { color: colors.textSecondary }]}>{faixaPreco}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', marginBottom: 18 },
  sombra: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  foto: { width: '100%', height: 160 },
  fotoVazia: { alignItems: 'center', justifyContent: 'center' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontWeight: '800' },
  corpo: { padding: 14 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
  distancia: { fontSize: 13, fontWeight: '700' },
  local: { fontSize: 12, marginTop: 2, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  faixaPreco: { fontSize: 13, fontWeight: '700', marginTop: 6 },
});