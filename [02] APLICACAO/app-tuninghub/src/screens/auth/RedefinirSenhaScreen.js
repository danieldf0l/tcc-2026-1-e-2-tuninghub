import { useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { esqueciSenha } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useContagem } from '../../utils/useContagem';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import CodeInput from '../../components/CodeInput';
import Button from '../../components/Button';

// Etapa 1 da recuperação: só o código. A nova senha é pedida em NovaSenhaScreen.
export default function RedefinirSenhaScreen({ route, navigation }) {
  const { tipo, email } = route.params;
  const { colors, fonts, typography } = useTheme();
  const { mostrar } = useToast();
  const { restante, reiniciar } = useContagem(60);

  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [reenviando, setReenviando] = useState(false);

  function handleContinuar() {
    setErro('');
    if (codigo.length !== 6) {
      setErro('Digite o código de 6 dígitos.');
      return;
    }
    navigation.navigate('NovaSenha', { tipo, email, codigo });
  }

  async function handleReenviar() {
    if (restante > 0 || reenviando) return;
    setErro('');
    setReenviando(true);
    try {
      const resposta = await esqueciSenha(email, tipo);
      setCodigo('');
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
        Icone={ShieldCheck}
        titulo="Digite o código"
        subtitulo={
          <>
            Enviamos um código de 6 dígitos para{' '}
            <Text style={{ color: colors.text, fontFamily: fonts.semibold }}>{email}</Text>.
          </>
        }
      />

      <CodeInput value={codigo} onChange={setCodigo} error={!!erro} />

      <AvisoInline mensagem={erro} />

      <Button title="Continuar" onPress={handleContinuar} disabled={codigo.length !== 6} />

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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', marginTop: 20 },
});