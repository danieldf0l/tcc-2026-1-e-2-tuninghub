import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trash2, Lock, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { excluirMinhaConta } from '../../api/conta.api';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import Input from '../../components/Input';
import Button from '../../components/Button';

const ITENS_USUARIO = ['Seus projetos e as listas de serviços', 'Seus dados de cadastro', 'Seu acesso ao app'];

const ITENS_OFICINA = [
  'Perfil, logo e fotos da oficina',
  'Serviços oferecidos e endereço',
  'Assinaturas e histórico de plano',
  'Seu acesso ao app',
];

export default function ExcluirContaScreen({ navigation }) {
  const { colors, fonts, typography, radius } = useTheme();
  const { tipoConta, sair } = useAuth();
  const { mostrar } = useToast();

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const ehOficina = tipoConta === 'oficina';
  const itens = ehOficina ? ITENS_OFICINA : ITENS_USUARIO;
  const podeExcluir = !!senha && confirmacao.trim() === 'EXCLUIR';

  async function handleExcluir() {
    if (!podeExcluir || loading) return;
    setErro('');
    setLoading(true);
    try {
      const resposta = await excluirMinhaConta(tipoConta, senha);
      await sair();
      mostrar(resposta?.message || 'Conta excluída. Seus dados foram removidos.');
    } catch (e) {
      setErro(getErrorMessage(e));
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        Icone={Trash2}
        titulo="Excluir conta"
        subtitulo="Esta ação é definitiva e não pode ser desfeita."
      />

      <View style={[styles.lista, { backgroundColor: colors.dangerSoft, borderColor: colors.danger, borderRadius: radius.lg }]}>
        <Text style={[typography.bodyStrong, { color: colors.text }]}>O que será apagado</Text>
        {itens.map((item) => (
          <View key={item} style={styles.item}>
            <X size={15} color={colors.danger} strokeWidth={2.75} />
            <Text style={[typography.body, styles.flex, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
        {ehOficina ? (
          <Text style={[typography.caption, styles.nota, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            O registro financeiro dos pagamentos permanece no processador de pagamentos.
          </Text>
        ) : null}
      </View>

      <Input
        Icone={Lock}
        placeholder="Sua senha"
        value={senha}
        onChangeText={setSenha}
        secureText
        autoComplete="current-password"
        textContentType="password"
      />
      <Input
        Icone={Trash2}
        placeholder='Digite "EXCLUIR" para confirmar'
        value={confirmacao}
        onChangeText={setConfirmacao}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <AvisoInline mensagem={erro} />

      <Button
        title="Excluir minha conta"
        Icone={Trash2}
        onPress={handleExcluir}
        loading={loading}
        disabled={!podeExcluir || loading}
      />
      <View style={styles.espaco} />
      <Button title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} disabled={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lista: { borderWidth: 1.5, padding: 16, marginBottom: 20, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nota: { marginTop: 4 },
  espaco: { height: 6 },
});