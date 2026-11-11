import { useRef, useState } from 'react';
import { KeyRound, Lock } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { alterarSenha } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { senhaValida } from '../../utils/validadores';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import RequisitosSenha from '../../components/RequisitosSenha';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function AlterarSenhaScreen({ navigation }) {
  const { tipoConta, sair } = useAuth();
  const { mostrar } = useToast();
  const novaRef = useRef(null);
  const confirmarRef = useRef(null);

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
    if (!senhaValida(novaSenha)) {
      setErro('A nova senha precisa ter 8 caracteres, com letra maiúscula, número e símbolo.');
      setCamposComErro(['novaSenha']);
      return;
    }
    if (novaSenha === senhaAtual) {
      setErro('A nova senha precisa ser diferente da atual.');
      setCamposComErro(['novaSenha']);
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
      mostrar(resposta?.message || 'Senha alterada. Entre de novo com a nova senha.');
    } catch (e) {
      setErro(getErrorMessage(e));
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        Icone={KeyRound}
        titulo="Alterar senha"
        subtitulo="Depois de alterar, você entra de novo com a nova senha em todos os aparelhos."
      />

      <Input
        Icone={Lock}
        placeholder="Senha atual"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureText
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => novaRef.current?.focus()}
        error={camposComErro.includes('senhaAtual')}
      />
      <Input
        ref={novaRef}
        Icone={Lock}
        placeholder="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureText
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
        onSubmitEditing={handleSalvar}
        error={camposComErro.includes('confirmarNovaSenha')}
      />

      <AvisoInline mensagem={erro} />

      <Button title="Alterar senha" onPress={handleSalvar} loading={loading} />
    </ScreenContainer>
  );
}