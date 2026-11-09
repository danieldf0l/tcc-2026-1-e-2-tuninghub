import { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { User, Mail, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { cadastrarUsuario } from '../../api/usuario.api';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import RequisitosSenha from '../../components/RequisitosSenha';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';

export default function CadastroScreen({ navigation }) {
  const { colors, fonts, typography } = useTheme();
  const emailRef = useRef(null);
  const senhaRef = useRef(null);
  const confirmarRef = useRef(null);

  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [erroGeral, setErroGeral] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [loading, setLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function limparErros() {
    setErroGeral('');
    setCamposComErro([]);
  }

  async function handleCadastrar() {
    limparErros();
    const { nome, email, senha, confirmarSenha } = form;

    const vazios = [];
    if (!nome) vazios.push('nome');
    if (!email) vazios.push('email');
    if (!senha) vazios.push('senha');
    if (!confirmarSenha) vazios.push('confirmarSenha');

    if (vazios.length > 0) {
      setErroGeral('Preencha todos os campos.');
      setCamposComErro(vazios);
      return;
    }

    if (senha !== confirmarSenha) {
      setErroGeral('As senhas não coincidem.');
      setCamposComErro(['senha', 'confirmarSenha']);
      return;
    }

    if (!termosAceitos) {
      setErroGeral('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    setLoading(true);
    try {
      const emailLimpo = email.trim();
      await cadastrarUsuario({ ...form, email: emailLimpo, termosAceitos });
      // Conta criada com e-mail não confirmado: o backend já enviou o código
      navigation.replace('ConfirmarEmail', { tipo: 'usuario', email: emailLimpo, senha });
    } catch (e) {
      setErroGeral(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const estiloLink = { color: colors.primary, fontFamily: fonts.bold };

  return (
    <ScreenContainer>
      <Animated.View style={{ opacity: fade }}>
        <ScreenHeader
          onVoltar={() => navigation.goBack()}
          titulo="Crie sua conta"
          subtitulo="Leva menos de um minuto. Depois é só confirmar seu e-mail."
        />

        <Input
          label="Nome"
          Icone={User}
          placeholder="Como podemos te chamar?"
          value={form.nome}
          onChangeText={(v) => atualizar('nome', v)}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          error={camposComErro.includes('nome')}
        />
        <Input
          ref={emailRef}
          label="E-mail"
          Icone={Mail}
          placeholder="seu@email.com"
          value={form.email}
          onChangeText={(v) => atualizar('email', v)}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => senhaRef.current?.focus()}
          error={camposComErro.includes('email')}
        />
        <Input
          ref={senhaRef}
          label="Senha"
          Icone={Lock}
          placeholder="Crie uma senha"
          value={form.senha}
          onChangeText={(v) => atualizar('senha', v)}
          secureText
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmarRef.current?.focus()}
          error={camposComErro.includes('senha')}
        />
        <RequisitosSenha senha={form.senha} />

        <Input
          ref={confirmarRef}
          label="Confirmar senha"
          Icone={Lock}
          placeholder="Repita a senha"
          value={form.confirmarSenha}
          onChangeText={(v) => atualizar('confirmarSenha', v)}
          secureText
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          error={camposComErro.includes('confirmarSenha')}
        />

        <Checkbox marcado={termosAceitos} onToggle={() => setTermosAceitos((v) => !v)}>
          <Text style={[typography.caption, styles.termos, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            Li e concordo com os{' '}
            <Text style={estiloLink} onPress={() => navigation.navigate('Termos')}>
              Termos de Uso
            </Text>{' '}
            e a{' '}
            <Text style={estiloLink} onPress={() => navigation.navigate('Privacidade')}>
              Política de Privacidade
            </Text>
          </Text>
        </Checkbox>

        <View style={styles.espaco} />
        <AvisoInline mensagem={erroGeral} />

        <Button title="Criar conta" onPress={handleCadastrar} loading={loading} />

        <View style={styles.rodape}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Já tem conta? </Text>
          <Pressable onPress={() => navigation.navigate('Login', { tipo: 'usuario' })} hitSlop={8}>
            <Text style={[typography.body, { color: colors.primary, fontFamily: fonts.bold }]}>Entrar</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  termos: { lineHeight: 19 },
  espaco: { height: 12 },
  rodape: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
});