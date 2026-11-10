import { useEffect, useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { Search, SearchX } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { listarServicos } from '../../api/servico.api';
import { adicionarVariosItens } from '../../api/projetoServico.api';
import { getCategoriaInfo } from '../../constants/categoriasServico';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import ServicoCheckItem from '../../components/ServicoCheckItem';
import AvisoInline from '../../components/AvisoInline';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import Input from '../../components/Input';
import Button from '../../components/Button';

// Busca sem diferenciar acento nem maiúscula ("suspensao" encontra "Suspensão")
const normalizar = (t) =>
  (t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function AdicionarServicoScreen({ route, navigation }) {
  const { idProjeto, idsJaAdicionados = [] } = route.params;
  const { colors, typography, radius } = useTheme();
  const { mostrar } = useToast();

  const [servicos, setServicos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await listarServicos();
        setServicos(lista);
      } catch (e) {
        setErro(getErrorMessage(e));
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const secoes = useMemo(() => {
    const termo = normalizar(busca);
    const grupos = {};

    servicos
      .filter((s) => !termo || normalizar(s.Nome || s.nome).includes(termo))
      .forEach((s) => {
        const chave = s.Categoria || 'OUTROS';
        if (!grupos[chave]) grupos[chave] = [];
        grupos[chave].push(s);
      });

    return Object.entries(grupos).map(([categoria, itens]) => {
      const info = getCategoriaInfo(categoria);
      return { title: info.rotulo, Icone: info.Icone, data: itens };
    });
  }, [servicos, busca]);

  function alternarSelecao(idServico) {
    setSelecionados((prev) =>
      prev.includes(idServico) ? prev.filter((id) => id !== idServico) : [...prev, idServico]
    );
  }

  async function handleAdicionar() {
    if (selecionados.length === 0) return;
    setErro('');
    setSalvando(true);
    try {
      await adicionarVariosItens(idProjeto, selecionados);
      const n = selecionados.length;
      navigation.goBack();
      mostrar(`${n} ${n === 1 ? 'serviço adicionado' : 'serviços adicionados'} à lista.`);
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  }

  const n = selecionados.length;

  const rodape = (
    <>
      <AvisoInline mensagem={erro} />
      <Button
        title={n > 0 ? `Adicionar ${n} ${n === 1 ? 'serviço' : 'serviços'}` : 'Selecione os serviços'}
        onPress={handleAdicionar}
        loading={salvando}
        disabled={n === 0 || salvando}
      />
    </>
  );

  return (
    <ScreenContainer scroll={false} rodape={rodape}>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        titulo="Adicionar serviços"
        subtitulo="Escolha o que você quer incluir na lista do projeto."
      />

      <Input
        Icone={Search}
        placeholder="Buscar serviço"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
      />

      {carregando ? (
        <View>
          <Skeleton width={120} height={12} style={styles.skeletonTitulo} />
          <Skeleton height={54} borderRadius={radius.md} style={styles.skeleton} />
          <Skeleton height={54} borderRadius={radius.md} style={styles.skeleton} />
          <Skeleton height={54} borderRadius={radius.md} style={styles.skeleton} />
        </View>
      ) : (
        <SectionList
          style={styles.lista}
          sections={secoes}
          keyExtractor={(item, index) => String(item.IdServico ?? index)}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaConteudo}
          ListEmptyComponent={
            busca ? (
              <EmptyState
                compacto
                Icone={SearchX}
                titulo="Nenhum serviço encontrado"
                descricao={`Não achamos nada para "${busca}".`}
              />
            ) : null
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.secao}>
              <section.Icone size={15} color={colors.textSecondary} strokeWidth={2.25} />
              <Text style={[typography.overline, { color: colors.textSecondary }]}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const idServico = item.IdServico ?? item.id;
            return (
              <ServicoCheckItem
                nome={item.Nome || item.nome}
                selecionado={selecionados.includes(idServico)}
                jaAdicionado={idsJaAdicionados.includes(idServico)}
                onToggle={() => alternarSelecao(idServico)}
              />
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lista: { flex: 1 },
  listaConteudo: { paddingBottom: 12, flexGrow: 1 },
  secao: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 10 },
  skeletonTitulo: { marginBottom: 12, marginTop: 8 },
  skeleton: { marginBottom: 10 },
});