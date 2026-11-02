import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Lock, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { atualizarMeusDados } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import MenuSection from '../../components/MenuSection';
import MenuListItem from '../../components/MenuListItem';

export default function MeusDadosScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario, atualizarUsuario } = useAuth();

  const nomeAtual = usuario?.Nome || usuario?.nome || '';
  const emailAtual = usuario?.Email || usuario?.email || '';

  const [nome, setNome] = useState(nomeAtual);
  const [email, setEmail] = useState(emailAtual);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Mantém o formulário em sincronia quando o contexto muda (salvar ou confirmar novo e-mail)
  useEffect(() => {
    setNome(nomeAtual);
    setEmail(emailAtual);
  }, [nomeAtual, emailAtual]);

  const trocouEmail = email.trim() !== emailAtual;
  const alterado = nome.trim() !== nomeAtual || trocouEmail;

  async function handleSalvar() {
    setErro('');
    setSucesso('');
    setCamposComErro([]);

    if (!nome.trim()) {
      setErro('O nome não pode ficar vazio.');
      setCamposComErro(['nome']);
      return;
    }
    if (trocouEmail && !senhaAtual) {
      setErro('Informe sua senha atual para trocar o e-mail.');
      setCamposComErro(['senhaAtual']);
      return;
    }

    const campos = {};
    if (nome.trim() !== nomeAtual) campos.nome = nome.trim();
    if (trocouEmail) {
      campos.email = email.trim();
      campos.senhaAtual = senhaAtual;
    }

    setSalvando(true);
    try {
      const { perfil, emailPendente } = await atualizarMeusDados('usuario', campos);
      atualizarUsuario(perfil);
      setSenhaAtual('');
      if (emailPendente) {
        setEmail(emailAtual); // o e-mail só muda depois de confirmar o código
        navigation.navigate('ConfirmarTrocaEmail', { emailPendente });
      } else {
        setSucesso('Dados atualizados.');
      }
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Meus dados</Text>

      <Input label="Nome" value={nome} onChangeText={setNome} autoCapitalize="words" error={camposComErro.includes('nome')} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />

      {trocouEmail ? (
        <>
          <Text style={[styles.aviso, { color: colors.textSecondary }]}>
            Para trocar o e-mail, confirme sua senha. Enviaremos um código para o novo endereço.
          </Text>
          <Input
            label="Senha atual"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureText
            error={camposComErro.includes('senhaAtual')}
          />
        </>
      ) : null}

      {erro ? <Text style={[styles.mensagem, { color: colors.danger }]}>{erro}</Text> : null}
      {sucesso ? <Text style={[styles.mensagem, { color: colors.primary }]}>{sucesso}</Text> : null}

      <Button title="Salvar alterações" onPress={handleSalvar} loading={salvando} disabled={!alterado} />

      <MenuSection title="Segurança">
        <MenuListItem
          Icone={Lock}
          titulo="Alterar senha"
          onPress={() => navigation.navigate('AlterarSenha')}
        />
        <MenuListItem
          Icone={Trash2}
          titulo="Excluir minha conta"
          subtitulo="Apaga seus dados definitivamente"
          onPress={() => navigation.navigate('ExcluirConta')}
          perigo
          ultimo
        />
      </MenuSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 24 },
  aviso: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  mensagem: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
});