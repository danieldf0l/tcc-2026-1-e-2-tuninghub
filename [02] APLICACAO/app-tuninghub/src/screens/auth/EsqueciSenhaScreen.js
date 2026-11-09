import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { KeyRound, Mail } from 'lucide-react-native';
import { esqueciSenha } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EsqueciSenhaScreen({ route, navigation }) {
  const { tipo, email: emailInicial } = route.params;
  useTheme(); // mantém a tela reativa à troca de tema

  const [email, setEmail] = useState(emailInicial || '');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEnviar() {
    setErro('');
    if (!email.trim()) {
      setErro('Informe o e-mail da sua conta.');
      return;
    }

    setLoading(true);
    try {
      await esqueciSenha(email.trim(), tipo);
      // A resposta é sempre genérica (não revela se o e-mail existe), então seguimos adiante
      navigation.navigate('RedefinirSenha', { tipo, email: email.trim() });
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        Icone={KeyRound}
        titulo="Recuperar senha"
        subtitulo="Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um código de 6 dígitos."
      />

      <Input
        label="E-mail"
        Icone={Mail}
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="username"
        autoFocus={!emailInicial}
        returnKeyType="send"
        onSubmitEditing={handleEnviar}
        error={!!erro}
      />

      <AvisoInline mensagem={erro} />

      <Button title="Enviar código" onPress={handleEnviar} loading={loading} />
    </ScreenContainer>
  );
}