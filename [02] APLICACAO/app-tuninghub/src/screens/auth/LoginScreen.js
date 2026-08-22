import { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, Animated, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { getErrorMessage } from '../../utils/errorHandler';
import BackButton from '../../components/BackButton';

export default function LoginScreen({ route, navigation }) {
  const { tipo } = route.params; // 'usuario' | 'oficina'
  const { colors } = useTheme();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  async function handleEntrar() {
    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await entrar(tipo, email, senha);
      // Navegação pós-login será tratada pelo RootNavigator (troca de fluxo automática)
    } catch (e) {
        setErro(getErrorMessage(e));
        } finally {
      setLoading(false);
    }
  }

  function handleCriarConta() {
    if (tipo === 'oficina') {
      Alert.alert('Em breve', 'O cadastro de oficinas ainda está em desenvolvimento.');
      return;
    }
    navigation.navigate('Cadastro', { tipo });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton onPress={() => navigation.goBack()} />  

      <Animated.View style={{ opacity: fade }}>
        <Text style={[styles.title, { color: colors.text }]}>Entre</Text>

        <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input placeholder="Senha" value={senha} onChangeText={setSenha} secureText error={erro} />

        <Pressable onPress={() => Alert.alert('Em breve', 'Recuperação de senha ainda não implementada.')}>
          <Text style={[styles.link, { color: colors.text }]}>Esqueci minha senha</Text>
        </Pressable>

        <View style={{ height: 20 }} />
        <Button title="Entrar" onPress={handleEntrar} loading={loading} />

        <Pressable onPress={handleCriarConta} style={styles.footer}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Não tem conta? Criar Conta</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  back: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 32, textAlign: 'center' },
  link: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  footer: { marginTop: 24, alignItems: 'center' },
});