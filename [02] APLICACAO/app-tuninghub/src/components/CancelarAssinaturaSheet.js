import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ImageOff, Store, RotateCcw, Wallet } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import Button from './Button';

export function formatarReais(valor) {
  const numero = Number(valor) || 0;
  return `R$ ${numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

// Confirmação do cancelamento do plano Pro, mostrando o que muda e o reembolso estimado
export default function CancelarAssinaturaSheet({ visivel, onFechar, onConfirmar, carregando, nomePlano, reembolso, temRenovacaoPaga }) {
  const { colors, fonts, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const valor = Number(reembolso?.valor) || 0;

  const consequencias = [
    { Icone: ImageOff, texto: 'A logo, as fotos e o botão de WhatsApp saem do seu perfil na hora.' },
    { Icone: Store, texto: 'A oficina volta para o plano gratuito e continua aparecendo nas buscas.' },
    { Icone: RotateCcw, texto: 'Você pode assinar o Pro de novo quando quiser. Nada é apagado.' },
  ];

  return (
    <Modal visible={visivel} transparent animationType="slide" statusBarTranslucent onRequestClose={onFechar}>
      <View style={styles.raiz}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={carregando ? undefined : onFechar}
          accessibilityLabel="Fechar"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.alca, { backgroundColor: colors.border }]} />

          <View style={[styles.iconeTopo, { backgroundColor: colors.dangerSoft, borderRadius: radius.pill }]}>
            <AlertTriangle size={24} color={colors.danger} strokeWidth={2.25} />
          </View>
          <Text style={[typography.h3, styles.titulo, { color: colors.text }]}>Cancelar o {nomePlano || 'plano Pro'}?</Text>

          <View style={styles.lista}>
            {consequencias.map(({ Icone, texto }) => (
              <View key={texto} style={styles.linha}>
                <Icone size={18} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[typography.body, styles.flex, { color: colors.text }]}>{texto}</Text>
              </View>
            ))}
          </View>

          {valor > 0 ? (
            <View style={[styles.reembolso, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
              <Wallet size={20} color={colors.success} strokeWidth={2.25} />
              <View style={styles.flex}>
                <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
                  Valor estimado a devolver
                </Text>
                <Text style={[typography.h3, { color: colors.text }]}>{formatarReais(valor)}</Text>
                <Text style={[typography.caption, styles.reembolsoNota, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  {temRenovacaoPaga ? 'Inclui a renovação que você já pagou. ' : ''}
                  Proporcional aos dias que faltam. O estorno é feito pela nossa equipe.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.botoes}>
            <Button title="Cancelar plano" variant="danger" onPress={onConfirmar} loading={carregando} />
            <Button title="Manter meu plano" variant="ghost" onPress={onFechar} disabled={carregando} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  raiz: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: 20 },
  alca: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 18 },
  iconeTopo: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  titulo: { textAlign: 'center', marginTop: 14, marginBottom: 18 },
  lista: { gap: 14, marginBottom: 18 },
  linha: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reembolso: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, padding: 14, marginBottom: 18 },
  reembolsoNota: { marginTop: 4 },
  botoes: { gap: 8 },
});
