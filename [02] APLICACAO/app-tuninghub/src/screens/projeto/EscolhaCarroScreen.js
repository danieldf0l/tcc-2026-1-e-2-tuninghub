import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { listarMontadoras } from '../../api/montadora.api';
import { listarModelosPorMontadora } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import SearchSelect from '../../components/SearchSelect';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function EscolhaCarroScreen({ navigation }) {
  const { colors } = useTheme();

  const [montadoras, setMontadoras] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [idMontadora, setIdMontadora] = useState('');
  const [idModelo, setIdModelo] = useState('');
  const [carregandoMontadoras, setCarregandoMontadoras] = useState(true);
  const [carregandoModelos, setCarregandoModelos] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await listarMontadoras();
        setMontadoras(lista);
      } catch (e) {
        setErro(getErrorMessage(e));
      } finally {
        setCarregandoMontadoras(false);
      }
    }
    carregar();
  }, []);

  useEffect(() => {
    if (!idMontadora) {
      setModelos([]);
      setIdModelo('');
      return;
    }
    async function carregarModelos() {
      setCarregandoModelos(true);
      setIdModelo('');
      try {
        const lista = await listarModelosPorMontadora(idMontadora);
        setModelos(lista);
      } catch (e) {
        setErro(getErrorMessage(e));
      } finally {
        setCarregandoModelos(false);
      }
    }
    carregarModelos();
  }, [idMontadora]);

  const modeloSelecionado = modelos.find((m) => String(m.IdModelo ?? m.id) === String(idModelo));

  function handleProximo() {
    if (!idModelo) {
      setErro('Selecione a marca e o modelo do carro.');
      return;
    }
    navigation.navigate('EscolhaEstilo', {
      idModelo,
      nomeCarro: modeloSelecionado?.NomeModelo || modeloSelecionado?.Nome || modeloSelecionado?.nome || '',
    });
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Qual é o seu carro?</Text>

      {carregandoMontadoras ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <>
          <SearchSelect
            label="Marca"
            placeholder="Selecione a marca"
            value={idMontadora}
            onSelect={setIdMontadora}
            items={montadoras.map((m) => ({
              label: m.Nome || m.nome,
              value: String(m.IdMontadora ?? m.id),
            }))}
          />

          <SearchSelect
            label="Modelo"
            placeholder={carregandoModelos ? 'Carregando...' : 'Selecione o modelo'}
            value={idModelo}
            onSelect={setIdModelo}
            disabled={!idMontadora || carregandoModelos}
            items={modelos.map((m) => ({
              label: m.NomeModelo || m.Nome || m.nome,
              value: String(m.IdModelo ?? m.id),
            }))}
          />
        </>
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <View style={{ height: 24 }} />
      <Button title="Próximo" onPress={handleProximo} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 24, marginTop: 16 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});