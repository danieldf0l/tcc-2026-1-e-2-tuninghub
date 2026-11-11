import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, AppState, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Clock, Crown, CalendarX, Check } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { analisarAssinatura } from '../../../hooks/useAssinaturaOficina';
import { listarPlanos } from '../../../api/plano.api';
import {
  buscarMinhaAssinatura,
  assinarPlanoGratuito,
  iniciarCheckout,
  confirmarPagamento,
} from '../../../api/assinatura.api';
import { abrirCheckout } from '../../../utils/pagamento';
import { formatarData } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/errorHandler';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import PlanoCard, { BENEFICIOS_PRO } from '../../../components/PlanoCard';
import AvisoInline from '../../../components/AvisoInline';
import Skeleton from '../../../components/Skeleton';
import Button from '../../../components/Button';

const ehPago = (valor) => Number(valor) > 0;

export default function MinhaAssinaturaScreen({ navigation }) {
  const { colors, fonts, typography, radius } = useTheme();
  const { verificarAssinatura } = useAuth();
  const { mostrar } = useToast();

  const [assinatura, setAssinatura] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idPlanoProcessando, setIdPlanoProcessando] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [abrindoPagamento, setAbrindoPagamento] = useState(false);
  const [erro, setErro] = useState('');
  const conferindoRef = useRef(false);

  const { temPlanoPro, gratuitoAtivo, pendente, planoVencido, diasRestantes, venceEmBreve } =
    analisarAssinatura(assinatura);

  async function carregar() {
    try {
      const minha = await buscarMinhaAssinatura();
      setAssinatura(minha);
      const a = analisarAssinatura(minha);
      setPlanos(!a.temPlanoPro && !a.pendente ? await listarPlanos() : []);
      setErro('');
      return minha;
    } catch (e) {
      setErro(getErrorMessage(e));
      return null;
    } finally {
      setCarregando(false);
    }
  }

  // Confere o PIX no AbacatePay. Silencioso por padrão; devolve true se ativou.
  async function conferirPagamento(idAssinatura, { avisarSePendente = false } = {}) {
    if (!idAssinatura || conferindoRef.current) return false;
    conferindoRef.current = true;
    try {
      const r = await confirmarPagamento(idAssinatura);
      if (r.status === 'ATIVA') {
        await verificarAssinatura();
        await carregar();
        mostrar('Pagamento confirmado! Seu plano Pro está ativo.');
        return true;
      }
      if (avisarSePendente) mostrar('Pagamento ainda não identificado. Tente de novo em alguns instantes.', 'info');
      return false;
    } catch (e) {
      if (avisarSePendente) setErro(getErrorMessage(e));
      return false;
    } finally {
      conferindoRef.current = false;
    }
  }

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const minha = await carregar();
        if (minha?.Status === 'PENDENTE') conferirPagamento(minha.IdAssinatura);
      })();
    }, [])
  );

  // Voltou ao app (ex.: depois de pagar no banco): confere sozinho
  useEffect(() => {
    if (!pendente) return undefined;
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') conferirPagamento(assinatura?.IdAssinatura);
    });
    return () => sub.remove();
  }, [pendente, assinatura?.IdAssinatura]);

  async function handleVerificarManual() {
    setErro('');
    setVerificando(true);
    await conferirPagamento(assinatura?.IdAssinatura, { avisarSePendente: true });
    setVerificando(false);
  }

  // PIX pendente: o backend devolve o MESMO link se ainda estiver aguardando
  async function handleAbrirPagamento() {
    if (!assinatura?.IdPlano) return;
    setErro('');
    setAbrindoPagamento(true);
    try {
      const r = await iniciarCheckout(assinatura.IdPlano);
      await abrirCheckout(r.checkoutUrl);
      await conferirPagamento(r.idAssinatura || assinatura.IdAssinatura);
    } catch (e) {
      // 409 pode significar que já estava pago: o backend ativa e avisa
      await verificarAssinatura();
      await carregar();
      setErro(getErrorMessage(e));
    } finally {
      setAbrindoPagamento(false);
    }
  }

  async function handleAssinar(plano) {
    setErro('');
    setIdPlanoProcessando(plano.IdPlano);
    try {
      if (!ehPago(plano.Valor)) {
        await assinarPlanoGratuito(plano.IdPlano);
        await verificarAssinatura();
        await carregar();
        mostrar('Plano gratuito ativado.');
      } else {
        const r = await iniciarCheckout(plano.IdPlano);
        await verificarAssinatura();
        await carregar();
        await abrirCheckout(r.checkoutUrl);
        await conferirPagamento(r.idAssinatura);
      }
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setIdPlanoProcessando(null);
    }
  }

  function CartaoStatus({ Icone, cor, fundo, borda, titulo, texto, children }) {
    return (
      <View style={[styles.status, { backgroundColor: colors.surface, borderColor: borda, borderRadius: radius.lg }]}>
        <View style={styles.statusTopo}>
          <View style={[styles.statusIcone, { backgroundColor: fundo, borderRadius: radius.md }]}>
            <Icone size={22} color={cor} strokeWidth={2.25} />
          </View>
          <View style={styles.flex}>
            <Text style={[typography.overline, { color: colors.textSecondary }]}>Seu plano</Text>
            <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>{titulo}</Text>
          </View>
        </View>
        {texto ? <Text style={[typography.body, styles.statusTexto, { color: colors.textSecondary }]}>{texto}</Text> : null}
        {children}
      </View>
    );
  }

  function renderStatus() {
    if (!assinatura) return null;

    if (pendente) {
      return (
        <CartaoStatus
          Icone={Clock}
          cor={colors.warning}
          fundo={colors.warningSoft}
          borda={colors.warning}
          titulo={assinatura.NomePlano || 'Plano Pro'}
          texto="Aguardando a confirmação do PIX. Assim que o pagamento cair, o plano é ativado."
        >
          <View style={styles.botoes}>
            {assinatura.IdPlano ? (
              <Button title="Abrir pagamento" onPress={handleAbrirPagamento} loading={abrindoPagamento} disabled={verificando} />
            ) : null}
            <Button
              title="Já paguei, verificar"
              variant="outline"
              onPress={handleVerificarManual}
              loading={verificando}
              disabled={abrindoPagamento}
            />
          </View>
        </CartaoStatus>
      );
    }

    if (temPlanoPro) {
      const restante =
        diasRestantes === null ? '' : diasRestantes === 0 ? ' · vence hoje' : ` · ${diasRestantes} ${diasRestantes === 1 ? 'dia restante' : 'dias restantes'}`;
      return (
        <>
          <CartaoStatus
            Icone={Crown}
            cor={colors.primary}
            fundo={colors.primarySoft}
            borda={venceEmBreve ? colors.warning : colors.primary}
            titulo={assinatura.NomePlano || 'Plano Pro'}
            texto={`Válido até ${formatarData(assinatura.DataFim)}${restante}`}
          >
            <View style={[styles.divisor, { backgroundColor: colors.border }]} />
            <View style={styles.beneficios}>
              {BENEFICIOS_PRO.map((b) => (
                <View key={b} style={styles.beneficio}>
                  <Check size={16} color={colors.primary} strokeWidth={2.75} />
                  <Text style={[typography.body, styles.flex, { color: colors.text }]}>{b}</Text>
                </View>
              ))}
            </View>
          </CartaoStatus>
          {venceEmBreve ? (
            <AvisoInline
              tipo="info"
              mensagem={`Seu plano vence em ${formatarData(assinatura.DataFim)}. A renovação fica disponível aqui assim que ele vencer.`}
            />
          ) : null}
        </>
      );
    }

    if (planoVencido) {
      return (
        <CartaoStatus
          Icone={CalendarX}
          cor={colors.danger}
          fundo={colors.dangerSoft}
          borda={colors.danger}
          titulo="Seu plano Pro venceu"
          texto={`Venceu em ${formatarData(assinatura.DataFim)}. Sua logo, fotos e o WhatsApp voltam assim que você renovar. Nada foi apagado.`}
        />
      );
    }

    if (gratuitoAtivo) {
      return (
        <CartaoStatus
          Icone={Crown}
          cor={colors.textSecondary}
          fundo={colors.surfaceElevated}
          borda={colors.border}
          titulo={assinatura.NomePlano || 'Plano gratuito'}
          texto="Sua oficina aparece nas buscas. Com o Pro, ela ganha logo, fotos e WhatsApp."
        />
      );
    }

    return null;
  }

  const mostrarPlanos = !temPlanoPro && !pendente;
  // Gratuito: só os pagos (upgrade). Demais casos: pagos primeiro.
  const planosParaMostrar = gratuitoAtivo
    ? planos.filter((p) => ehPago(p.Valor))
    : [...planos.filter((p) => ehPago(p.Valor)), ...planos.filter((p) => !ehPago(p.Valor))];

  const tituloPlanos = gratuitoAtivo ? 'Faça upgrade para o Pro' : planoVencido ? 'Renove seu plano' : 'Escolha um plano';

  return (
    <ScreenContainer>
      <ScreenHeader onVoltar={() => navigation.goBack()} titulo="Meu plano" />

      <AvisoInline mensagem={erro} />

      {carregando ? (
        <>
          <Skeleton height={140} borderRadius={radius.lg} style={styles.skeleton} />
          <Skeleton height={220} borderRadius={radius.lg} style={styles.skeleton} />
        </>
      ) : (
        <>
          {renderStatus()}

          {mostrarPlanos && planosParaMostrar.length > 0 ? (
            <>
              <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>{tituloPlanos}</Text>
              {planosParaMostrar.map((plano) => (
                <PlanoCard
                  key={plano.IdPlano}
                  plano={plano}
                  onAssinar={() => handleAssinar(plano)}
                  loading={idPlanoProcessando === plano.IdPlano}
                />
              ))}
              <Text style={[typography.caption, styles.rodapeTexto, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Pagamento do Pro via PIX. O pagamento abre aqui mesmo no app e a confirmação costuma levar poucos instantes.
              </Text>
            </>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  skeleton: { marginBottom: 14 },
  status: { borderWidth: 1.5, padding: 16, marginBottom: 16 },
  statusTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcone: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  statusTexto: { marginTop: 12 },
  botoes: { gap: 10, marginTop: 16 },
  divisor: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
  beneficios: { gap: 10 },
  beneficio: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  secao: { marginTop: 8, marginBottom: 12, marginLeft: 4 },
  rodapeTexto: { textAlign: 'center', marginTop: 4 },
});