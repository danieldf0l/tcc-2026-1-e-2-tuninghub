import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { buscarEnderecoDaOficina, salvarEnderecoDaOficina } from '../../../api/endereco.api';
import { buscarEnderecoPorCep } from '../../../utils/cep';
import { getErrorMessage } from '../../../utils/errorHandler';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';

export default function EnderecoOficinaScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario } = useAuth();
  const idOficina = usuario?.IdOficina;

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const endereco = await buscarEnderecoDaOficina(idOficina);
        setRua(endereco.Rua || '');
        setNumero(endereco.Numero || '');
        setBairro(endereco.Bairro || '');
        setCidade(endereco.Cidade || '');
        setEstado(endereco.Estado || '');
        setCep(endereco.CEP || '');
      } catch {
        // Sem endereço cadastrado ainda — formulário fica vazio para preenchimento
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [idOficina]);

  async function handleCepChange(valor) {
    setCep(valor);
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      const endereco = await buscarEnderecoPorCep(cepLimpo);
      if (endereco) {
        setRua(endereco.rua);
        setBairro(endereco.bairro);
        setCidade(endereco.cidade);
        setEstado(endereco.estado);
      }
      setBuscandoCep(false);
    }
  }

  async function handleSalvar() {
    setErro('');
    setSucesso('');

    if (!rua || !cidade || !estado || !cep) {
      setErro('Preencha rua, cidade, estado e CEP.');
      return;
    }

    setSalvando(true);
    try {
      const resultado = await salvarEnderecoDaOficina(idOficina, {
        rua, numero, bairro, cidade, estado, cep,
      });
      setSucesso(`Endereço salvo — ${resultado.distanciaKm}km do SENAC Nações Unidas.`);
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Endereço</Text>
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
        Sua oficina precisa estar a até 4km do SENAC Nações Unidas.
      </Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <>
          <Input placeholder="CEP" value={cep} onChangeText={handleCepChange} keyboardType="numeric" />
          {buscandoCep ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 12 }} /> : null}

          <Input placeholder="Rua" value={rua} onChangeText={setRua} />
          <Input placeholder="Número" value={numero} onChangeText={setNumero} keyboardType="numeric" />
          <Input placeholder="Bairro" value={bairro} onChangeText={setBairro} />
          <Input placeholder="Cidade" value={cidade} onChangeText={setCidade} />
          <Input placeholder="Estado (UF)" value={estado} onChangeText={setEstado} autoCapitalize="characters" />

          {erro ? <Text style={[styles.mensagem, { color: colors.danger }]}>{erro}</Text> : null}
          {sucesso ? <Text style={[styles.mensagem, { color: colors.primary }]}>{sucesso}</Text> : null}

          <View style={{ height: 12 }} />
          <Button title="Salvar endereço" onPress={handleSalvar} loading={salvando} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 4 },
  subtitulo: { fontSize: 13, marginBottom: 20 },
  mensagem: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});