import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, ListTodo, MapPinOff, WifiOff, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { buscarOficinasPorProjeto } from '../../api/oficina.api';
import { listarMeusProjetos } from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { getUrlImagem } from '../../utils/media';
import { useLocalizacao } from '../../utils/useLocalizacao';
import { getEstiloVisual } from '../../constants/estilos';
import OficinaCard from '../../components/OficinaCard';
import OficinaCardSkeleton from '../../components/OficinaCardSkeleton';
import BackButton from '../../components/BackButton';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import MenuListItem from '../../components/MenuListItem';
import EmptyState from '../../components/EmptyState';
import AvisoInline from '../../components/AvisoInline';
import Skeleton from '../../components/Skeleton';
import Chip from '../../components/Chip';

const nomeServico = (s) => s.NomeServico || s.Nome || s.nome || 'Serviço';

export default function OficinasPorProjetoScreen({ route, navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { coords, status: statusLocalizacao } = useLocalizacao();

  const [idProjeto, setIdProjeto] = useState(route.params?.idProjeto ?? null);

  // --- escolha do projeto (quando a tela abre sem idProjeto) ---
  const [projetos, setProjetos] = useState([]);
  const [nomesModelos, setNomesModelos] = useState({});
  const [carregandoProjetos, setCarregandoProjetos] = useState(!route.params?.idProjeto);

  // --- busca ---
  const [projeto, setProjeto] = useState(null);
  const [todosServicos, setTodosServicos] = useState([]);
  const [selecionados, setSelecionados] = useState(null); // null até a 1ª resposta
  const [oficinas, setOficinas] = useState([]);
  const [total, setTotal] = useState(0);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState('');

  const paginaRef = useRef(1);
  const requisicaoRef = useRef(0); // descarta respostas antigas (chips clicados rápido)

  useEffect(() => {
    if (idProjeto) return;
    (async () => {
      try {
        const [lista, modelos] = await Promise.all([listarMeusProjetos(), listarTodosModelos()]);
        setProjetos(lista);
        const mapa = {};
        modelos.forEach((m) => {
          mapa[String(m.IdModelo ?? m.id)] = m.NomeModelo || m.Nome || m.nome || 'Carro';
        });
        setNomesModelos(mapa);
      } catch (e) {
        setErro(getErrorMessage(e));
      } finally {
        setCarregandoProjetos(false);
      }
    })();
  }, [idProjeto]);

  const carregarPagina = useCallback(
    async (pagina, idServicos) => {
      const req = pagina === 1 ? ++requisicaoRef.current : requisicaoRef.current;
      if (pagina === 1) {
        setCarregando(true);
        setCarregandoMais(false);
      } else {
        setCarregandoMais(true);
      }

      try {
        const r = await buscarOficinasPorProjeto({
          idProjeto,
          idServicos,
          lat: coords?.lat,
          lng: coords?.lng,
          pagina,
        });
        if (req !== requisicaoRef.current) return;

        setProjeto(r.projeto);
        if (idServicos === undefined) {
          // busca sem filtro = lista completa dos serviços pendentes (base dos chips)
          setTodosServicos(r.servicosBuscados);
          setSelecionados((prev) => prev ?? r.servicosBuscados.map((s) => s.IdServico));
        }
        setOficinas((prev) => (pagina === 1 ? r.oficinas : [...prev, ...r.oficinas]));
        setTotal(r.total);
        setTemMais(r.temMais);
        paginaRef.current = pagina;
        setErro('');
      } catch (e) {
        if (req === requisicaoRef.current) setErro(getErrorMessage(e));
      } finally {
        if (req === requisicaoRef.current) {
          setCarregando(false);
          setCarregandoMais(false);
        }
      }
    },
    [idProjeto, coords]
  );

  useEffect(() => {
    if (!idProjeto || statusLocalizacao === 'carregando') return;
    setSelecionados(null);
    setTodosServicos([]);
    setOficinas([]);
    carregarPagina(1, undefined);
  }, [idProjeto, statusLocalizacao, carregarPagina]);

  // "todos marcados" vira undefined: o back usa os pendentes do projeto
  const idsParaBusca = (sel) => (sel.length === todosServicos.length ? undefined : sel);

  function alternarServico(id) {
    const proximos = selecionados.includes(id)
      ? selecionados.filter((x) => x !== id)
      : [...selecionados, id];
    setSelecionados(proximos);

    if (proximos.length === 0) {
      requisicaoRef.current++; // cancela busca em andamento
      setOficinas([]);
      setTotal(0);
      setTemMais(false);
      setCarregando(false);
      return;
    }
    carregarPagina(1, idsParaBusca(proximos));
  }

  function carregarMais() {
    if (carregando || carregandoMais || !temMais || !selecionados?.length) return;
    carregarPagina(paginaRef.current + 1, idsParaBusca(selecionados));
  }

  function tentarDeNovo() {
    carregarPagina(1, selecionados?.length ? idsParaBusca(selecionados) : undefined);
  }

  // ---------- Escolha do projeto ----------
  if (!idProjeto) {
    return (
      <ScreenContainer>
        <ScreenHeader
          onVoltar={() => navigation.goBack()}
          titulo="Escolha o projeto"
          subtitulo="Vamos buscar as oficinas que fazem os serviços que ainda faltam nele."
        />

        <AvisoInline mensagem={erro} />

        {carregandoProjetos ? (
          <>
            <Skeleton height={64} borderRadius={radius.lg} style={styles.skeletonLinha} />
            <Skeleton height={64} borderRadius={radius.lg} style={styles.skeletonLinha} />
          </>
        ) : projetos.length === 0 ? (
          <EmptyState
            Icone={Car}
            titulo="Nenhum projeto ativo"
            descricao="Crie um projeto para buscar oficinas pelos serviços dele."
            acaoTitulo="Criar projeto"
            onAcao={() => navigation.navigate('EscolhaCarro')}
          />
        ) : (
          projetos.map((item) => {
            const nomeCarro = nomesModelos[String(item.IdModelo)] || 'Carro';
            return (
              <View key={item.IdProjeto} style={styles.itemProjeto}>
                <MenuListItem
                  semCard
                  Icone={getEstiloVisual(item.Estilo).Icone}
                  titulo={item.Descricao || nomeCarro}
                  subtitulo={item.Descricao ? nomeCarro : undefined}
                  onPress={() => setIdProjeto(item.IdProjeto)}
                />
              </View>
            );
          })
        )}
      </ScreenContainer>
    );
  }

  // ---------- Resultado ----------
  const nomeCarroProjeto = [projeto?.NomeMontadora, projeto?.NomeModelo].filter(Boolean).join(' ');
  const tituloProjeto = projeto?.Descricao || nomeCarroProjeto || 'Seu projeto';
  const linhaCarro = projeto?.Descricao ? nomeCarroProjeto : null;
  const semPendentes = !carregando && !!projeto && todosServicos.length === 0;
  const semLocalizacao = statusLocalizacao === 'negada' || statusLocalizacao === 'erro';
  const mostrarContador = !carregando && !erro && selecionados?.length > 0 && oficinas.length > 0;

  function renderCabecalho() {
    return (
      <View>
        <Text style={[typography.overline, { color: colors.textSecondary }]}>Oficinas para</Text>
        <Text style={[typography.h1, styles.titulo, { color: colors.text }]} numberOfLines={2}>
          {tituloProjeto}
        </Text>
        {linhaCarro ? (
          <Text style={[typography.body, { color: colors.textSecondary }]} numberOfLines={1}>
            {linhaCarro}
          </Text>
        ) : null}

        {todosServicos.length > 0 ? (
          <View style={styles.blocoServicos}>
            <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>
              Serviços que você quer fazer
            </Text>
            <View style={styles.chips}>
              {todosServicos.map((s) => (
                <Chip
                  key={s.IdServico}
                  label={nomeServico(s)}
                  selected={!!selecionados?.includes(s.IdServico)}
                  onPress={() => alternarServico(s.IdServico)}
                />
              ))}
            </View>
            <Text style={[typography.caption, styles.dica, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              Toque para incluir ou tirar da busca.
            </Text>
          </View>
        ) : null}

        {semLocalizacao ? (
          <Text style={[typography.caption, styles.dica, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            Localização desativada: distâncias calculadas a partir do SENAC.
          </Text>
        ) : null}

        {mostrarContador ? (
          <Text style={[typography.overline, styles.contador, { color: colors.textSecondary }]}>
            {total} {total === 1 ? 'oficina encontrada' : 'oficinas encontradas'}
          </Text>
        ) : (
          <View style={styles.espaco} />
        )}

        {erro && oficinas.length > 0 ? <AvisoInline mensagem={erro} /> : null}
      </View>
    );
  }

  function renderVazio() {
    if (semPendentes) {
      return (
        <EmptyState
          compacto
          Icone={ListTodo}
          titulo="Nada pendente neste projeto"
          descricao="Todos os serviços estão concluídos ou a lista está vazia. Adicione serviços para buscar oficinas."
          acaoTitulo="Ver projeto"
          onAcao={() =>
            navigation.navigate('ProjetoDetalhe', {
              idProjeto,
              nomeCarro: tituloProjeto,
              nomeModelo: projeto?.NomeModelo,
            })
          }
        />
      );
    }
    if (carregando || (selecionados === null && !erro)) {
      return (
        <View>
          <OficinaCardSkeleton />
          <OficinaCardSkeleton />
        </View>
      );
    }
    if (erro) {
      return (
        <EmptyState
          compacto
          Icone={WifiOff}
          titulo="Não foi possível buscar"
          descricao={erro}
          acaoTitulo="Tentar novamente"
          onAcao={tentarDeNovo}
        />
      );
    }
    if (selecionados?.length === 0) {
      return (
        <EmptyState
          compacto
          Icone={SlidersHorizontal}
          titulo="Selecione ao menos um serviço"
          descricao="Toque nos serviços acima para incluir na busca."
        />
      );
    }
    return (
      <EmptyState
        compacto
        Icone={MapPinOff}
        titulo="Nenhuma oficina por perto"
        descricao="Nenhuma oficina da região faz esses serviços. Tente tirar algum da busca."
      />
    );
  }

  const mostrarLista = !carregando && !semPendentes;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.barraTopo, { paddingTop: insets.top + 4, paddingHorizontal: layout.screenPadding }]}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <FlatList
        data={mostrarLista ? oficinas : []}
        keyExtractor={(item) => String(item.IdOficina)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 12,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={renderCabecalho()}
        ListEmptyComponent={renderVazio()}
        ListFooterComponent={
          carregandoMais ? <ActivityIndicator color={colors.primary} style={styles.carregandoMais} /> : null
        }
        renderItem={({ item }) => (
          <OficinaCard
            oficina={item}
            fotoUrl={item.UrlLogo ? getUrlImagem(item.UrlLogo) : null}
            servicos={item.servicosAtendidos.map((s) => ({ IdServico: s.IdServico, Nome: nomeServico(s) }))}
            atendimento={{
              atendidos: item.quantidadeAtendida,
              total: item.totalServicos,
              faltantes: item.servicosFaltantes.map(nomeServico),
            }}
            onPress={() =>
              navigation.navigate('OficinaPerfil', {
                oficina: item,
                contextoProjeto: {
                  montadora: projeto?.NomeMontadora,
                  modelo: projeto?.NomeModelo,
                  servicos: item.servicosAtendidos.map(nomeServico),
                },
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  barraTopo: { paddingBottom: 4 },
  titulo: { marginTop: 4 },
  blocoServicos: { marginTop: 20 },
  secao: { marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  dica: { marginTop: 8 },
  contador: { marginTop: 20, marginBottom: 12 },
  espaco: { height: 16 },
  carregandoMais: { marginVertical: 16 },
  skeletonLinha: { marginBottom: 10 },
  itemProjeto: { marginBottom: 10 },
});