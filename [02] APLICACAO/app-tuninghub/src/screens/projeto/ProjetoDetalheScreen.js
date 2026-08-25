import { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { listarItensDoProjeto, marcarConcluido } from '../../api/projetoServico.api';
import { getErrorMessage } from '../../utils/errorHandler';
import BackButton from '../../components/BackButton';
import ChecklistItem from '../../components/ChecklistItem';
import Button from '../../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProjetoDetalheScreen({ route, navigation }) {
  const { idProjeto, nomeCarro } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const lista = await listarItensDoProjeto(idProjeto);
      setItens(lista);
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [idProjeto])
  );

  async function alternarConcluido(idServico, valorAtual) {
    setItens((prev) =>
      prev.map((i) => (i.IdServico === idServico ? { ...i, Concluido: !valorAtual } : i))
    );
    try {
      await marcarConcluido(idProjeto, idServico, !valorAtual);
    } catch (e) {
      setErro(getErrorMessage(e));
      setItens((prev) =>
        prev.map((i) => (i.IdServico === idServico ? { ...i, Concluido: valorAtual } : i))
      );
    }
  }

  function irParaAdicionarServico() {
    const idsJaAdicionados = itens.map((i) => i.IdServico);
    navigation.navigate('AdicionarServico', { idProjeto, idsJaAdicionados });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>{nomeCarro || 'Projeto'}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Lista de serviços</Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item, index) => String(item.IdServico ?? index)}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={[styles.vazio, { color: colors.textSecondary }]}>
              Nenhum serviço adicionado ainda.
            </Text>
          }
          renderItem={({ item }) => (
            <ChecklistItem
              titulo={item.NomeServico || item.nomeServico || item.Nome || item.nome || item.Servico?.Nome}
              concluido={!!item.Concluido}
              onToggle={() => alternarConcluido(item.IdServico, !!item.Concluido)}
            />
          )}
        />
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <Button title="+ Adicionar serviço" variant="outline" onPress={irParaAdicionarServico} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  vazio: { textAlign: 'center', marginTop: 40 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});