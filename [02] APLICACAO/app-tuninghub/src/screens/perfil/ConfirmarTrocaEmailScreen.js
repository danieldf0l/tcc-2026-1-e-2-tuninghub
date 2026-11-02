import { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { confirmarTrocaEmail } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function ConfirmarTrocaEmailScreen({ route, navigation }) {
  const { emailPendente } = route.params;
  const { colors } = useTheme();
  const { tipoConta, atualizarUsuario } = useAuth();
  const insets = useSafeAreaInsets();

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirmar() {
    setErro('');
    if (codigo.length !== 6) {
      setErro('Digite o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const perfil = await confirmarTrocaEmail(tipoConta, codigo);
      atualizarUsuario(perfil);
      navigation.goBack();
      Alert.alert('E-mail alterado', 'Seu novo e-mail já está valendo.');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />

      <Text style={[styles.title, { color: colors.text }]}>Confirme o novo e-mail</Text>
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
        Enviamos um código de 6 dígitos para{' '}
        <Text style={{ color: colors.text, fontWeight: '700' }}>{emailPendente}</Text>. Até confirmar, sua conta
        continua usando o e-mail atual.
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

      <View style={{ height: 12 }} />
      <Button title="Confirmar" onPress={handleConfirmar} loading={loading} />

      <Text style={[styles.dica, { color: colors.textSecondary }]}>
        Código expirou? Volte, salve o novo e-mail de novo e aguarde 1 minuto entre os pedidos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '800', marginTop: 16, marginBottom: 12, textAlign: 'center' },
  subtitulo: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 28 },
  erro: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  dica: { fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: 24 },
});