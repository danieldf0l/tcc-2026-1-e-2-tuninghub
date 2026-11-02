import { useState } from 'react';
import { Text, View, Alert, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { alterarSenha } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function AlterarSenhaScreen({ navigation }) {
  const { colors } = useTheme();
  const { tipoConta, sair } = useAuth();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSalvar() {
    setErro('');
    setCamposComErro([]);

    const vazios = [];
    if (!senhaAtual) vazios.push('senhaAtual');
    if (!novaSenha) vazios.push('novaSenha');
    if (!confirmarNovaSenha) vazios.push('confirmarNovaSenha');
    if (vazios.length > 0) {
      setErro('Preencha todos os campos.');
      setCamposComErro(vazios);
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErro('As senhas não coincidem.');
      setCamposComErro(['novaSenha', 'confirmarNovaSenha']);
      return;
    }

    setLoading(true);
    try {
      const resposta = await alterarSenha(tipoConta, { senhaAtual, novaSenha, confirmarNovaSenha });
      // O backend encerra as sessões antigas (inclusive esta): volta ao login
      await sair();
      Alert.alert('Senha alterada', resposta.message);
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
      <Text style={[styles.title, { color: colors.text }]}>Alterar senha</Text>
      <Text style={[styles.aviso, { color: colors.textSecondary }]}>
        A nova senha precisa ter no mínimo 8 caracteres, com maiúscula, número e caractere especial. Depois de
        alterar, você entra de novo com a nova senha.
      </Text>

      <Input
        label="Senha atual"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureText
        error={camposComErro.includes('senhaAtual')}
      />
      <Input
        label="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureText
        error={camposComErro.includes('novaSenha')}
      />
      <Input
        label="Confirmar nova senha"
        value={confirmarNovaSenha}
        onChangeText={setConfirmarNovaSenha}
        secureText
        error={camposComErro.includes('confirmarNovaSenha')}
      />

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 12 }} />
      <Button title="Alterar senha" onPress={handleSalvar} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  aviso: { fontSize: 13, lineHeight: 19, marginBottom: 24 },
  erro: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
});