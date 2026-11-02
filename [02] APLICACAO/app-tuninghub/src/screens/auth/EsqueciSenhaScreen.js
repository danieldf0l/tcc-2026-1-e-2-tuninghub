import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { esqueciSenha } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function EsqueciSenhaScreen({ route, navigation }) {
  const { tipo, email: emailInicial } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />

      <Text style={[styles.title, { color: colors.text }]}>Recuperar senha</Text>
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
        Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um código de 6 dígitos.
      </Text>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={!!erro}
      />

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 12 }} />
      <Button title="Enviar código" onPress={handleEnviar} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 16, marginBottom: 12, textAlign: 'center' },
  subtitulo: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 28 },
  erro: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
});