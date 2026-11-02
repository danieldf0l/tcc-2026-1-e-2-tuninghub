import { useState } from 'react';
import { Text, View, Pressable, Alert, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { excluirMinhaConta } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/Input';
import BackButton from '../../components/BackButton';

export default function ExcluirContaScreen({ navigation }) {
  const { colors } = useTheme();
  const { tipoConta, sair } = useAuth();

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const ehOficina = tipoConta === 'oficina';
  const podeExcluir = !!senha && confirmacao.trim() === 'EXCLUIR';

  async function handleExcluir() {
    if (!podeExcluir || loading) return;
    setErro('');
    setLoading(true);
    try {
      const resposta = await excluirMinhaConta(tipoConta, senha);
      await sair();
      Alert.alert('Conta excluída', resposta.message);
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.danger }]}>Excluir conta</Text>
      <Text style={[styles.aviso, { color: colors.textSecondary }]}>
        Esta ação é <Text style={{ fontWeight: '800', color: colors.text }}>definitiva e não pode ser desfeita</Text>.{' '}
        {ehOficina
          ? 'Serão apagados o perfil, as fotos, os serviços, o endereço e as assinaturas da oficina. O registro financeiro dos pagamentos permanece no processador de pagamentos.'
          : 'Serão apagados seus projetos, as listas de serviços e todos os seus dados.'}
      </Text>

      <Input label="Sua senha" value={senha} onChangeText={setSenha} secureText />
      <Input
        label='Digite "EXCLUIR" para confirmar'
        value={confirmacao}
        onChangeText={setConfirmacao}
        autoCapitalize="characters"
      />

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 8 }} />
      <Pressable
        onPress={handleExcluir}
        disabled={!podeExcluir || loading}
        style={[styles.botao, { backgroundColor: colors.danger, opacity: podeExcluir && !loading ? 1 : 0.4 }]}
      >
        {loading ? (
          <ActivityIndicator color="#FEFEFE" />
        ) : (
          <Text style={styles.botaoTexto}>Excluir minha conta definitivamente</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  aviso: { fontSize: 13.5, lineHeight: 20, marginBottom: 24 },
  erro: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  botao: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  botaoTexto: { color: '#FEFEFE', fontSize: 15, fontWeight: '800' },
});
