import { View, Text, StyleSheet } from 'react-native';
import { Check, QrCode } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatarMoeda } from '../utils/formatters';
import Button from './Button';

// Reflete a regra do backend: plano pago (Valor > 0) libera contato e imagens
const BENEFICIOS_GRATIS = ['Sua oficina aparece nas buscas', 'Gerencie os serviços que você oferece'];
const BENEFICIOS_PRO = [
  'Tudo do plano gratuito',
  'Botão de WhatsApp no seu perfil',
  'Logo e até 6 fotos na galeria',
];

function descreverDuracao(dias) {
  const n = Number(dias);
  if (n === 30) return 'mês';
  if (n === 365 || n === 360) return 'ano';
  return n ? `${n} dias` : null;
}

export default function PlanoCard({ plano, onAssinar, loading }) {
  const { colors, fonts, typography, radius } = useTheme();
  const gratuito = !Number(plano.Valor) || Number(plano.Valor) <= 0;
  const duracao = descreverDuracao(plano.DuracaoDias);
  const beneficios = gratuito ? BENEFICIOS_GRATIS : BENEFICIOS_PRO;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: gratuito ? colors.border : colors.primary,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[typography.h3, styles.nome, { color: colors.text }]}>{plano.Nome}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: gratuito ? colors.surfaceElevated : colors.primarySoft, borderRadius: radius.pill },
          ]}
        >
          <Text style={[styles.badgeTexto, { fontFamily: fonts.bold, color: gratuito ? colors.textSecondary : colors.primary }]}>
            {gratuito ? 'Grátis' : 'Pro'}
          </Text>
        </View>
      </View>

      <View style={styles.precoLinha}>
        <Text style={[typography.h1, { color: colors.text }]}>{formatarMoeda(plano.Valor)}</Text>
        {!gratuito && duracao ? (
          <Text style={[typography.body, styles.duracao, { color: colors.textSecondary }]}> / {duracao}</Text>
        ) : null}
      </View>

      <View style={[styles.divisor, { backgroundColor: colors.border }]} />

      <View style={styles.beneficios}>
        {beneficios.map((b) => (
          <View key={b} style={styles.beneficio}>
            <Check size={16} color={gratuito ? colors.textSecondary : colors.primary} strokeWidth={2.75} />
            <Text style={[typography.body, styles.beneficioTexto, { color: colors.text }]}>{b}</Text>
          </View>
        ))}
      </View>

      <Button
        title={gratuito ? 'Ativar gratuitamente' : 'Assinar com PIX'}
        onPress={onAssinar}
        loading={loading}
        variant={gratuito ? 'outline' : 'primary'}
        Icone={gratuito ? undefined : QrCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, padding: 18, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  nome: { flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4 },
  badgeTexto: { fontSize: 11 },
  precoLinha: { flexDirection: 'row', alignItems: 'baseline' },
  duracao: { marginLeft: 2 },
  divisor: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
  beneficios: { gap: 10, marginBottom: 18 },
  beneficio: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  beneficioTexto: { flex: 1 },
});