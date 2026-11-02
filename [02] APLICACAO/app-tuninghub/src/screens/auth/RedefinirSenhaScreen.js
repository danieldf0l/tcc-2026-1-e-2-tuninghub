import { useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { esqueciSenha, redefinirSenha } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useContagem } from '../../utils/useContagem';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function RedefinirSenhaScreen({ route, navigation }) {
  const { tipo, email } = route.params;
  const { colors } = useTheme();
  const { restante, reiniciar } = useContagem(60);

  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function handleRedefinir() {
    setErro('');
    setAviso('');
    setCamposComErro([]);

    const vazios = [];
    if (codigo.length !== 6) vazios.push('codigo');
    if (!novaSenha) vazios.push('novaSenha');
    if (!confirmarNovaSenha) vazios.push('confirmarNovaSenha');

    if (vazios.length > 0) {
      setErro('Informe o código de 6 dígitos e a nova senha.');
      setCamposComErro(vazios);
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErro('As senhas não coincidem.');
      setCamposComErro(['novaSenha', 'confirmarNovaSenha']);
      return;
    }

    setLoading(true);
    try {
      const resposta = await redefinirSenha({ email, tipo, codigo, novaSenha, confirmarNovaSenha });
      // Volta ao login com o e-mail já preenchido
      navigation.reset({
        index: 1,
        routes: [
          { name: 'RoleSelect' },
          { name: 'Login', params: { tipo, emailInicial: email } },
        ],
      });
      Alert.alert('Senha redefinida', resposta.message);
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
      const resposta = await esqueciSenha(email, tipo);
      setAviso(resposta.message);
      reiniciar();
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setReenviando(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={() => navigation.goBack()} />

      <Text style={[styles.title, { color: colors.text }]}>Nova senha</Text>
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
        Digite o código enviado para <Text style={{ color: colors.text, fontWeight: '700' }}>{email}</Text> e
        escolha uma nova senha (mínimo de 8 caracteres, com maiúscula, número e caractere especial).
      </Text>

      <Input
        placeholder="Código de 6 dígitos"
        value={codigo}
        onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        error={camposComErro.includes('codigo')}
      />
      <Input
        placeholder="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureText
        error={camposComErro.includes('novaSenha')}
      />
      <Input
        placeholder="Confirmar nova senha"
        value={confirmarNovaSenha}
        onChangeText={setConfirmarNovaSenha}
        secureText
        error={camposComErro.includes('confirmarNovaSenha')}
      />

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
      {aviso ? <Text style={[styles.aviso, { color: colors.textSecondary }]}>{aviso}</Text> : null}

      <View style={{ height: 12 }} />
      <Button title="Redefinir senha" onPress={handleRedefinir} loading={loading} />

      <Pressable onPress={handleReenviar} disabled={restante > 0 || reenviando} style={styles.footer}>
        <Text style={{ color: restante > 0 ? colors.textSecondary : colors.primary, fontWeight: '600' }}>
          {restante > 0 ? `Reenviar código em ${restante}s` : reenviando ? 'Enviando...' : 'Reenviar código'}
        </Text>
      </Pressable>
    </ScrollView>
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