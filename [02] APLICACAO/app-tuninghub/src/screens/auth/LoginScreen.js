import { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, Animated, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen({ route, navigation }) {
  const { tipo } = route.params; // 'usuario' | 'oficina'
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
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
    if (!email) vazios.push('email');
    if (!senha) vazios.push('senha');

    if (vazios.length > 0) {
      setErroGeral('Preencha e-mail e senha.');
      setCamposComErro(vazios);
      return;
    }

    setLoading(true);
    try {
      await entrar(tipo, email, senha);
      // Navegação pós-login é tratada automaticamente pelo RootNavigator
    } catch (e) {
      setErroGeral(getErrorMessage(e));
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
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />

      <Animated.View style={{ opacity: fade }}>
        <Text style={[styles.title, { color: colors.text }]}>Entre</Text>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={camposComErro.includes('email')}
        />
        <Input
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureText
          error={camposComErro.includes('senha')}
        />

        <Pressable onPress={() => Alert.alert('Em breve', 'Recuperação de senha ainda não implementada.')}>
          <Text style={[styles.link, { color: colors.text }]}>Esqueci minha senha</Text>
        </Pressable>

        {erroGeral ? <Text style={[styles.erroGeral, { color: colors.danger }]}>{erroGeral}</Text> : null}

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
  title: { fontSize: 30, fontWeight: '800', marginBottom: 32, textAlign: 'center', marginTop: 16 },
  link: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  erroGeral: { fontSize: 13, textAlign: 'center', marginBottom: 8 },
  footer: { marginTop: 24, alignItems: 'center' },
});