import { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { cadastrarUsuario } from '../../api/usuario.api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { getErrorMessage } from '../../utils/errorHandler';
import BackButton from '../../components/BackButton';

export default function CadastroScreen({ navigation }) {
  const { colors } = useTheme();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleCadastrar() {
    const { nome, email, senha, confirmarSenha } = form;
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await cadastrarUsuario(form);
      navigation.navigate('Login', { tipo: 'usuario' });
    } catch (e) {
        setErro(getErrorMessage(e));
        } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton onPress={() => navigation.goBack()} />

      <Animated.View style={{ opacity: fade }}>
        <Text style={[styles.title, { color: colors.text }]}>Cadastre-se</Text>

        <Input placeholder="Nome" value={form.nome} onChangeText={(v) => atualizar('nome', v)} />
        <Input
          placeholder="Email"
          value={form.email}
          onChangeText={(v) => atualizar('email', v)}
          keyboardType="email-address"
        />
        <Input placeholder="Senha" value={form.senha} onChangeText={(v) => atualizar('senha', v)} secureText />
        <Input
          placeholder="Confirmar Senha"
          value={form.confirmarSenha}
          onChangeText={(v) => atualizar('confirmarSenha', v)}
          secureText
          error={erro}
        />

        <View style={{ height: 8 }} />
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
  back: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 32, textAlign: 'center' },
  footer: { marginTop: 20, alignItems: 'center' },
});