import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MailCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reenviarCodigo } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useContagem } from '../../utils/useContagem';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import CodeInput from '../../components/CodeInput';
import Button from '../../components/Button';

export default function ConfirmarEmailScreen({ route, navigation }) {
  const { tipo, email, senha } = route.params; // senha só em memória (o backend exige para confirmar)
  const { colors, fonts, typography } = useTheme();
  const { confirmarEmail } = useAuth();
  const { mostrar } = useToast();
  const { restante, reiniciar } = useContagem(60);

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function handleConfirmar() {
    setErro('');
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
    setReenviando(true);
    try {
      const resposta = await reenviarCodigo(email, tipo);
      mostrar(resposta?.message || 'Enviamos um novo código.', 'info');
      reiniciar();
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setReenviando(false);
    }
  }

  const textoReenvio =
    restante > 0 ? `Reenviar código em ${restante}s` : reenviando ? 'Enviando...' : 'Reenviar código';

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        Icone={MailCheck}
        titulo="Confirme seu e-mail"
        subtitulo={
          <>
            Enviamos um código de 6 dígitos para{' '}
            <Text style={{ color: colors.text, fontFamily: fonts.semibold }}>{email}</Text>. Confira também a caixa
            de spam.
          </>
        }
      />

      <CodeInput value={codigo} onChange={setCodigo} error={!!erro} />

      <AvisoInline mensagem={erro} />

      <Button title="Confirmar" onPress={handleConfirmar} loading={loading} disabled={codigo.length !== 6} />

      <Pressable onPress={handleReenviar} disabled={restante > 0 || reenviando} hitSlop={8} style={styles.link}>
        <Text
          style={[
            typography.body,
            { color: restante > 0 ? colors.textSecondary : colors.primary, fontFamily: fonts.semibold },
          ]}
        >
          {textoReenvio}
        </Text>
      </Pressable>

      <View style={styles.espaco} />
      <Button title="Voltar ao login" variant="ghost" onPress={() => navigation.navigate('Login', { tipo })} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', marginTop: 20 },
  espaco: { height: 8 },
});