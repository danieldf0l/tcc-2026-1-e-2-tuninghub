import { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { listarMeusProjetos } from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { listarItensDoProjeto } from '../../api/projetoServico.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Button from '../../components/Button';
import ProjetoCard from '../../components/ProjetoCard';
import BackButton from '../../components/BackButton';

const LIMITE_PROJETOS = 3; // RN07

export default function ProjetosScreen({ navigation }) {
  const { colors } = useTheme();
  const [projetos, setProjetos] = useState([]);
  const [nomesModelos, setNomesModelos] = useState({}); // { [idModelo]: nome }
  const [progressos, setProgressos] = useState({}); // { [idProjeto]: { concluidos, total } }
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const [listaProjetos, listaModelos] = await Promise.all([
        listarMeusProjetos(),
        listarTodosModelos(),
      ]);

      setProjetos(listaProjetos);

      const mapaModelos = {};
      listaModelos.forEach((m) => {
        const id = String(m.IdModelo ?? m.id);
        mapaModelos[id] = m.NomeModelo || m.Nome || m.nome || 'Carro';
      });
      setNomesModelos(mapaModelos);

      // Busca progresso de cada projeto em paralelo
      const entradas = await Promise.all(
        listaProjetos.map(async (p) => {
          const idProjeto = p.IdProjeto ?? p.id;
          try {
            const itens = await listarItensDoProjeto(idProjeto);
            const total = itens.length;
            const concluidos = itens.filter((i) => !!i.Concluido).length;
            return [idProjeto, { concluidos, total }];
          } catch {
            return [idProjeto, { concluidos: 0, total: 0 }];
          }
        })
      );
      setProgressos(Object.fromEntries(entradas));

      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  function handleAtualizar() {
    setAtualizando(true);
    carregar();
  }

  const atingiuLimite = projetos.length >= LIMITE_PROJETOS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.contador, { color: colors.textSecondary }]}>
          {projetos.length}/{LIMITE_PROJETOS}
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Projetos</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {projetos.length === 0
          ? 'Nenhum projeto criado ainda'
          : `${projetos.length} ${projetos.length === 1 ? 'projeto ativo' : 'projetos ativos'}`}
      </Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={projetos}
          keyExtractor={(item, index) => String(item.IdProjeto ?? item.id ?? index)}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={handleAtualizar} tintColor={colors.primary} />
          }
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 20, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.vazioContainer}>
              <View style={[styles.vazioIcone, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 28 }}>🚗</Text>
              </View>
              <Text style={[styles.vazioTitulo, { color: colors.text }]}>Sem projetos por aqui</Text>
              <Text style={[styles.vazioTexto, { color: colors.textSecondary }]}>
                Crie seu primeiro projeto e comece a montar a to-do list de customização do seu carro.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const idProjeto = item.IdProjeto ?? item.id;
            const nomeCarro = nomesModelos[String(item.IdModelo)] || 'Carro';
            return (
              <ProjetoCard
                nome={item.Descricao}
                nomeCarro={nomeCarro}
                estilo={item.Estilo}
                progresso={progressos[idProjeto]}
                onPress={() =>
                  navigation.navigate('ProjetoDetalhe', {
                    idProjeto,
                    nomeCarro: item.Descricao || nomeCarro,
                  })
                }
              />
            );
          }}
        />
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <Button
        title={atingiuLimite ? 'Limite de 3 projetos atingido' : '+ Novo Projeto'}
        onPress={() => navigation.navigate('EscolhaCarro')}
        disabled={atingiuLimite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contador: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 20 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 4 },
  vazioContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  vazioIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  vazioTitulo: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  vazioTexto: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 12 },
  erro: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
});