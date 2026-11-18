import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, AppState, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Clock, Crown, CalendarX, Check, CalendarCheck, RefreshCw } from 'lucide-react-native';
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
  cancelarAssinatura,
} from '../../../api/assinatura.api';
import { abrirCheckout } from '../../../utils/pagamento';
import { formatarData } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/errorHandler';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import PlanoCard, { BENEFICIOS_PRO } from '../../../components/PlanoCard';
import CancelarAssinaturaSheet from '../../../components/CancelarAssinaturaSheet';
import AvisoInline from '../../../components/AvisoInline';
import Skeleton from '../../../components/Skeleton';
import Button from '../../../components/Button';

const ehPago = (valor) => Number(valor) > 0;

// 'AAAA-MM-DD' → 'DD/MM' sem passar por Date (evita voltar um dia por causa do fuso)
function diaMes(aaaaMmDd) {
  if (!aaaaMmDd) return '';
  const [, mes, dia] = String(aaaaMmDd).slice(0, 10).split('-');
  return `${dia}/${mes}`;
}

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
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false); // sheet aberto
  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState('');
  const conferindoRef = useRef(false);

  const {
    temPlanoPro, gratuitoAtivo, pendente, planoVencido, diasRestantes, venceEmBreve,
    podeRenovar, podeCancelar, renovacaoLiberadaEm, renovacaoPendente, renovacaoPaga, reembolsoEstimado,
  } = analisarAssinatura(assinatura);

  // PIX aguardando: o 1º pagamento (PENDENTE) ou uma renovação do Pro
  const pixAguardando = pendente
    ? { idAssinatura: assinatura?.IdAssinatura, idPlano: assinatura?.IdPlano }
    : renovacaoPendente
      ? { idAssinatura: renovacaoPendente.IdAssinatura, idPlano: renovacaoPendente.IdPlano }
      : null;

  // Mostra os planos quando dá para assinar/renovar
  const deveMostrarPlanos = (a) => (!a.temPlanoPro && !a.pendente) || (a.temPlanoPro && a.podeRenovar && !a.renovacaoPendente);

  async function carregar() {
    try {
      const minha = await buscarMinhaAssinatura();
      setAssinatura(minha);
      setPlanos(deveMostrarPlanos(analisarAssinatura(minha)) ? await listarPlanos() : []);
      setErro('');
      return minha;
    } catch (e) {
      setErro(getErrorMessage(e));
      return null;
    } finally {
      setCarregando(false);
    }
  }

  function idDoPixAguardando(minha) {
    if (minha?.Status === 'PENDENTE') return minha.IdAssinatura;
    return minha?.renovacaoPendente?.IdAssinatura || null;
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
        mostrar(
          r.renovacao
            ? `Renovação confirmada! Seu Pro vai até ${formatarData(r.dataFim)}.`
            : 'Pagamento confirmado! Seu plano Pro está ativo.'
        );
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
        const id = idDoPixAguardando(minha);
        if (id) conferirPagamento(id);
      })();
    }, [])
  );

  // Voltou ao app (ex.: depois de pagar no banco): confere sozinho
  useEffect(() => {
    if (!pixAguardando?.idAssinatura) return undefined;
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') conferirPagamento(pixAguardando.idAssinatura);
    });
    return () => sub.remove();
  }, [pixAguardando?.idAssinatura]);

  async function handleVerificarManual() {
    setErro('');
    setVerificando(true);
    await conferirPagamento(pixAguardando?.idAssinatura, { avisarSePendente: true });
    setVerificando(false);
  }

  // PIX pendente (1º ou renovação): o backend devolve o MESMO link se ainda estiver aguardando
  async function handleAbrirPagamento() {
    if (!pixAguardando?.idPlano) return;
    setErro('');
    setAbrindoPagamento(true);
    try {
      const r = await iniciarCheckout(pixAguardando.idPlano);
      await abrirCheckout(r.checkoutUrl);
      await conferirPagamento(r.idAssinatura || pixAguardando.idAssinatura);
    } catch (e) {
      // 409 pode significar que já estava pago: o backend ativa e avisa
      await verificarAssinatura();
      await carregar();
      setErro(getErrorMessage(e));
    } finally {
      setAbrindoPagamento(false);
    }
  }

  // Assinar (gratuito/Pro) ou renovar o Pro antecipadamente
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
      carregar(); // ex.: 409 "Você poderá renovar a partir de..." — atualiza o estado da tela
    } finally {
      setIdPlanoProcessando(null);
    }
  }

  // Cancela o Pro (volta ao gratuito) ou desiste de um PIX
  async function executarCancelamento({ apenasRenovacaoPendente = false } = {}) {
    setErro('');
    setCancelando(true);
    try {
      const r = await cancelarAssinatura({ apenasRenovacaoPendente });
      setConfirmandoCancelamento(false);
      await verificarAssinatura();
      await carregar();
      mostrar(r.message || 'Cancelamento concluído.');
    } catch (e) {
      setConfirmandoCancelamento(false);
      setErro(getErrorMessage(e));
      carregar();
    } finally {
      setCancelando(false);
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

  // Bloco do PIX aguardando (1º pagamento ou renovação)
  function BotoesPix({ textoCancelar, onCancelar }) {
    return (
      <View style={styles.botoes}>
        {pixAguardando?.idPlano ? (
          <Button title="Abrir pagamento" onPress={handleAbrirPagamento} loading={abrindoPagamento} disabled={verificando || cancelando} />
        ) : null}
        <Button
          title="Já paguei, verificar"
          variant="outline"
          onPress={handleVerificarManual}
          loading={verificando}
          disabled={abrindoPagamento || cancelando}
        />
        {onCancelar ? (
          <Button title={textoCancelar} variant="ghost" onPress={onCancelar} loading={cancelando} disabled={abrindoPagamento || verificando} />
        ) : null}
      </View>
    );
  }

  function renderRenovacao() {
    if (renovacaoPaga) {
      return (
        <CartaoStatus
          Icone={CalendarCheck}
          cor={colors.success}
          fundo={colors.successSoft}
          borda={colors.success}
          titulo="Renovação paga"
          texto={`Seu próximo período (${renovacaoPaga.NomePlano || 'Pro'}) começa em ${formatarData(renovacaoPaga.DataInicio)} e vai até ${formatarData(renovacaoPaga.DataFim)}. Não precisa fazer mais nada.`}
        />
      );
    }

    if (renovacaoPendente) {
      return (
        <CartaoStatus
          Icone={Clock}
          cor={colors.warning}
          fundo={colors.warningSoft}
          borda={colors.warning}
          titulo={`Renovação: ${renovacaoPendente.NomePlano || 'Pro'}`}
          texto="Aguardando o PIX da renovação. Seu plano atual continua ativo enquanto isso."
        >
          <BotoesPix
            textoCancelar="Desistir da renovação"
            onCancelar={() => executarCancelamento({ apenasRenovacaoPendente: true })}
          />
        </CartaoStatus>
      );
    }

    if (!podeRenovar && renovacaoLiberadaEm) {
      return (
        <AvisoInline
          tipo="info"
          mensagem={`A renovação antecipada fica disponível a partir de ${diaMes(renovacaoLiberadaEm)}, nos últimos 7 dias do plano.`}
        />
      );
    }

    return null;
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
          <BotoesPix
            textoCancelar="Desistir deste pagamento"
            onCancelar={podeCancelar ? () => executarCancelamento() : null}
          />
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
            borda={venceEmBreve && !renovacaoPaga ? colors.warning : colors.primary}
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
          {renderRenovacao()}
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

  const renovandoAntecipado = temPlanoPro && podeRenovar && !renovacaoPendente;
  const mostrarPlanos = (!temPlanoPro && !pendente) || renovandoAntecipado;
  // Gratuito e renovação: só os pagos. Demais casos: pagos primeiro.
  const planosParaMostrar =
    gratuitoAtivo || renovandoAntecipado
      ? planos.filter((p) => ehPago(p.Valor))
      : [...planos.filter((p) => ehPago(p.Valor)), ...planos.filter((p) => !ehPago(p.Valor))];

  const tituloPlanos = renovandoAntecipado
    ? 'Renovar agora'
    : gratuitoAtivo
      ? 'Faça upgrade para o Pro'
      : planoVencido
        ? 'Renove seu plano'
        : 'Escolha um plano';

  // Cancelar o Pro (com ou sem renovação paga). PIX pendente tem botão próprio no cartão.
  const mostrarCancelar = temPlanoPro && podeCancelar;

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
              <View style={styles.secaoTopo}>
                {renovandoAntecipado ? <RefreshCw size={14} color={colors.textSecondary} strokeWidth={2.5} /> : null}
                <Text style={[typography.overline, { color: colors.textSecondary }]}>{tituloPlanos}</Text>
              </View>
              {renovandoAntecipado ? (
                <Text style={[typography.caption, styles.secaoTexto, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  O novo período começa quando o atual terminar ({formatarData(assinatura?.DataFim)}). Você não perde nenhum dia.
                </Text>
              ) : null}
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

          {mostrarCancelar ? (
            <Pressable
              onPress={() => setConfirmandoCancelamento(true)}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.cancelar, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[typography.body, { color: colors.danger, fontFamily: fonts.semibold }]}>Cancelar assinatura</Text>
            </Pressable>
          ) : null}
        </>
      )}

      <CancelarAssinaturaSheet
        visivel={confirmandoCancelamento}
        onFechar={() => setConfirmandoCancelamento(false)}
        onConfirmar={() => executarCancelamento()}
        carregando={cancelando}
        nomePlano={assinatura?.NomePlano}
        reembolso={reembolsoEstimado}
        temRenovacaoPaga={!!renovacaoPaga}
      />
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
  secaoTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 12, marginLeft: 4 },
  secaoTexto: { marginTop: -6, marginBottom: 12, marginLeft: 4 },
  rodapeTexto: { textAlign: 'center', marginTop: 4 },
  cancelar: { alignSelf: 'center', marginTop: 28, paddingVertical: 8 },
});
