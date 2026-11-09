import { useEffect, useState } from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { MapPin, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import Chip from './Chip';
import { formatarFaixaPreco } from '../utils/faixaPreco';

const SELO_FUNDO = 'rgba(5, 5, 5, 0.6)'; // fixo: fica sobre a foto, não sobre o tema
const SELO_TEXTO = '#FEFEFE';

function obterIniciais(nome) {
  return (nome || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function formatarDistancia(km) {
  if (km === null || km === undefined || km === '') return null;
  const n = Number(km);
  if (Number.isNaN(n)) return `${km} km`;
  if (n < 1) return `${Math.round(n * 1000)} m`;
  return `${n.toFixed(1).replace('.', ',')} km`;
}

export default function OficinaCard({ oficina, fotoUrl, servicos = [], atendimento, onPress }) {
  const { colors, fonts, typography, radius, shadows } = useTheme();
  const [erroFoto, setErroFoto] = useState(false);

  useEffect(() => {
    setErroFoto(false);
  }, [fotoUrl]);

  const faixaPreco = formatarFaixaPreco(oficina.FaixaPreco);
  const distancia = formatarDistancia(oficina.distanciaKm);
  const local = [oficina.Bairro, oficina.Cidade].filter(Boolean).join(', ');
  const mostrarFoto = !!fotoUrl && !erroFoto;
  const extras = servicos.length - 3;

  const faltantes = atendimento?.faltantes || [];
  const atendeTudo = !!atendimento && atendimento.atendidos === atendimento.total;
  const raioCard = radius.lg + 2;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Oficina ${oficina.NomeOficina}`}
      style={({ pressed }) => [
        styles.sombraWrapper,
        { borderRadius: raioCard, backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.985 : 1 }] },
        shadows.md,
      ]}
    >
      <View style={[styles.interno, { borderRadius: raioCard, borderColor: colors.border }]}>
        <View style={[styles.midia, { backgroundColor: colors.skeleton }]}>
          {mostrarFoto ? (
            <Image
              source={{ uri: fotoUrl }}
              style={styles.foto}
              resizeMode="cover"
              onError={() => setErroFoto(true)}
            />
          ) : (
            <View style={[styles.foto, styles.fotoVazia, { backgroundColor: colors.primarySoft }]}>
              <View style={[styles.iniciais, { backgroundColor: colors.primary, borderRadius: radius.lg }]}>
                <Text style={[styles.iniciaisTexto, { color: colors.textOnPrimary, fontFamily: fonts.extrabold }]}>
                  {obterIniciais(oficina.NomeOficina)}
                </Text>
              </View>
            </View>
          )}

          {distancia ? (
            <View style={[styles.selo, styles.seloEsquerda, { borderRadius: radius.pill }]}>
              <MapPin size={12} color={SELO_TEXTO} strokeWidth={2.5} />
              <Text style={[styles.seloTexto, { fontFamily: fonts.semibold }]}>{distancia}</Text>
            </View>
          ) : null}

          {faixaPreco ? (
            <View style={[styles.selo, styles.seloDireita, { borderRadius: radius.pill }]}>
              <Text style={[styles.seloTexto, { fontFamily: fonts.bold }]}>{faixaPreco}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.corpo}>
          <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>
            {oficina.NomeOficina}
          </Text>

          {local ? (
            <Text
              style={[typography.caption, styles.local, { color: colors.textSecondary, fontFamily: fonts.regular }]}
              numberOfLines={1}
            >
              {local}
            </Text>
          ) : null}

          {atendimento ? (
            <View style={styles.atendimento}>
              <View
                style={[
                  styles.atendeSelo,
                  {
                    backgroundColor: atendeTudo ? colors.successSoft : colors.surfaceElevated,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                {atendeTudo ? <Check size={13} color={colors.success} strokeWidth={3} /> : null}
                <Text
                  style={[
                    styles.atendeTexto,
                    { fontFamily: fonts.bold, color: atendeTudo ? colors.success : colors.text },
                  ]}
                >
                  Atende {atendimento.atendidos} de {atendimento.total}{' '}
                  {atendimento.total === 1 ? 'serviço' : 'serviços'}
                </Text>
              </View>

              {faltantes.length > 0 ? (
                <Text
                  style={[typography.caption, styles.faltam, { color: colors.textSecondary, fontFamily: fonts.regular }]}
                  numberOfLines={2}
                >
                  Não faz: {faltantes.join(', ')}
                </Text>
              ) : null}
            </View>
          ) : null}

          {servicos.length > 0 ? (
            <View style={styles.chipsRow}>
              {servicos.slice(0, 3).map((s) => (
                <Chip key={s.IdServico} label={s.Nome} small />
              ))}
              {extras > 0 ? <Chip label={`+${extras}`} small /> : null}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sombraWrapper: { marginBottom: 18 },
  interno: { borderWidth: 1, overflow: 'hidden' },
  midia: { width: '100%', height: 170 },
  foto: { width: '100%', height: '100%' },
  fotoVazia: { alignItems: 'center', justifyContent: 'center' },
  iniciais: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  iniciaisTexto: { fontSize: 22 },
  selo: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: SELO_FUNDO,
  },
  seloEsquerda: { left: 12 },
  seloDireita: { right: 12 },
  seloTexto: { color: SELO_TEXTO, fontSize: 12 },
  corpo: { padding: 14, paddingTop: 12 },
  local: { marginTop: 2 },
  atendimento: { marginTop: 10 },
  atendeSelo: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  atendeTexto: { fontSize: 12.5 },
  faltam: { marginTop: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6, marginTop: 10 },
});