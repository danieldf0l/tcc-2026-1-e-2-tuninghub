import { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, isEmailNaoVerificado } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen({ route, navigation }) {
  const { tipo, emailInicial } = route.params; // tipo: 'usuario' | 'oficina'
  const { colors, fonts, typography } = useTheme();
  const { entrar } = useAuth();
  const senhaRef = useRef(null);
  const ehOficina = tipo === 'oficina';

  const [email, setEmail] = useState(emailInicial || '');
  const [senha, setSenha] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [loading, setLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  async function handleEntrar() {
    setErroGeral('');
    setCamposComErro([]);

    const vazios = [];
    if (!email.trim()) vazios.push('email');
    if (!senha) vazios.push('senha');

    if (vazios.length > 0) {
      setErroGeral('Preencha e-mail e senha.');
      setCamposComErro(vazios);
      return;
    }

    setLoading(true);
    try {
      await entrar(tipo, email.trim(), senha);
      // Navegação pós-login é tratada automaticamente pelo RootNavigator
    } catch (e) {
      if (isEmailNaoVerificado(e)) {
        // Senha correta, mas o e-mail ainda não foi confirmado: o backend reenviou o código
        navigation.navigate('ConfirmarEmail', { tipo, email: email.trim(), senha });
        return;
      }
      setErroGeral(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function handleCriarConta() {
    if (tipo === 'oficina') {
      navigation.navigate('CadastroOficinaAcesso');
      return;
    }
    navigation.navigate('Cadastro', { tipo });
  }

  return (
    <ScreenContainer>
      <Animated.View style={{ opacity: fade }}>
        <ScreenHeader
          onVoltar={() => navigation.goBack()}
          titulo="Entrar"
          subtitulo={ehOficina ? 'Acesse a conta da sua oficina.' : 'Acesse sua conta de entusiasta.'}
        />

        <Input
          Icone={Mail}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => senhaRef.current?.focus()}
          error={camposComErro.includes('email')}
        />
        <Input
          ref={senhaRef}
          Icone={Lock}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureText
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleEntrar}
          error={camposComErro.includes('senha')}
        />

        <Pressable
          onPress={() => navigation.navigate('EsqueciSenha', { tipo, email: email.trim() })}
          hitSlop={8}
          style={styles.esqueci}
        >
          <Text style={[styles.link, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
            Esqueci minha senha
          </Text>
        </Pressable>

        <AvisoInline mensagem={erroGeral} />

        <Button title="Entrar" onPress={handleEntrar} loading={loading} />

        <View style={styles.rodape}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Não tem conta? </Text>
          <Pressable onPress={handleCriarConta} hitSlop={8}>
            <Text style={[typography.body, { color: colors.primary, fontFamily: fonts.bold }]}>Criar conta</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  esqueci: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 24 },
  link: { fontSize: 13.5 },
  rodape: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
});