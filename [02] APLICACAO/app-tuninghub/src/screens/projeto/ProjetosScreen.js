import { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Archive, Car } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { listarMeusProjetos, listarMeusProjetosArquivados } from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { listarItensDoProjeto } from '../../api/projetoServico.api';
import { getErrorMessage } from '../../utils/errorHandler';
import Button from '../../components/Button';
import ProjetoCard from '../../components/ProjetoCard';
import ProjetoCardSkeleton from '../../components/ProjetoCardSkeleton';
import MenuListItem from '../../components/MenuListItem';
import EmptyState from '../../components/EmptyState';
import AvisoInline from '../../components/AvisoInline';

const LIMITE_PROJETOS = 3;

export default function ProjetosScreen({ navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();

  const [projetos, setProjetos] = useState([]);
  const [qtdArquivados, setQtdArquivados] = useState(0);
  const [nomesModelos, setNomesModelos] = useState({});
  const [progressos, setProgressos] = useState({});
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

      // Só para mostrar o link "Projetos arquivados (N)"; falha aqui não atrapalha a lista
      try {
        const arquivados = await listarMeusProjetosArquivados();
        setQtdArquivados(arquivados.length);
      } catch {
        setQtdArquivados(0);
      }

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

  const subtitulo =
    projetos.length === 0
      ? 'Nenhum projeto criado ainda'
      : `${projetos.length} ${projetos.length === 1 ? 'projeto ativo' : 'projetos ativos'}${
          atingiuLimite ? ' · arquive um para criar outro' : ''
        }`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 16,
          paddingHorizontal: layout.screenPadding,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text }]}>Projetos</Text>
        <View
          style={[
            styles.contador,
            {
              backgroundColor: atingiuLimite ? colors.primarySoft : colors.surface,
              borderColor: atingiuLimite ? colors.primary : colors.border,
              borderRadius: radius.pill,
            },
          ]}
        >
          <Text
            style={[
              styles.contadorTexto,
              { fontFamily: fonts.bold, color: atingiuLimite ? colors.primary : colors.textSecondary },
            ]}
          >
            {projetos.length}/{LIMITE_PROJETOS}
          </Text>
        </View>
      </View>

      <Text style={[typography.body, styles.subtitulo, { color: colors.textSecondary }]}>{subtitulo}</Text>

      <AvisoInline mensagem={erro} />

      {carregando ? (
        <View style={styles.lista}>
          <ProjetoCardSkeleton />
          <ProjetoCardSkeleton />
        </View>
      ) : (
        <FlatList
          style={styles.lista}
          data={projetos}
          keyExtractor={(item, index) => String(item.IdProjeto ?? item.id ?? index)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={handleAtualizar} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listaConteudo}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <EmptyState
                Icone={Car}
                titulo="Sem projetos por aqui"
                descricao="Crie seu primeiro projeto e monte a lista de customização do seu carro."
              />
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

      <View style={styles.rodape}>
        {qtdArquivados > 0 ? (
          <View style={styles.arquivados}>
            <MenuListItem
              semCard
              Icone={Archive}
              titulo="Projetos arquivados"
              subtitulo={`${qtdArquivados} ${qtdArquivados === 1 ? 'projeto' : 'projetos'}`}
              onPress={() => navigation.navigate('ProjetosArquivados')}
            />
          </View>
        ) : null}

        <Button
          title={atingiuLimite ? 'Limite de 3 projetos atingido' : 'Novo projeto'}
          Icone={atingiuLimite ? undefined : Plus}
          onPress={() => navigation.navigate('EscolhaCarro')}
          disabled={atingiuLimite}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contador: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  contadorTexto: { fontSize: 13 },
  subtitulo: { marginTop: 4, marginBottom: 16 },
  lista: { flex: 1 },
  listaConteudo: { paddingTop: 4, paddingBottom: 12, flexGrow: 1 },
  vazio: { flex: 1, justifyContent: 'center' },
  rodape: { paddingTop: 8, paddingBottom: 16 },
  arquivados: { marginBottom: 12 },
});