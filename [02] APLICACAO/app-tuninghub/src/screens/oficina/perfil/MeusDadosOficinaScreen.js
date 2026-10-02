import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { atualizarMinhaFaixaPreco } from '../../../api/oficina.api';
import { getErrorMessage } from '../../../utils/errorHandler';
import Input from '../../../components/Input';
import FaixaPrecoSelector from '../../../components/FaixaPrecoSelector';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';

export default function MeusDadosOficinaScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario, atualizarUsuario } = useAuth();

  const [faixaPreco, setFaixaPreco] = useState(usuario?.FaixaPreco || null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleSalvarFaixaPreco(novaFaixa) {
    setErro('');
    setSucesso('');
    setFaixaPreco(novaFaixa);
    setSalvando(true);
    try {
      await atualizarMinhaFaixaPreco(novaFaixa);
      atualizarUsuario({ FaixaPreco: novaFaixa });
      setSucesso('Faixa de preço atualizada.');
    } catch (e) {
      setErro(getErrorMessage(e));
      setFaixaPreco(usuario?.FaixaPreco || null); // reverte em caso de falha
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Meus dados</Text>

      <Text style={[styles.secaoLabel, { color: colors.textSecondary }]}>INFORMAÇÕES DA CONTA</Text>
      <Text style={[styles.aviso, { color: colors.textSecondary }]}>
        A edição desses dados estará disponível em breve.
      </Text>

      <Input label="Nome da Oficina" value={usuario?.NomeOficina || ''} editable={false} />
      <Input label="CNPJ" value={usuario?.CNPJ || ''} editable={false} />
      <Input label="Nome do Proprietário" value={usuario?.NomeProprietario || ''} editable={false} />
      <Input label="Email" value={usuario?.Email || ''} editable={false} />
      <Input label="Telefone" value={usuario?.Telefone || ''} editable={false} />

      <View style={{ height: 16 }} />
      <Text style={[styles.secaoLabel, { color: colors.textSecondary }]}>FAIXA DE PREÇO</Text>
      <Text style={[styles.descricao, { color: colors.textSecondary }]}>
        Isso ajuda clientes a entenderem o custo médio dos seus serviços antes de entrar em contato.
      </Text>

      <FaixaPrecoSelector valor={faixaPreco} onSelecionar={handleSalvarFaixaPreco} disabled={salvando} />

      {erro ? <Text style={[styles.mensagem, { color: colors.danger }]}>{erro}</Text> : null}
      {sucesso ? <Text style={[styles.mensagem, { color: colors.primary }]}>{sucesso}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 20 },
  secaoLabel: { fontSize: 12, fontWeight: '800', marginBottom: 6, letterSpacing: 0.5 },
  aviso: { fontSize: 13, marginBottom: 16 },
  descricao: { fontSize: 13, marginBottom: 14, lineHeight: 19 },
  mensagem: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});