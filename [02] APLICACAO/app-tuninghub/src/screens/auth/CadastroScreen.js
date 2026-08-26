import { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { cadastrarUsuario } from '../../api/usuario.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Checkbox from '../../components/Checkbox';

export default function CadastroScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
      await cadastrarUsuario({ ...form, termosAceitos });
      navigation.navigate('Login', { tipo: 'usuario' });
    } catch (e) {
      setErroGeral(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />

      <Animated.View style={{ opacity: fade }}>
        <Text style={[styles.title, { color: colors.text }]}>Cadastre-se</Text>

        <Input
          placeholder="Nome"
          value={form.nome}
          onChangeText={(v) => atualizar('nome', v)}
          error={camposComErro.includes('nome')}
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChangeText={(v) => atualizar('email', v)}
          keyboardType="email-address"
          error={camposComErro.includes('email')}
        />
        <Input
          placeholder="Senha"
          value={form.senha}
          onChangeText={(v) => atualizar('senha', v)}
          secureText
          error={camposComErro.includes('senha')}
        />
        <Input
          placeholder="Confirmar Senha"
          value={form.confirmarSenha}
          onChangeText={(v) => atualizar('confirmarSenha', v)}
          secureText
          error={camposComErro.includes('confirmarSenha')}
        />

        {erroGeral ? (
          <Text style={[styles.erroGeral, { color: colors.danger }]}>{erroGeral}</Text>
        ) : null}

        <View style={{ height: 8 }} />
        <Checkbox marcado={termosAceitos} onToggle={() => setTermosAceitos((v) => !v)}>
          <Text style={{ color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 }}>
            Li e concordo com os{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => navigation.navigate('Termos')}>
              Termos de Uso
            </Text>{' '}
            e a{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => navigation.navigate('Privacidade')}>
              Política de Privacidade
            </Text>
          </Text>
        </Checkbox>

        <View style={{ height: 12 }} />
        <Button title="Cadastrar" onPress={handleCadastrar} loading={loading} />

        <Pressable onPress={() => navigation.navigate('Login', { tipo: 'usuario' })} style={styles.footer}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Já tenho uma conta</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 32, textAlign: 'center', marginTop: 16 },
  erroGeral: { fontSize: 13, marginBottom: 8, textAlign: 'center' },
  footer: { marginTop: 20, alignItems: 'center' },
});