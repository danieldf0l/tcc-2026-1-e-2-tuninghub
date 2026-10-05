import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { cadastrarOficina } from '../../../api/oficina.api';
import { buscarEnderecoPorCep } from '../../../utils/cep';
import { getErrorMessage } from '../../../utils/errorHandler';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';

export default function CadastroOficinaEnderecoScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { entrar } = useAuth();

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [loading, setLoading] = useState(false);

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

  async function handleFinalizar() {
    setErro('');
    const vazios = [];
    if (!rua) vazios.push('rua');
    if (!cidade) vazios.push('cidade');
    if (!estado) vazios.push('estado');
    if (!cep) vazios.push('cep');

    if (vazios.length > 0) {
      setErro('Preencha rua, cidade, estado e CEP.');
      setCamposComErro(vazios);
      return;
    }

    setCamposComErro([]);
    setLoading(true);
    try {
      const { nomeProprietario, email, senha, termosAceitos, nomeOficina, cnpj, telefone } = route.params;

      await cadastrarOficina({
        nomeOficina,
        cnpj,
        nomeProprietario,
        telefone,
        email,
        senha,
        termosAceitos,
        endereco: { rua, numero, bairro, cidade, estado, cep },
      });

      // Oficina criada com sucesso (transação atômica) — autentica automaticamente
      await entrar('oficina', email, senha);
      // A navegação para a escolha de plano é tratada automaticamente pelo RootNavigator
      // (toda oficina sem assinatura cai direto na tela MinhaAssinatura, sem acesso ao resto do app)
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.etapa, { color: colors.primary }]}>Etapa 3 de 3</Text>
      <Text style={[styles.title, { color: colors.text }]}>Endereço</Text>
      <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
        Sua oficina precisa estar a até 4km do SENAC Nações Unidas.
      </Text>

      <Input
        placeholder="CEP"
        value={cep}
        onChangeText={handleCepChange}
        keyboardType="numeric"
        error={camposComErro.includes('cep')}
      />
      {buscandoCep ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 12 }} /> : null}

      <Input
        placeholder="Rua"
        value={rua}
        onChangeText={setRua}
        error={camposComErro.includes('rua')}
      />
      <Input placeholder="Número" value={numero} onChangeText={setNumero} keyboardType="numeric" />
      <Input placeholder="Bairro" value={bairro} onChangeText={setBairro} />
      <Input
        placeholder="Cidade"
        value={cidade}
        onChangeText={setCidade}
        error={camposComErro.includes('cidade')}
      />
      <Input
        placeholder="Estado (UF)"
        value={estado}
        onChangeText={setEstado}
        autoCapitalize="characters"
        error={camposComErro.includes('estado')}
      />

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 12 }} />
      <Button title="Finalizar cadastro" onPress={handleFinalizar} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  etapa: { fontSize: 12, fontWeight: '800', marginTop: 16, letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '800', marginTop: 4, marginBottom: 4 },
  subtitulo: { fontSize: 13, marginBottom: 20 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});