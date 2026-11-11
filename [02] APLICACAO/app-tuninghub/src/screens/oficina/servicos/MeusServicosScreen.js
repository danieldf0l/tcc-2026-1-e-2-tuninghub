import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Search, SearchX } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { listarServicos } from '../../../api/servico.api';
import {
  listarServicosDaOficina,
  vincularServico,
  desvincularServico,
} from '../../../api/oficinaServico.api';
import { getCategoriaInfo } from '../../../constants/categoriasServico';
import { getErrorMessage } from '../../../utils/errorHandler';
import ServicoCheckItem from '../../../components/ServicoCheckItem';
import AvisoInline from '../../../components/AvisoInline';
import EmptyState from '../../../components/EmptyState';
import Skeleton from '../../../components/Skeleton';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const normalizar = (t) =>
  (t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function MeusServicosScreen() {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { mostrar } = useToast();
  const { usuario } = useAuth();
  const idOficina = usuario?.IdOficina;

  const [catalogo, setCatalogo] = useState([]);
  const [vinculadosOriginal, setVinculadosOriginal] = useState([]); // baseline do servidor
  const [selecionados, setSelecionados] = useState([]); // estado local, ainda não salvo

  const [busca, setBusca] = useState('');
  const [categoriasAbertas, setCategoriasAbertas] = useState({});

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const [todosServicos, meusServicos] = await Promise.all([
        listarServicos(),
        listarServicosDaOficina(idOficina),
      ]);
      const ids = meusServicos.map((s) => s.IdServico);
      setCatalogo(todosServicos);
      setVinculadosOriginal(ids);
      setSelecionados(ids);
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }

  const houveMudanca = useMemo(() => {
    if (selecionados.length !== vinculadosOriginal.length) return true;
    const setOriginal = new Set(vinculadosOriginal);
    return selecionados.some((id) => !setOriginal.has(id));
  }, [selecionados, vinculadosOriginal]);

  // Ref para o foco enxergar o valor atual sem recriar o callback
  const houveMudancaRef = useRef(false);
  useEffect(() => {
    houveMudancaRef.current = houveMudanca;
  }, [houveMudanca]);

  // Ao voltar para a aba, recarrega — mas nunca por cima de alterações não salvas
  useFocusEffect(
    useCallback(() => {
      if (!houveMudancaRef.current) carregar();
    }, [idOficina])
  );

  const secoes = useMemo(() => {
    const termo = normalizar(busca);
    const marcados = new Set(selecionados);
    const grupos = {};

    catalogo.forEach((s) => {
      if (termo && !normalizar(s.Nome).includes(termo)) return;
      const chave = s.Categoria || 'OUTROS';
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(s);
    });

    return Object.entries(grupos).map(([categoria, itens]) => {
      const info = getCategoriaInfo(categoria);
      const aberta = !!termo || !!categoriasAbertas[categoria];
      return {
        key: categoria,
        title: info.rotulo,
        Icone: info.Icone,
        aberta,
        data: aberta ? itens : [],
        total: itens.length,
        marcados: itens.filter((i) => marcados.has(i.IdServico)).length,
      };
    });
  }, [catalogo, busca, categoriasAbertas, selecionados]);

  function alternarCategoria(chave) {
    setCategoriasAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));
  }

  function alternarSelecao(idServico) {
    setSelecionados((prev) =>
      prev.includes(idServico) ? prev.filter((id) => id !== idServico) : [...prev, idServico]
    );
  }

  function descartar() {
    setSelecionados(vinculadosOriginal);
  }

  async function handleSalvar() {
    setErro('');
    setSalvando(true);

    const setOriginal = new Set(vinculadosOriginal);
    const setNovo = new Set(selecionados);

    const paraAdicionar = selecionados.filter((id) => !setOriginal.has(id));
    const paraRemover = vinculadosOriginal.filter((id) => !setNovo.has(id));

    try {
      await Promise.all([
        ...paraAdicionar.map((id) => vincularServico(id)),
        ...paraRemover.map((id) => desvincularServico(idOficina, id)),
      ]);
      setVinculadosOriginal(selecionados);
      mostrar('Serviços atualizados.');
    } catch (e) {
      setErro(getErrorMessage(e));
      // Em caso de falha parcial, recarrega do servidor para refletir o estado real
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  const qtdAlteracoes = useMemo(() => {
    const setOriginal = new Set(vinculadosOriginal);
    const setNovo = new Set(selecionados);
    return (
      selecionados.filter((id) => !setOriginal.has(id)).length +
      vinculadosOriginal.filter((id) => !setNovo.has(id)).length
    );
  }, [selecionados, vinculadosOriginal]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingHorizontal: layout.screenPadding },
      ]}
    >
      <Text style={[typography.h1, { color: colors.text }]}>Meus serviços</Text>
      <Text style={[typography.body, styles.subtitulo, { color: colors.textSecondary }]}>
        {vinculadosOriginal.length} {vinculadosOriginal.length === 1 ? 'serviço oferecido' : 'serviços oferecidos'}
      </Text>

      <Input
        Icone={Search}
        placeholder="Buscar serviço"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
      />

      <AvisoInline mensagem={erro} />

      {carregando ? (
        <View>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={54} borderRadius={radius.md} style={styles.skeleton} />
          ))}
        </View>
      ) : (
        <SectionList
          style={styles.lista}
          sections={secoes}
          keyExtractor={(item) => String(item.IdServico)}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaConteudo}
          ListEmptyComponent={
            busca ? (
              <EmptyState compacto Icone={SearchX} titulo="Nenhum serviço encontrado" descricao={`Não achamos nada para "${busca}".`} />
            ) : null
          }
          renderSectionHeader={({ section }) => (
            <Pressable
              onPress={() => alternarCategoria(section.key)}
              accessibilityRole="button"
              accessibilityState={{ expanded: section.aberta }}
              style={({ pressed }) => [
                styles.secao,
                {
                  backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <View style={[styles.secaoIcone, { backgroundColor: colors.surfaceElevated, borderRadius: radius.sm }]}>
                <section.Icone size={16} color={colors.text} strokeWidth={2.25} />
              </View>
              <Text style={[typography.bodyStrong, styles.flex, { color: colors.text }]}>{section.title}</Text>
              <Text
                style={[
                  styles.secaoContador,
                  { fontFamily: fonts.bold, color: section.marcados > 0 ? colors.primary : colors.textSecondary },
                ]}
              >
                {section.marcados}/{section.total}
              </Text>
              <ChevronDown
                size={18}
                color={colors.textSecondary}
                style={{ transform: [{ rotate: section.aberta ? '180deg' : '0deg' }] }}
              />
            </Pressable>
          )}
          renderItem={({ item }) => (
            <ServicoCheckItem
              nome={item.Nome}
              selecionado={selecionados.includes(item.IdServico)}
              onToggle={() => alternarSelecao(item.IdServico)}
            />
          )}
        />
      )}

      {houveMudanca ? (
        <View style={[styles.rodape, { borderTopColor: colors.border }]}>
          <View style={styles.rodapeDescartar}>
            <Button title="Descartar" variant="ghost" onPress={descartar} disabled={salvando} />
          </View>
          <View style={styles.rodapeSalvar}>
            <Button
              title={`Salvar (${qtdAlteracoes})`}
              onPress={handleSalvar}
              loading={salvando}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  subtitulo: { marginTop: 4, marginBottom: 16 },
  skeleton: { marginBottom: 10 },
  lista: { flex: 1 },
  listaConteudo: { paddingBottom: 16, flexGrow: 1 },
  secao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  secaoIcone: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  secaoContador: { fontSize: 12.5 },
  rodape: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rodapeDescartar: { flex: 1 },
  rodapeSalvar: { flex: 2 },
});