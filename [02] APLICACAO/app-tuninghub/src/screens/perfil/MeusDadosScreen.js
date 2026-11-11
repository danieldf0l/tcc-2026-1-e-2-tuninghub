import { useEffect, useState } from 'react';
import { User, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { atualizarMeusDados } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { emailValido } from '../../utils/validadores';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function MeusDadosScreen({ navigation }) {
  const { usuario, atualizarUsuario } = useAuth();
  const { mostrar } = useToast();

  const nomeAtual = usuario?.Nome || usuario?.nome || '';
  const emailAtual = usuario?.Email || usuario?.email || '';

  const [nome, setNome] = useState(nomeAtual);
  const [email, setEmail] = useState(emailAtual);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [erro, setErro] = useState('');
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
    setCamposComErro([]);

    if (!nome.trim()) {
      setErro('O nome não pode ficar vazio.');
      setCamposComErro(['nome']);
      return;
    }
    if (trocouEmail && !emailValido(email)) {
      setErro('Informe um e-mail válido.');
      setCamposComErro(['email']);
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
        mostrar('Dados atualizados.');
      }
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  }

  const rodape = alterado ? (
    <>
      <AvisoInline mensagem={erro} />
      <Button title="Salvar alterações" onPress={handleSalvar} loading={salvando} />
    </>
  ) : null;

  return (
    <ScreenContainer rodape={rodape}>
      <ScreenHeader onVoltar={() => navigation.goBack()} titulo="Meus dados" subtitulo="Suas informações de conta." />

      <Input
        label="Nome"
        Icone={User}
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
        autoComplete="name"
        error={camposComErro.includes('nome')}
      />
      <Input
        label="E-mail"
        Icone={Mail}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        error={camposComErro.includes('email')}
      />

      {trocouEmail ? (
        <>
          <AvisoInline tipo="info" mensagem="Para trocar o e-mail, confirme sua senha. Enviaremos um código para o novo endereço." />
          <Input
            label="Senha atual"
            Icone={Lock}
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureText
            autoComplete="current-password"
            textContentType="password"
            error={camposComErro.includes('senhaAtual')}
          />
        </>
      ) : null}
    </ScreenContainer>
  );
}