import { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin, Hash, Map as MapaIcone, Building } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { buscarEnderecoDaOficina, salvarEnderecoDaOficina } from '../../../api/endereco.api';
import { buscarEnderecoPorCep } from '../../../utils/cep';
import { mascaraCep, somenteDigitos, formatarDistancia } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/errorHandler';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import AvisoInline from '../../../components/AvisoInline';
import MiniMapa from '../../../components/MiniMapa';
import Skeleton from '../../../components/Skeleton';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const VAZIO = { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' };

// "Assinatura" do endereço para saber se algo mudou (ignora máscara e espaços)
const assinaturaEndereco = (f) =>
  JSON.stringify([
    f.rua.trim(),
    f.numero.trim(),
    f.bairro.trim(),
    f.cidade.trim(),
    f.estado.trim().toUpperCase(),
    somenteDigitos(f.cep),
  ]);

export default function EnderecoOficinaScreen({ navigation }) {
  const { colors, fonts, typography, radius } = useTheme();
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const idOficina = usuario?.IdOficina;
  const numeroRef = useRef(null);

  const [form, setForm] = useState(VAZIO);
  const [original, setOriginal] = useState(assinaturaEndereco(VAZIO));
  const [coords, setCoords] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const e = await buscarEnderecoDaOficina(idOficina);
        const dados = {
          rua: e.Rua || '',
          numero: e.Numero ? String(e.Numero) : '',
          bairro: e.Bairro || '',
          cidade: e.Cidade || '',
          estado: e.Estado || '',
          cep: mascaraCep(e.CEP || ''),
        };
        setForm(dados);
        setOriginal(assinaturaEndereco(dados));
        if (e.Latitude && e.Longitude) setCoords({ lat: e.Latitude, lng: e.Longitude });
      } catch {
        // Sem endereço cadastrado ainda — formulário fica vazio para preenchimento
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [idOficina]);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleCepChange(valor) {
    const mascarado = mascaraCep(valor);
    atualizarCampo('cep', mascarado);
    setCepNaoEncontrado(false);

    const cepLimpo = somenteDigitos(mascarado);
    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      const endereco = await buscarEnderecoPorCep(cepLimpo);
      if (endereco) {
        setForm((prev) => ({
          ...prev,
          rua: endereco.rua,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
        }));
        numeroRef.current?.focus();
      } else {
        setCepNaoEncontrado(true);
      }
      setBuscandoCep(false);
    }
  }

  const alterado = assinaturaEndereco(form) !== original;

  async function handleSalvar() {
    setErro('');
    const { rua, numero, bairro, cidade, estado, cep } = form;

    if (!rua.trim() || !cidade.trim() || !estado.trim() || !cep) {
      setErro('Preencha rua, cidade, estado e CEP.');
      return;
    }
    if (somenteDigitos(cep).length !== 8) {
      setErro('CEP incompleto.');
      return;
    }

    setSalvando(true);
    try {
      const resultado = await salvarEnderecoDaOficina(idOficina, {
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        cep: somenteDigitos(cep),
      });
      setOriginal(assinaturaEndereco(form));

      const lat = resultado?.latitude ?? resultado?.Latitude;
      const lng = resultado?.longitude ?? resultado?.Longitude;
      if (lat && lng) setCoords({ lat, lng });

      const distancia = formatarDistancia(resultado?.distanciaKm);
      mostrar(distancia ? `Endereço salvo · ${distancia} do SENAC` : 'Endereço salvo.');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  }

  const rodape = (
    <>
      <AvisoInline mensagem={erro} />
      <Button title="Salvar endereço" onPress={handleSalvar} loading={salvando} disabled={!alterado || salvando} />
    </>
  );

  return (
    <ScreenContainer rodape={rodape}>
      <ScreenHeader onVoltar={() => navigation.goBack()} titulo="Endereço" subtitulo="Onde os Entusiastas encontram sua oficina." />

      <AvisoInline tipo="info" mensagem="A oficina precisa estar a até 4 km do SENAC Nações Unidas." />

      {carregando ? (
        <>
          <Skeleton height={160} borderRadius={radius.lg} style={styles.skeleton} />
          <Skeleton height={52} borderRadius={radius.md} style={styles.skeleton} />
          <Skeleton height={52} borderRadius={radius.md} style={styles.skeleton} />
        </>
      ) : (
        <>
          {coords ? (
            <View style={styles.mapa}>
              <MiniMapa latitude={coords.lat} longitude={coords.lng} height={160} />
            </View>
          ) : null}

          <Input
            Icone={MapPin}
            placeholder="CEP"
            value={form.cep}
            onChangeText={handleCepChange}
            keyboardType="number-pad"
            autoComplete="postal-code"
            textContentType="postalCode"
            maxLength={9}
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

          <Input Icone={MapaIcone} placeholder="Rua" value={form.rua} onChangeText={(v) => atualizarCampo('rua', v)} autoCapitalize="words" />

          <View style={styles.linha}>
            <View style={styles.colunaPequena}>
              <Input
                ref={numeroRef}
                Icone={Hash}
                placeholder="Nº"
                value={form.numero}
                onChangeText={(v) => atualizarCampo('numero', v)}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.colunaGrande}>
              <Input placeholder="Bairro" value={form.bairro} onChangeText={(v) => atualizarCampo('bairro', v)} autoCapitalize="words" />
            </View>
          </View>

          <View style={styles.linha}>
            <View style={styles.colunaGrande}>
              <Input
                Icone={Building}
                placeholder="Cidade"
                value={form.cidade}
                onChangeText={(v) => atualizarCampo('cidade', v)}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.colunaPequena}>
              <Input
                placeholder="UF"
                value={form.estado}
                onChangeText={(v) => atualizarCampo('estado', v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  skeleton: { marginBottom: 12 },
  mapa: { marginBottom: 16 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -6, marginBottom: 14, paddingLeft: 4 },
  linha: { flexDirection: 'row', gap: 10 },
  colunaPequena: { flex: 1 },
  colunaGrande: { flex: 2 },
});