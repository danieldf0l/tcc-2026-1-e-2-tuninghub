import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { listarPlanos } from '../../../api/plano.api';
import { assinarPlanoGratuito, iniciarCheckout, confirmarPagamento } from '../../../api/assinatura.api';
import { abrirCheckout } from '../../../utils/pagamento';
import { getErrorMessage } from '../../../utils/errorHandler';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import PlanoCard from '../../../components/PlanoCard';
import AvisoInline from '../../../components/AvisoInline';
import Skeleton from '../../../components/Skeleton';
import Button from '../../../components/Button';
import Logo from '../../../components/Logo';

export default function EscolhaPlanoGateScreen() {
  const { colors, fonts, typography, radius } = useTheme();
  const { sair, verificarAssinatura } = useAuth();
  const { mostrar } = useToast();

  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idPlanoProcessando, setIdPlanoProcessando] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarPlanos()
      .then(setPlanos)
      .catch((e) => setErro(getErrorMessage(e)))
      .finally(() => setCarregando(false));
  }, []);

  async function handleAssinar(plano) {
    const gratuito = !Number(plano.Valor) || Number(plano.Valor) <= 0;
    setErro('');
    setIdPlanoProcessando(plano.IdPlano);

    try {
      if (gratuito) {
        await assinarPlanoGratuito(plano.IdPlano);
        mostrar('Plano gratuito ativado. Bem-vindo ao TuningHub!');
        await verificarAssinatura(); // o RootNavigator libera o app
        return;
      }

      const resultado = await iniciarCheckout(plano.IdPlano);
      await abrirCheckout(resultado.checkoutUrl);

      // Ao fechar o navegador, já confere o PIX (silencioso se ainda não caiu)
      let ativou = false;
      try {
        const conferencia = await confirmarPagamento(resultado.idAssinatura);
        ativou = conferencia.status === 'ATIVA';
      } catch {
        // segue como pendente
      }

      mostrar(
        ativou
          ? 'Pagamento confirmado! Seu plano Pro está ativo.'
          : 'Quando o PIX for confirmado, o Pro é ativado. Acompanhe em Perfil > Meu plano.',
        ativou ? 'sucesso' : 'info'
      );
      await verificarAssinatura(); // PENDENTE ou ATIVA: libera o app
    } catch (e) {
      setErro(getErrorMessage(e));
      await verificarAssinatura(); // se foi 409, o contexto se corrige sozinho
    } finally {
      setIdPlanoProcessando(null);
    }
  }

  return (
    <ScreenContainer rodape={<Button title="Sair da conta" variant="ghost" onPress={sair} />}>
      <View style={styles.logo}>
        <Logo tamanho={22} />
      </View>

      <ScreenHeader
        titulo="Escolha seu plano"
        subtitulo="Sua oficina começa a aparecer para os Entusiastas assim que você escolher um plano. Dá para fazer upgrade depois."
      />

      <AvisoInline mensagem={erro} />

      {carregando ? (
        <>
          <Skeleton height={200} borderRadius={radius.lg} style={styles.skeleton} />
          <Skeleton height={220} borderRadius={radius.lg} style={styles.skeleton} />
        </>
      ) : (
        planos.map((plano) => (
          <PlanoCard
            key={plano.IdPlano}
            plano={plano}
            onAssinar={() => handleAssinar(plano)}
            loading={idPlanoProcessando === plano.IdPlano}
          />
        ))
      )}

      <Text style={[typography.caption, styles.nota, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
        Pagamento do Pro via PIX, aqui mesmo no app.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: { marginBottom: 20 },
  skeleton: { marginBottom: 14 },
  nota: { textAlign: 'center', marginTop: 4 },
});