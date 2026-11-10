import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, LayoutAnimation, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoreHorizontal, Plus, MapPin, Pencil, Archive, Trash2, ListTodo } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useEstilos } from '../../context/EstilosContext';
import { useToast } from '../../context/ToastContext';
import {
  listarItensDoProjeto,
  marcarConcluido,
  adicionarVariosItens,
  removerItemDoProjeto,
} from '../../api/projetoServico.api';
import {
  listarMeusProjetos,
  arquivarProjeto,
  desarquivarProjeto,
  atualizarDescricaoProjeto,
} from '../../api/projeto.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { ehErroLimiteArquivados, avisarLimiteArquivados } from '../../utils/limitesProjeto';
import { getEstiloVisual } from '../../constants/estilos';
import BackButton from '../../components/BackButton';
import ChecklistItem from '../../components/ChecklistItem';
import SwipeAcao from '../../components/SwipeAcao';
import QuickActionCard from '../../components/QuickActionCard';
import MenuAcoes from '../../components/MenuAcoes';
import DialogoTexto from '../../components/DialogoTexto';
import EmptyState from '../../components/EmptyState';
import AvisoInline from '../../components/AvisoInline';
import Skeleton from '../../components/Skeleton';

const nomeDoItem = (i) => i.NomeServico || i.nomeServico || i.Nome || i.nome || i.Servico?.Nome || 'Serviço';

