import { useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin, Hash, Map, Building } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { cadastrarOficina } from '../../../api/oficina.api';
import { buscarEnderecoPorCep } from '../../../utils/cep';
import { mascaraCep, somenteDigitos } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/errorHandler';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import ProgressoEtapas from '../../../components/ProgressoEtapas';
import AvisoInline from '../../../components/AvisoInline';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

export default function CadastroOficinaEnderecoScreen({ route, navigation }) {
  const { colors, fonts, typography } = useTheme();
  const numeroRef = useRef(null);

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false);
  const [erro, setErro] = useState('');
  const [camposComErro, setCamposComErro] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleCepChange(valor) {
    const mascarado = mascaraCep(valor);
    setCep(mascarado);
    setCepNaoEncontrado(false);

    const cepLimpo = somenteDigitos(mascarado);
    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      const endereco = await buscarEnderecoPorCep(cepLimpo);
      if (endereco) {
        setRua(endereco.rua);
        setBairro(endereco.bairro);
        setCidade(endereco.cidade);
        setEstado(endereco.estado);
        numeroRef.current?.focus();
      } else {
        setCepNaoEncontrado(true);
      }
      setBuscandoCep(false);
    }
  }

  async function handleFinalizar() {
    setErro('');
    const vazios = [];
    if (!rua.trim()) vazios.push('rua');
    if (!cidade.trim()) vazios.push('cidade');
    if (!estado.trim()) vazios.push('estado');
    if (!cep) vazios.push('cep');

    if (vazios.length > 0) {
      setErro('Preencha rua, cidade, estado e CEP.');
      setCamposComErro(vazios);
      return;
    }

    if (somenteDigitos(cep).length !== 8) {
      setErro('CEP incompleto.');
      setCamposComErro(['cep']);
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
        endereco: {
          rua: rua.trim(),
          numero: numero.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase(),
          cep: somenteDigitos(cep),
        },
      });

      // Oficina criada com e-mail não confirmado: o backend já enviou o código.
      // Reinicia a pilha para que "voltar" leve ao login, não ao wizard.
      navigation.reset({
        index: 2,
        routes: [
          { name: 'RoleSelect' },
          { name: 'Login', params: { tipo: 'oficina' } },
          { name: 'ConfirmarEmail', params: { tipo: 'oficina', email, senha } },
        ],
      });
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        acaoDireita={<ProgressoEtapas atual={3} />}
        titulo="Onde fica a oficina?"
        subtitulo="Comece pelo CEP que a gente completa o resto."
      />

      <AvisoInline tipo="info" mensagem="O TuningHub atende oficinas a até 4 km do SENAC Nações Unidas." />

      <Input
        Icone={MapPin}
        placeholder="CEP"
        value={cep}
        onChangeText={handleCepChange}
        keyboardType="number-pad"
        autoComplete="postal-code"
        textContentType="postalCode"
        maxLength={9}
        error={camposComErro.includes('cep')}
      />

      {buscandoCep ? (
        <View style={styles.status}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            Buscando endereço...
          </Text>
        </View>
      ) : cepNaoEncontrado ? (
        <View style={styles.status}>
          <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            CEP não encontrado. Preencha o endereço abaixo.
          </Text>
        </View>
      ) : null}

      <Input
        Icone={Map}
        placeholder="Rua"
        value={rua}
        onChangeText={setRua}
        autoCapitalize="words"
        error={camposComErro.includes('rua')}
      />

      <View style={styles.linha}>
        <View style={styles.colunaPequena}>
          <Input
            ref={numeroRef}
            Icone={Hash}
            placeholder="Nº"
            value={numero}
            onChangeText={setNumero}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.colunaGrande}>
          <Input placeholder="Bairro" value={bairro} onChangeText={setBairro} autoCapitalize="words" />
        </View>
      </View>

      <View style={styles.linha}>
        <View style={styles.colunaGrande}>
          <Input
            Icone={Building}
            placeholder="Cidade"
            value={cidade}
            onChangeText={setCidade}
            autoCapitalize="words"
            error={camposComErro.includes('cidade')}
          />
        </View>
        <View style={styles.colunaPequena}>
          <Input
            placeholder="UF"
            value={estado}
            onChangeText={(v) => setEstado(v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))}
            autoCapitalize="characters"
            maxLength={2}
            error={camposComErro.includes('estado')}
          />
        </View>
      </View>

      <AvisoInline mensagem={erro} />

      <Button title="Finalizar cadastro" onPress={handleFinalizar} loading={loading} />

      {loading ? (
        <Text style={[typography.caption, styles.esperando, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          Validando CNPJ e localização. Isso pode levar alguns segundos.
        </Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -6, marginBottom: 14, paddingLeft: 4 },
  linha: { flexDirection: 'row', gap: 10 },
  colunaPequena: { flex: 1 },
  colunaGrande: { flex: 2 },
  esperando: { textAlign: 'center', marginTop: 12 },
});