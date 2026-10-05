import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { listarPlanos } from '../../../api/plano.api';
import { assinarPlanoGratuito, iniciarCheckout } from '../../../api/assinatura.api';
import { getErrorMessage } from '../../../utils/errorHandler';
import PlanoCard from '../../../components/PlanoCard';
import Button from '../../../components/Button';

export default function EscolhaPlanoGateScreen() {
  const { colors } = useTheme();
  const { sair, verificarAssinatura } = useAuth();

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
        await verificarAssinatura(); // RootNavigator libera o app assim que a assinatura existir no contexto
      } else {
        const resultado = await iniciarCheckout(plano.IdPlano);
        await verificarAssinatura(); // fica PENDENTE e libera o app
        if (resultado.checkoutUrl) {
          await Linking.openURL(resultado.checkoutUrl);
        }
        Alert.alert(
          'Checkout gerado',
          'Depois de concluir o pagamento, volte ao app e vá em Perfil > Meu plano > "Verificar pagamento".'
        );
      }
    } catch (e) {
      setErro(getErrorMessage(e));
      await verificarAssinatura(); // se o erro foi 409, o contexto se corrige sozinho
    } finally {
      setIdPlanoProcessando(null);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.title, { color: colors.text }]}>Escolha seu plano</Text>
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
        Para começar a aparecer na busca dos usuários, escolha um plano para a sua oficina.
      </Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
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

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 20 }} />
      <Button title="Sair da conta" variant="outline" onPress={sair} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 70 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitulo: { fontSize: 13.5, marginBottom: 24, lineHeight: 19 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});