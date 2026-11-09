import { useState, useRef } from 'react';
import { View } from 'react-native';
import { Lock, KeyRound } from 'lucide-react-native';
import { useToast } from '../../context/ToastContext';
import { redefinirSenha } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import RequisitosSenha from '../../components/RequisitosSenha';
import Input from '../../components/Input';
import Button from '../../components/Button';

// Etapa 2 da recuperação: recebe o código da tela anterior e envia tudo ao backend
export default function NovaSenhaScreen({ route, navigation }) {
  const { tipo, email, codigo } = route.params;
  const { mostrar } = useToast();
  const confirmarRef = useRef(null);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [erroDeCodigo, setErroDeCodigo] = useState(false);
  const [camposComErro, setCamposComErro] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleRedefinir() {
    setErro('');
    setErroDeCodigo(false);
    setCamposComErro([]);

    const vazios = [];
    if (!novaSenha) vazios.push('novaSenha');
    if (!confirmarNovaSenha) vazios.push('confirmarNovaSenha');

    if (vazios.length > 0) {
      setErro('Informe e confirme a nova senha.');
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
      const resposta = await redefinirSenha({ email, tipo, codigo, novaSenha, confirmarNovaSenha });
      // Volta ao login com o e-mail já preenchido
      navigation.reset({
        index: 1,
        routes: [
          { name: 'RoleSelect' },
          { name: 'Login', params: { tipo, emailInicial: email } },
        ],
      });
      mostrar(resposta?.message || 'Senha redefinida! Entre com a nova senha.');
    } catch (e) {
      const mensagem = getErrorMessage(e);
      setErro(mensagem);
      // O backend responde "Código inválido ou expirado." quando o problema é o código
      setErroDeCodigo(/c[oó]digo/i.test(mensagem));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        Icone={KeyRound}
        titulo="Crie uma nova senha"
        subtitulo="Escolha uma senha segura para sua conta."
      />

      <Input
        Icone={Lock}
        placeholder="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureText
        autoFocus
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmarRef.current?.focus()}
        error={camposComErro.includes('novaSenha')}
      />
      <RequisitosSenha senha={novaSenha} />

      <Input
        ref={confirmarRef}
        Icone={Lock}
        placeholder="Confirmar nova senha"
        value={confirmarNovaSenha}
        onChangeText={setConfirmarNovaSenha}
        secureText
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleRedefinir}
        error={camposComErro.includes('confirmarNovaSenha')}
      />

      <AvisoInline mensagem={erro} />

      {erroDeCodigo ? (
        <>
          <Button title="Corrigir código" variant="outline" onPress={() => navigation.goBack()} />
          <View style={{ height: 10 }} />
        </>
      ) : null}

      <Button title="Redefinir senha" onPress={handleRedefinir} loading={loading} />
    </ScreenContainer>
  );
}