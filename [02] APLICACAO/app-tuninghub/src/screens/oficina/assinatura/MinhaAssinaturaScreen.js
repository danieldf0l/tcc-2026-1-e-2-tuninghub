import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, Clock } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
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

export default function MinhaAssinaturaScreen({ navigation }) {
  const { colors } = useTheme();

  const [assinatura, setAssinatura] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idPlanoProcessando, setIdPlanoProcessando] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const minha = await buscarMinhaAssinatura();
      setAssinatura(minha);
      if (!minha) {
        const listaPlanos = await listarPlanos();
        setPlanos(listaPlanos);
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
    const gratuito = !Number(plano.Valor) || Number(plano.Valor) <= 0;
    setErro('');
    setIdPlanoProcessando(plano.IdPlano);

    try {
      if (gratuito) {
        await assinarPlanoGratuito(plano.IdPlano);
        await carregar();
      } else {
        const resultado = await iniciarCheckout(plano.IdPlano);
        await carregar(); // atualiza para refletir status PENDENTE
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
        await carregar();
      } else {
        Alert.alert(
          'Pagamento ainda não identificado',
          'Assim que o pagamento for confirmado, sua assinatura será ativada automaticamente. Tente novamente em alguns instantes.'
        );
      }
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setVerificando(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Meu Plano</Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : assinatura?.Status === 'ATIVA' ? (
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <CheckCircle2 size={28} color={colors.primary} />
          <Text style={[styles.statusTitulo, { color: colors.text }]}>{assinatura.NomePlano}</Text>
          <Text style={[styles.statusTexto, { color: colors.textSecondary }]}>
            {Number(assinatura.ValorPlano) > 0
              ? `Válido até ${formatarData(assinatura.DataFim)}`
              : 'Plano gratuito ativo'}
          </Text>
        </View>
      ) : assinatura?.Status === 'PENDENTE' ? (
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Clock size={28} color={colors.textSecondary} />
          <Text style={[styles.statusTitulo, { color: colors.text }]}>{assinatura.NomePlano}</Text>
          <Text style={[styles.statusTexto, { color: colors.textSecondary }]}>
            Aguardando confirmação do pagamento via PIX.
          </Text>
          <View style={{ height: 14 }} />
          <Button title="Verificar pagamento" onPress={handleVerificarPagamento} loading={verificando} />
        </View>
      ) : (
        <>
          <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
            Escolha um plano para aparecer com mais destaque e liberar o envio de fotos da sua oficina.
          </Text>
          {planos.map((plano) => (
            <PlanoCard
              key={plano.IdPlano}
              plano={plano}
              onAssinar={() => handleAssinar(plano)}
              loading={idPlanoProcessando === plano.IdPlano}
            />
          ))}
        </>
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 20 },
  subtitulo: { fontSize: 13.5, marginBottom: 20, lineHeight: 19 },
  statusCard: { borderRadius: 16, borderWidth: 1.5, padding: 20, alignItems: 'center' },
  statusTitulo: { fontSize: 17, fontWeight: '800', marginTop: 10 },
  statusTexto: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});