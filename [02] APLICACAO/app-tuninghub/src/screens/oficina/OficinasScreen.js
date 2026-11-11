import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SlidersHorizontal, ChevronDown, X, Search, MapPinOff, WifiOff, LocateOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useEstilos } from '../../context/EstilosContext';
import { buscarOficinas } from '../../api/oficina.api';
import { listarImagensDaOficina } from '../../api/imagem.api';
import { listarServicosDaOficina } from '../../api/oficinaServico.api';
import { listarMeusProjetos } from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { getUrlImagem } from '../../utils/media';
import { useLocalizacao } from '../../utils/useLocalizacao';
import { getEstiloVisual } from '../../constants/estilos';
import OficinaCard from '../../components/OficinaCard';
import OficinaCardSkeleton from '../../components/OficinaCardSkeleton';
import FiltroServicoModal from '../../components/FiltroServicoModal';
import QuickActionCard from '../../components/QuickActionCard';
import MenuAcoes from '../../components/MenuAcoes';
import EmptyState from '../../components/EmptyState';
import AvisoInline from '../../components/AvisoInline';

export default function OficinasScreen({ navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const { getNomeEstilo } = useEstilos();
  const insets = useSafeAreaInsets();
  const { coords, status: statusLocalizacao } = useLocalizacao();

  const [oficinas, setOficinas] = useState([]);
  const [extras, setExtras] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const [filtroAberto, setFiltroAberto] = useState(false);
  const [idServicoFiltro, setIdServicoFiltro] = useState(null);
  const [nomeServicoFiltro, setNomeServicoFiltro] = useState('');

  // Atalho "Buscar pelo meu projeto"
  const [projetos, setProjetos] = useState([]);
  const [nomesModelos, setNomesModelos] = useState({});
  const [escolhendoProjeto, setEscolhendoProjeto] = useState(false);

  async function carregar(idServico, silencioso = false) {
    if (!silencioso) setCarregando(true);
    try {
      const lista = await buscarOficinas({
        idServico,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setOficinas(lista);

      const entradas = await Promise.all(
        lista.map(async (of) => {
          try {
            const [imagens, servicos] = await Promise.all([
              listarImagensDaOficina(of.IdOficina),
              listarServicosDaOficina(of.IdOficina),
            ]);
            const logo = imagens.find((i) => i.TipoImagem === 'LOGO') || imagens[0];
            return [of.IdOficina, { fotoUrl: logo ? getUrlImagem(logo.UrlImagem) : null, servicos }];
          } catch {
            return [of.IdOficina, { fotoUrl: null, servicos: [] }];
          }
        })
      );
      setExtras(Object.fromEntries(entradas));
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  // Busca ao abrir e quando filtro/localização mudam (não a cada foco — puxe para atualizar)
  useEffect(() => {
    if (statusLocalizacao === 'carregando') return;
    carregar(idServicoFiltro);
  }, [idServicoFiltro, statusLocalizacao, coords]);

  // Modelos: só para nomear projetos sem apelido na escolha (carrega uma vez)
  useEffect(() => {
    listarTodosModelos()
      .then((lista) => {
        const mapa = {};
        lista.forEach((m) => {
          mapa[String(m.IdModelo ?? m.id)] = m.NomeModelo || m.Nome || m.nome || 'Carro';
        });
        setNomesModelos(mapa);
      })
      .catch(() => {});
  }, []);

  // Projetos mudam com frequência (criar/arquivar), então atualizam ao focar — é uma chamada leve
  useFocusEffect(
    useCallback(() => {
      listarMeusProjetos()
        .then(setProjetos)
        .catch(() => setProjetos([]));
    }, [])
  );

  function handleAtualizar() {
    setAtualizando(true);
    carregar(idServicoFiltro, true);
  }

  function selecionarFiltro(idServico, nomeServico) {
    setIdServicoFiltro(idServico);
    setNomeServicoFiltro(idServico ? nomeServico : '');
  }

  const nomeModeloDe = (p) => nomesModelos[String(p.IdModelo)] || 'Carro';
  const idDe = (p) => p.IdProjeto ?? p.id;

  function abrirBuscaDoProjeto(p) {
    navigation.navigate('OficinasPorProjeto', { idProjeto: idDe(p) });
  }

  function handleBuscarPorProjeto() {
    if (projetos.length === 1) {
      abrirBuscaDoProjeto(projetos[0]);
      return;
    }
    setEscolhendoProjeto(true);
  }

  const opcoesProjetos = projetos.map((p) => ({
    chave: String(idDe(p)),
    rotulo: p.Descricao || nomeModeloDe(p),
    descricao: p.Descricao ? nomeModeloDe(p) : p.Estilo ? getNomeEstilo(p.Estilo) : 'Personalizado',
    Icone: getEstiloVisual(p.Estilo).Icone,
    chevron: true,
    onPress: () => abrirBuscaDoProjeto(p),
  }));

  const semLocalizacao = statusLocalizacao === 'negada' || statusLocalizacao === 'erro';
  const filtroAtivo = !!idServicoFiltro;
  const n = oficinas.length;

  const subtitulo = carregando
    ? 'Buscando oficinas...'
    : `${n} ${n === 1 ? 'oficina' : 'oficinas'} perto ${semLocalizacao ? 'do SENAC' : 'de você'}`;

  function renderCabecalho() {
    return (
      <View>
        <Text style={[typography.h1, { color: colors.text }]}>Oficinas</Text>
        <Text style={[typography.body, styles.subtitulo, { color: colors.textSecondary }]}>{subtitulo}</Text>

        {semLocalizacao ? (
          <View
            style={[
              styles.localizacao,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
            ]}
          >
            <LocateOff size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[typography.caption, styles.flex, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              Localização desativada. Mostrando as oficinas mais perto do SENAC.
            </Text>
          </View>
        ) : null}

        {projetos.length > 0 ? (
          <QuickActionCard
            Icone={Search}
            titulo="Buscar pelo meu projeto"
            subtitulo="Oficinas que fazem o que falta no seu carro"
            onPress={handleBuscarPorProjeto}
          />
        ) : null}

        <View style={styles.filtros}>
          <Pressable
            onPress={() => setFiltroAberto(true)}
            accessibilityRole="button"
            accessibilityLabel="Filtrar por serviço"
            style={({ pressed }) => [
              styles.filtro,
              {
                borderRadius: radius.pill,
                borderColor: filtroAtivo ? colors.primary : colors.border,
                backgroundColor: filtroAtivo ? colors.primarySoft : colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <SlidersHorizontal size={16} color={filtroAtivo ? colors.primary : colors.text} strokeWidth={2.25} />
            <Text
              style={[
                styles.filtroTexto,
                { fontFamily: fonts.semibold, color: filtroAtivo ? colors.primary : colors.text },
              ]}
              numberOfLines={1}
            >
              {nomeServicoFiltro || 'Filtrar por serviço'}
            </Text>
            {!filtroAtivo ? <ChevronDown size={16} color={colors.textSecondary} /> : null}
          </Pressable>

          {filtroAtivo ? (
            <Pressable
              onPress={() => selecionarFiltro(null, '')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Limpar filtro"
              style={({ pressed }) => [
                styles.limpar,
                {
                  borderRadius: radius.pill,
                  borderColor: colors.border,
                  backgroundColor: pressed ? colors.border : colors.surface,
                },
              ]}
            >
              <X size={16} color={colors.text} strokeWidth={2.25} />
            </Pressable>
          ) : null}
        </View>

        {erro && oficinas.length > 0 ? <AvisoInline mensagem={erro} /> : null}
      </View>
    );
  }

  function renderVazio() {
    if (carregando) {
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
          descricao="Verifique sua conexão e tente de novo."
          acaoTitulo="Tentar novamente"
          onAcao={() => carregar(idServicoFiltro)}
        />
      );
    }
    return (
      <EmptyState
        compacto
        Icone={MapPinOff}
        titulo={filtroAtivo ? 'Nenhuma oficina com esse serviço' : 'Nenhuma oficina por perto'}
        descricao={
          filtroAtivo
            ? `Nenhuma oficina da região faz "${nomeServicoFiltro}" por enquanto.`
            : 'Ainda não há oficinas cadastradas na região.'
        }
        acaoTitulo={filtroAtivo ? 'Limpar filtro' : undefined}
        onAcao={filtroAtivo ? () => selecionarFiltro(null, '') : undefined}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={carregando ? [] : oficinas}
        keyExtractor={(item) => String(item.IdOficina)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: layout.screenPadding,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={handleAtualizar} tintColor={colors.primary} />
        }
        ListHeaderComponent={renderCabecalho()}
        ListEmptyComponent={renderVazio()}
        renderItem={({ item }) => (
          <OficinaCard
            oficina={item}
            fotoUrl={extras[item.IdOficina]?.fotoUrl}
            servicos={extras[item.IdOficina]?.servicos}
            onPress={() => navigation.navigate('OficinaPerfil', { oficina: item })}
          />
        )}
      />

      <FiltroServicoModal
        visivel={filtroAberto}
        onFechar={() => setFiltroAberto(false)}
        onSelecionar={selecionarFiltro}
        idServicoSelecionado={idServicoFiltro}
      />

      <MenuAcoes
        visivel={escolhendoProjeto}
        onFechar={() => setEscolhendoProjeto(false)}
        titulo="Escolha o projeto"
        subtitulo="Vamos buscar oficinas que fazem os serviços que faltam nele."
        opcoes={opcoesProjetos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  subtitulo: { marginTop: 4, marginBottom: 16 },
  localizacao: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, padding: 12, marginBottom: 16 },
  filtros: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 18 },
  filtro: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, paddingHorizontal: 14, height: 40, flexShrink: 1 },
  filtroTexto: { fontSize: 13.5, flexShrink: 1 },
  limpar: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});