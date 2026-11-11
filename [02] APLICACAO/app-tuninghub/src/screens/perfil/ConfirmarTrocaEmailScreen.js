import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { MailCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { confirmarTrocaEmail } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import CodeInput from '../../components/CodeInput';
import Button from '../../components/Button';

export default function ConfirmarTrocaEmailScreen({ route, navigation }) {
  const { emailPendente } = route.params;
  const { colors, fonts, typography } = useTheme();
  const { tipoConta, atualizarUsuario } = useAuth();
  const { mostrar } = useToast();

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
      mostrar('E-mail alterado. O novo endereço já está valendo.');
    } catch (e) {
      setErro(getErrorMessage(e));
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        Icone={MailCheck}
        titulo="Confirme o novo e-mail"
        subtitulo={
          <>
            Enviamos um código de 6 dígitos para{' '}
            <Text style={{ color: colors.text, fontFamily: fonts.semibold }}>{emailPendente}</Text>. Até confirmar, sua
            conta continua usando o e-mail atual.
          </>
        }
      />

      <CodeInput value={codigo} onChange={setCodigo} error={!!erro} />

      <AvisoInline mensagem={erro} />

      <Button title="Confirmar" onPress={handleConfirmar} loading={loading} disabled={codigo.length !== 6} />

      <Text style={[typography.caption, styles.dica, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
        O código expirou? Volte, salve o novo e-mail de novo e aguarde 1 minuto entre os pedidos.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dica: { textAlign: 'center', marginTop: 20 },
});