export default function ProjetoDetalheScreen({ route, navigation }) {
  const { idProjeto, nomeCarro, nomeModelo } = route.params;
  const { colors, fonts, typography, layout, radius } = useTheme();
  const { getNomeEstilo } = useEstilos();
  const { mostrar } = useToast();
  const insets = useSafeAreaInsets();

  const [projeto, setProjeto] = useState(null);
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const [renomeando, setRenomeando] = useState(false);
  const [salvandoNome, setSalvandoNome] = useState(false);

  async function carregar() {
    try {
      const [lista, meusProjetos] = await Promise.all([listarItensDoProjeto(idProjeto), listarMeusProjetos()]);
      setItens(lista);
      setProjeto(meusProjetos.find((p) => String(p.IdProjeto ?? p.id) === String(idProjeto)) || null);
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
    }, [idProjeto])
  );

  function handleAtualizar() {
    setAtualizando(true);
    carregar();
  }

  // ---------- To-do list ----------

  async function alternarConcluido(idServico, valorAtual) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItens((prev) => prev.map((i) => (i.IdServico === idServico ? { ...i, Concluido: !valorAtual } : i)));
    try {
      await marcarConcluido(idProjeto, idServico, !valorAtual);
    } catch (e) {
      mostrar(getErrorMessage(e), 'erro');
      setItens((prev) => prev.map((i) => (i.IdServico === idServico ? { ...i, Concluido: valorAtual } : i)));
    }
  }

  async function desfazerRemocao(idServico, estavaConcluido) {
    try {
      await adicionarVariosItens(idProjeto, [idServico]);
      if (estavaConcluido) await marcarConcluido(idProjeto, idServico, true);
      carregar();
    } catch (e) {
      mostrar(getErrorMessage(e), 'erro');
    }
  }

  async function removerItem(item) {
    const idServico = item.IdServico;
    const estavaConcluido = !!item.Concluido;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItens((prev) => prev.filter((i) => i.IdServico !== idServico));

    try {
      await removerItemDoProjeto(idProjeto, idServico);
      mostrar(`"${nomeDoItem(item)}" removido da lista.`, 'sucesso', {
        acao: { titulo: 'Desfazer', onPress: () => desfazerRemocao(idServico, estavaConcluido) },
      });
      return true;
    } catch (e) {
      carregar();
      mostrar(getErrorMessage(e), 'erro');
      return false;
    }
  }

  function irParaAdicionarServico() {
    const idsJaAdicionados = itens.map((i) => i.IdServico);
    navigation.navigate('AdicionarServico', { idProjeto, idsJaAdicionados });
  }

  // ---------- Menu "⋯" ----------

  async function desfazerArquivamento() {
    try {
      await desarquivarProjeto(idProjeto);
      mostrar('Projeto restaurado.');
      navigation.navigate('ProjetoDetalhe', { idProjeto, nomeCarro, nomeModelo });
    } catch (e) {
      mostrar(getErrorMessage(e), 'erro');
    }
  }

  async function arquivar() {
    try {
      await arquivarProjeto(idProjeto);
      navigation.goBack();
      mostrar('Projeto arquivado.', 'sucesso', { acao: { titulo: 'Desfazer', onPress: desfazerArquivamento } });
    } catch (e) {
      const mensagem = getErrorMessage(e);
      if (ehErroLimiteArquivados(mensagem)) {
        avisarLimiteArquivados(navigation);
      } else {
        mostrar(mensagem, 'erro');
      }
    }
  }

  async function salvarNome(valor) {
    const descricao = (valor || '').trim();
    setSalvandoNome(true);
    try {
      await atualizarDescricaoProjeto(idProjeto, descricao);
      setProjeto((prev) => (prev ? { ...prev, Descricao: descricao || null } : prev));
      setRenomeando(false);
      mostrar(descricao ? 'Nome atualizado.' : 'Apelido removido.');
    } catch (e) {
      mostrar(getErrorMessage(e), 'erro');
    } finally {
      setSalvandoNome(false);
    }
  }

  const opcoesMenu = [
    {
      chave: 'renomear',
      rotulo: 'Renomear projeto',
      descricao: 'Dê um apelido para encontrar mais fácil',
      Icone: Pencil,
      onPress: () => setRenomeando(true),
    },
    {
      chave: 'arquivar',
      rotulo: 'Arquivar projeto',
      descricao: 'Sai da sua lista e libera uma vaga. Dá para desfazer.',
      Icone: Archive,
      onPress: arquivar,
    },
  ];

  // ---------- Dados derivados ----------

  // Pendentes primeiro, concluídos no fim (como apps de tarefas)
  const itensOrdenados = useMemo(
    () => [...itens.filter((i) => !i.Concluido), ...itens.filter((i) => !!i.Concluido)],
    [itens]
  );

  const total = itens.length;
  const concluidos = itens.filter((i) => !!i.Concluido).length;
  const pendentes = total - concluidos;
  const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  const completo = total > 0 && pendentes === 0;

  const titulo = projeto?.Descricao || nomeModelo || (projeto ? 'Projeto' : nomeCarro) || 'Projeto';
  const subtituloCarro = projeto?.Descricao && nomeModelo ? nomeModelo : null;
  const nomeEstilo = projeto ? (projeto.Estilo ? getNomeEstilo(projeto.Estilo) : 'Personalizado') : null;
  const visual = getEstiloVisual(projeto?.Estilo);

  function renderCabecalho() {
    return (
      <View>
        <Text style={[typography.h1, { color: colors.text }]} numberOfLines={2}>
          {titulo}
        </Text>

        {subtituloCarro || nomeEstilo ? (
          <View style={styles.meta}>
            {subtituloCarro ? (
              <Text style={[typography.body, styles.metaCarro, { color: colors.textSecondary }]} numberOfLines={1}>
                {subtituloCarro}
              </Text>
            ) : null}
            {nomeEstilo ? (
              <View
                style={[
                  styles.estiloChip,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill },
                ]}
              >
                <View style={[styles.estiloPonto, { backgroundColor: visual.cor }]} />
                <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
                  {nomeEstilo}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {erro ? (
          <View style={styles.erro}>
            <AvisoInline mensagem={erro} />
          </View>
        ) : null}

        {!carregando && total > 0 ? (
          <View
            style={[
              styles.progresso,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
            ]}
          >
            <View style={styles.progressoTopo}>
              <Text style={[typography.overline, { color: colors.textSecondary }]}>Progresso</Text>
              <Text
                style={[styles.percentual, { fontFamily: fonts.bold, color: completo ? colors.success : colors.text }]}
              >
                {percentual}%
              </Text>
            </View>
            <View style={[styles.barraFundo, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barra,
                  { width: `${percentual}%`, backgroundColor: completo ? colors.success : colors.primary },
                ]}
              />
            </View>
            <Text style={[typography.caption, styles.resumo, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {concluidos} de {total} {total === 1 ? 'serviço concluído' : 'serviços concluídos'}
            </Text>
          </View>
        ) : null}

        {!carregando && pendentes > 0 ? (
          <QuickActionCard
            Icone={MapPin}
            titulo="Encontrar oficinas"
            subtitulo={pendentes === 1 ? 'Que fazem o serviço pendente' : `Que fazem os ${pendentes} serviços pendentes`}
            onPress={() => navigation.navigate('OficinasPorProjeto', { idProjeto })}
          />
        ) : null}

        {completo ? <AvisoInline tipo="sucesso" mensagem="Projeto completo! Todos os serviços foram concluídos." /> : null}

        <View style={styles.secaoTopo}>
          <Text style={[typography.overline, { color: colors.textSecondary }]}>
            {total > 0 ? `Lista de serviços · ${total}` : 'Lista de serviços'}
          </Text>
          <Pressable
            onPress={irParaAdicionarServico}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Adicionar serviços"
            style={({ pressed }) => [
              styles.botaoMais,
              { backgroundColor: colors.primary, borderRadius: radius.pill, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Plus size={20} color={colors.textOnPrimary} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Barra fina fixa: só voltar e menu — o resto rola */}
      <View style={[styles.barraTopo, { paddingTop: insets.top + 4, paddingHorizontal: layout.screenPadding }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Pressable
          onPress={() => setMenuAberto(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Mais opções do projeto"
          style={({ pressed }) => [
            styles.botaoRedondo,
            {
              borderRadius: radius.pill,
              borderColor: colors.border,
              backgroundColor: pressed ? colors.border : colors.surface,
            },
          ]}
        >
          <MoreHorizontal size={20} color={colors.text} strokeWidth={2.25} />
        </Pressable>
      </View>

      <FlatList
        data={carregando ? [] : itensOrdenados}
        keyExtractor={(item, index) => String(item.IdServico ?? index)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 12,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={handleAtualizar} tintColor={colors.primary} />
        }
        ListHeaderComponent={renderCabecalho()}
        ListEmptyComponent={
          carregando ? (
            <View>
              <Skeleton height={56} borderRadius={radius.md} style={styles.skeleton} />
              <Skeleton height={56} borderRadius={radius.md} style={styles.skeleton} />
              <Skeleton height={56} borderRadius={radius.md} style={styles.skeleton} />
            </View>
          ) : (
            <EmptyState
              compacto
              Icone={ListTodo}
              titulo="Lista vazia"
              descricao="Adicione os serviços que você quer fazer no carro."
              acaoTitulo="Adicionar serviços"
              onAcao={irParaAdicionarServico}
            />
          )
        }
        ListFooterComponent={
          total > 0 ? (
            <Text style={[typography.caption, styles.dica, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              Arraste um serviço para a esquerda para remover.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <SwipeAcao
            style={styles.itemLista}
            raio={radius.md}
            rotulo="Remover"
            Icone={Trash2}
            cor={colors.danger}
            onAcao={() => removerItem(item)}
          >
            <ChecklistItem
              style={styles.semMargem}
              titulo={nomeDoItem(item)}
              concluido={!!item.Concluido}
              onToggle={() => alternarConcluido(item.IdServico, !!item.Concluido)}
            />
          </SwipeAcao>
        )}
      />

      <MenuAcoes
        visivel={menuAberto}
        onFechar={() => setMenuAberto(false)}
        titulo={titulo}
        opcoes={opcoesMenu}
      />

      <DialogoTexto
        visivel={renomeando}
        titulo="Renomear projeto"
        descricao="Deixe em branco para voltar a usar o nome do carro."
        valorInicial={projeto?.Descricao || ''}
        placeholder="Ex.: Golf de pista"
        onConfirmar={salvarNome}
        onCancelar={() => setRenomeando(false)}
        carregando={salvandoNome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  barraTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 },
  botaoRedondo: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  metaCarro: { flexShrink: 1 },
  estiloChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  estiloPonto: { width: 8, height: 8, borderRadius: 4 },
  erro: { marginTop: 16 },
  progresso: { borderWidth: 1, padding: 16, marginTop: 20, marginBottom: 12 },
  progressoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  percentual: { fontSize: 15 },
  barraFundo: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barra: { height: 8, borderRadius: 4 },
  resumo: { marginTop: 8 },
  secaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 12 },
  botaoMais: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  skeleton: { marginBottom: 10 },
  itemLista: { marginBottom: 10 },
  semMargem: { marginBottom: 0 },
  dica: { textAlign: 'center', marginTop: 6 },
});