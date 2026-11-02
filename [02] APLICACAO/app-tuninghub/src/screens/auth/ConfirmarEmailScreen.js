import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { reenviarCodigo } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useContagem } from '../../utils/useContagem';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function ConfirmarEmailScreen({ route, navigation }) {
  const { tipo, email, senha } = route.params; // senha só em memória (o backend exige para confirmar)
  const { colors } = useTheme();
  const { confirmarEmail } = useAuth();
  const insets = useSafeAreaInsets();
  const { restante, reiniciar } = useContagem(60);

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function handleConfirmar() {
    setErro('');
    setAviso('');
    if (codigo.length !== 6) {
      setErro('Digite o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await confirmarEmail(tipo, email, senha, codigo);
      // Sessão iniciada: o RootNavigator troca de tela sozinho
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    if (restante > 0 || reenviando) return;
    setErro('');
    setAviso('');
    setReenviando(true);
    try {
      const resposta = await reenviarCodigo(email, tipo);
      setAviso(resposta.message);
      reiniciar();
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setReenviando(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />

      <Text style={[styles.title, { color: colors.text }]}>Confirme seu e-mail</Text>
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
        Enviamos um código de 6 dígitos para{' '}
        <Text style={{ color: colors.text, fontWeight: '700' }}>{email}</Text>. Confira também a caixa de spam.
      </Text>

      <Input
        placeholder="Código de 6 dígitos"
        value={codigo}
        onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        error={!!erro}
      />

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
      {aviso ? <Text style={[styles.aviso, { color: colors.textSecondary }]}>{aviso}</Text> : null}

      <View style={{ height: 12 }} />
      <Button title="Confirmar" onPress={handleConfirmar} loading={loading} />

      <Pressable onPress={handleReenviar} disabled={restante > 0 || reenviando} style={styles.footer}>
        <Text style={{ color: restante > 0 ? colors.textSecondary : colors.primary, fontWeight: '600' }}>
          {restante > 0 ? `Reenviar código em ${restante}s` : reenviando ? 'Enviando...' : 'Reenviar código'}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login', { tipo })} style={styles.footer}>
        <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Voltar ao login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 16, marginBottom: 12, textAlign: 'center' },
  subtitulo: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 28 },
  erro: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  aviso: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  footer: { marginTop: 20, alignItems: 'center' },
});