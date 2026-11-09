import { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { User, Mail, Lock } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { emailValido, senhaValida } from '../../../utils/validadores';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import ProgressoEtapas from '../../../components/ProgressoEtapas';
import AvisoInline from '../../../components/AvisoInline';
import RequisitosSenha from '../../../components/RequisitosSenha';
import Input from '../../../components/Input';
import Checkbox from '../../../components/Checkbox';
import Button from '../../../components/Button';

export default function CadastroOficinaAcessoScreen({ navigation }) {
  const { colors, fonts, typography } = useTheme();
  const emailRef = useRef(null);
  const senhaRef = useRef(null);
  const confirmarRef = useRef(null);

  const [nomeProprietario, setNomeProprietario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [erro, setErro] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);

  function handleProximo() {
    setErro('');
    const vazios = [];
    if (!nomeProprietario.trim()) vazios.push('nomeProprietario');
    if (!email.trim()) vazios.push('email');
    if (!senha) vazios.push('senha');
    if (!confirmarSenha) vazios.push('confirmarSenha');

    if (vazios.length > 0) {
      setErro('Preencha todos os campos.');
      setCamposComErro(vazios);
      return;
    }

    if (!emailValido(email)) {
      setErro('Informe um e-mail válido.');
      setCamposComErro(['email']);
      return;
    }

    if (!senhaValida(senha)) {
      setErro('A senha precisa ter 8 caracteres, com letra maiúscula, número e símbolo.');
      setCamposComErro(['senha']);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setCamposComErro(['senha', 'confirmarSenha']);
      return;
    }

    if (!termosAceitos) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      setCamposComErro([]);
      return;
    }

    setCamposComErro([]);
    navigation.navigate('CadastroOficinaDados', {
      nomeProprietario: nomeProprietario.trim(),
      email: email.trim(),
      senha,
      termosAceitos,
    });
  }

  const estiloLink = { color: colors.primary, fontFamily: fonts.bold };

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        acaoDireita={<ProgressoEtapas atual={1} />}
        titulo="Crie o acesso"
        subtitulo="Esses dados serão usados para entrar no app da oficina."
      />

      <Input
        Icone={User}
        placeholder="Nome do proprietário"
        value={nomeProprietario}
        onChangeText={setNomeProprietario}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
        error={camposComErro.includes('nomeProprietario')}
      />
      <Input
        ref={emailRef}
        Icone={Mail}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
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
        Icone={Lock}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureText
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmarRef.current?.focus()}
        error={camposComErro.includes('senha')}
      />
      <RequisitosSenha senha={senha} />

      <Input
        ref={confirmarRef}
        Icone={Lock}
        placeholder="Confirmar senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
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
      <AvisoInline mensagem={erro} />

      <Button title="Continuar" onPress={handleProximo} />

      <View style={styles.rodape}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Já tem conta? </Text>
        <Pressable onPress={() => navigation.navigate('Login', { tipo: 'oficina' })} hitSlop={8}>
          <Text style={[typography.body, { color: colors.primary, fontFamily: fonts.bold }]}>Entrar</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  termos: { lineHeight: 19 },
  espaco: { height: 12 },
  rodape: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
});