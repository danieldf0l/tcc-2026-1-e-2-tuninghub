import { useEffect, useMemo, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { listarServicos } from '../../api/servico.api';
import { adicionarVariosItens } from '../../api/projetoServico.api';
import { getCategoriaInfo } from '../../constants/categoriasServico';
import { getErrorMessage } from '../../utils/errorHandler';
import ServicoCheckItem from '../../components/ServicoCheckItem';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdicionarServicoScreen({ route, navigation }) {
  const { idProjeto, idsJaAdicionados = [] } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [servicos, setServicos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
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
    const grupos = {};
    servicos.forEach((s) => {
      const chave = s.Categoria || 'OUTROS';
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(s);
    });

    return Object.entries(grupos).map(([categoria, itens]) => {
      const info = getCategoriaInfo(categoria);
      return {
        title: `${info.icone}  ${info.rotulo}`,
        data: itens,
      };
    });
  }, [servicos]);

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
      navigation.goBack();
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Adicionar serviços</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Escolha os itens que quer incluir na sua to-do list
      </Text>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item, index) => String(item.IdServico ?? index)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: colors.text }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => {
            const idServico = item.IdServico ?? item.id;
            const jaAdicionado = idsJaAdicionados.includes(idServico);
            return (
              <ServicoCheckItem
                nome={item.Nome || item.nome}
                selecionado={selecionados.includes(idServico)}
                jaAdicionado={jaAdicionado}
                onToggle={() => alternarSelecao(idServico)}
              />
            );
          }}
        />
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <Button
        title={selecionados.length > 0 ? `Adicionar (${selecionados.length})` : 'Selecione ao menos um item'}
        onPress={handleAdicionar}
        loading={salvando}
        disabled={selecionados.length === 0 || salvando}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  sectionHeader: { fontSize: 14, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  erro: { fontSize: 13, textAlign: 'center', marginVertical: 8 },
});