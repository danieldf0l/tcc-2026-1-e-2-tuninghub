import { useCallback, useMemo, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { listarServicos } from '../../../api/servico.api';
import {
  listarServicosDaOficina,
  vincularServico,
  desvincularServico,
} from '../../../api/oficinaServico.api';
import { getCategoriaInfo } from '../../../constants/categoriasServico';
import { getErrorMessage } from '../../../utils/errorHandler';
import ServicoCheckItem from '../../../components/ServicoCheckItem';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

export default function MeusServicosScreen() {
  const { colors } = useTheme();
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
  const [sucesso, setSucesso] = useState('');

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

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [idOficina])
  );

  const secoes = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const grupos = {};

    catalogo.forEach((s) => {
      if (termo && !s.Nome.toLowerCase().includes(termo)) return;
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
        icone: info.icone,
        aberta,
        data: aberta ? itens : [],
        total: itens.length,
      };
    });
  }, [catalogo, busca, categoriasAbertas]);

  function alternarCategoria(chave) {
    setCategoriasAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));
  }

  function alternarSelecao(idServico) {
    setSucesso('');
    setSelecionados((prev) =>
      prev.includes(idServico) ? prev.filter((id) => id !== idServico) : [...prev, idServico]
    );
  }

  const houveMudanca = useMemo(() => {
    if (selecionados.length !== vinculadosOriginal.length) return true;
    const setOriginal = new Set(vinculadosOriginal);
    return selecionados.some((id) => !setOriginal.has(id));
  }, [selecionados, vinculadosOriginal]);

  async function handleSalvar() {
    setErro('');
    setSucesso('');
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
      setSucesso('Serviços atualizados com sucesso.');
    } catch (e) {
      setErro(getErrorMessage(e));
      // Em caso de falha parcial, recarrega do servidor para refletir o estado real
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Meus Serviços</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {vinculadosOriginal.length} {vinculadosOriginal.length === 1 ? 'serviço oferecido' : 'serviços oferecidos'}
      </Text>

      <Input placeholder="Buscar serviço..." value={busca} onChangeText={setBusca} />

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => String(item.IdServico)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderSectionHeader={({ section }) => (
            <Pressable
              onPress={() => alternarCategoria(section.key)}
              style={[styles.sectionHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.sectionTitulo, { color: colors.text }]}>
                {section.icone}  {section.title}
              </Text>
              <View style={styles.sectionDireita}>
                <Text style={[styles.sectionContador, { color: colors.textSecondary }]}>
                  {section.total}
                </Text>
                <ChevronDown
                  size={18}
                  color={colors.textSecondary}
                  style={{ transform: [{ rotate: section.aberta ? '180deg' : '0deg' }] }}
                />
              </View>
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

      {erro ? <Text style={[styles.mensagem, { color: colors.danger }]}>{erro}</Text> : null}
      {sucesso ? <Text style={[styles.mensagem, { color: colors.primary }]}>{sucesso}</Text> : null}

      {houveMudanca ? (
        <View style={[styles.rodape, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button title="Salvar alterações" onPress={handleSalvar} loading={salvando} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitulo: { fontSize: 14.5, fontWeight: '800' },
  sectionDireita: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionContador: { fontSize: 12, fontWeight: '600' },
  mensagem: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  rodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
});