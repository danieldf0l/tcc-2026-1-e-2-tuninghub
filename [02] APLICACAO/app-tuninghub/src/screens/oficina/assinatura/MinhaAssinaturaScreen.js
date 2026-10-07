import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, Clock } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { listarPlanos } from '../../../api/plano.api';
import {
  buscarMinhaAssinatura,
  assinarPlanoGratuito,
  iniciarCheckout,
  confirmarPagamento,
} from '../../../api/assinatura.api';
import { formatarData } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/errorHandler';
import PlanoCard from '../../../components/PlanoCard';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';

const ehPago = (valor) => Number(valor) > 0;

export default function MinhaAssinaturaScreen({ navigation }) {
  const { colors } = useTheme();
  const { verificarAssinatura } = useAuth();

  const [assinatura, setAssinatura] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idPlanoProcessando, setIdPlanoProcessando] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState('');

  const ativa = assinatura?.Status === 'ATIVA';
  const pendente = assinatura?.Status === 'PENDENTE';
  const planoPro = ativa && ehPago(assinatura?.ValorPlano);
  const planoGratuito = ativa && !ehPago(assinatura?.ValorPlano);

  async function carregar() {
    try {
      const minha = await buscarMinhaAssinatura();
      setAssinatura(minha);

      const jaTemPro = minha?.Status === 'ATIVA' && ehPago(minha?.ValorPlano);
      if (!jaTemPro && minha?.Status !== 'PENDENTE') {
        setPlanos(await listarPlanos());
      }
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  async function handleAssinar(plano) {
    const gratuito = !ehPago(plano.Valor);
    setErro('');
    setIdPlanoProcessando(plano.IdPlano);

    try {
      if (gratuito) {
        await assinarPlanoGratuito(plano.IdPlano);
        await verificarAssinatura();
        await carregar();
      } else {
        const resultado = await iniciarCheckout(plano.IdPlano);
        await verificarAssinatura();
        await carregar();
        if (resultado.checkoutUrl) {
          await Linking.openURL(resultado.checkoutUrl);
        }
      }
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setIdPlanoProcessando(null);
    }
  }

  async function handleVerificarPagamento() {
    if (!assinatura?.IdAssinatura) return;
    setErro('');
    setVerificando(true);
    try {
      const resultado = await confirmarPagamento(assinatura.IdAssinatura);
      if (resultado.status === 'ATIVA') {
        await verificarAssinatura();
        await carregar();
      } else {
        Alert.alert(
          'Pagamento ainda não identificado',
          'Assim que o pagamento for confirmado, sua assinatura será ativada. Tente novamente em alguns instantes.'
        );
      }
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setVerificando(false);
    }
  }

  const planosParaMostrar = planoGratuito ? planos.filter((p) => ehPago(p.Valor)) : planos;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Meu Plano</Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {pendente ? (
            <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Clock size={28} color={colors.textSecondary} />
              <Text style={[styles.statusTitulo, { color: colors.text }]}>{assinatura.NomePlano}</Text>
              <Text style={[styles.statusTexto, { color: colors.textSecondary }]}>
                Aguardando confirmação do pagamento via PIX.
              </Text>
              <View style={{ height: 14 }} />
              <Button title="Verificar pagamento" onPress={handleVerificarPagamento} loading={verificando} />
            </View>
          ) : null}

          {ativa ? (
            <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <CheckCircle2 size={28} color={colors.primary} />
              <Text style={[styles.statusTitulo, { color: colors.text }]}>{assinatura.NomePlano}</Text>
              <Text style={[styles.statusTexto, { color: colors.textSecondary }]}>
                {planoPro ? `Válido até ${formatarData(assinatura.DataFim)}` : 'Plano gratuito ativo'}
              </Text>
            </View>
          ) : null}

          {planoGratuito || !assinatura ? (
            <>
              <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
                {planoGratuito
                  ? 'Quer enviar a logo e a galeria de fotos da sua oficina? Faça upgrade para o plano Pro.'
                  : 'Escolha um plano para aparecer com mais destaque e liberar o envio de fotos da sua oficina.'}
              </Text>
              {planosParaMostrar.map((plano) => (
                <PlanoCard
                  key={plano.IdPlano}
                  plano={plano}
                  onAssinar={() => handleAssinar(plano)}
                  loading={idPlanoProcessando === plano.IdPlano}
                />
              ))}
            </>
          ) : null}
        </>
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 20 },
  subtitulo: { fontSize: 13.5, marginTop: 22, marginBottom: 18, lineHeight: 19 },
  statusCard: { borderRadius: 16, borderWidth: 1.5, padding: 20, alignItems: 'center', marginBottom: 4 },
  statusTitulo: { fontSize: 17, fontWeight: '800', marginTop: 10 },
  statusTexto: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});