import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useEstilos } from '../../context/EstilosContext';
import {
  listarMeusProjetosArquivados,
  desarquivarProjeto,
  excluirProjetoDefinitivamente,
} from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';

export default function ProjetosArquivadosScreen({ navigation }) {
  const { colors } = useTheme();
  const { getNomeEstilo } = useEstilos();
  const insets = useSafeAreaInsets();

  const [projetos, setProjetos] = useState([]);
  const [nomesModelos, setNomesModelos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [idProcessando, setIdProcessando] = useState(null);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const [lista, modelos] = await Promise.all([listarMeusProjetosArquivados(), listarTodosModelos()]);
      setProjetos(lista);

      const mapa = {};
      modelos.forEach((m) => {
        mapa[String(m.IdModelo ?? m.id)] = m.NomeModelo || m.Nome || m.nome || 'Carro';
      });
      setNomesModelos(mapa);
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  async function handleDesarquivar(item) {
    setErro('');
    setIdProcessando(item.IdProjeto);
    try {
      await desarquivarProjeto(item.IdProjeto);
      setProjetos((prev) => prev.filter((p) => p.IdProjeto !== item.IdProjeto));
    } catch (e) {
      setErro(getErrorMessage(e)); // ex.: limite de 3 projetos ativos
    } finally {
      setIdProcessando(null);
    }
  }

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir definitivamente',
      'O projeto e toda a lista de serviços dele serão apagados. Não dá para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setErro('');
            setIdProcessando(item.IdProjeto);
            try {
              await excluirProjetoDefinitivamente(item.IdProjeto);
              setProjetos((prev) => prev.filter((p) => p.IdProjeto !== item.IdProjeto));
            } catch (e) {
              setErro(getErrorMessage(e));
            } finally {
              setIdProcessando(null);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Projetos arquivados</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Desarquive para voltar a usar, ou exclua de vez.
      </Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={projetos}
          keyExtractor={(item) => String(item.IdProjeto)}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={[styles.vazio, { color: colors.textSecondary }]}>Nenhum projeto arquivado.</Text>
          }
          renderItem={({ item }) => {
            const nomeCarro = nomesModelos[String(item.IdModelo)] || 'Carro';
            const processando = idProcessando === item.IdProjeto;
            return (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitulo, { color: colors.text }]} numberOfLines={1}>
                  {item.Descricao || nomeCarro}
                </Text>
                <Text style={[styles.cardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.Descricao ? `${nomeCarro} · ` : ''}
                  {item.Estilo ? getNomeEstilo(item.Estilo) : 'Personalizado'}
                </Text>

                <View style={{ height: 14 }} />
                <Button
                  title="Desarquivar"
                  variant="outline"
                  onPress={() => handleDesarquivar(item)}
                  loading={processando}
                  disabled={idProcessando !== null}
                />
                <Pressable
                  onPress={() => confirmarExclusao(item)}
                  disabled={idProcessando !== null}
                  style={styles.excluir}
                >
                  <Text style={{ color: colors.danger, fontWeight: '700' }}>Excluir definitivamente</Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  vazio: { textAlign: 'center', marginTop: 40 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardTitulo: { fontSize: 16, fontWeight: '800' },
  cardSub: { fontSize: 13, marginTop: 2 },
  excluir: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});