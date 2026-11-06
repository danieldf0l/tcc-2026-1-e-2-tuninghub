import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { buscarOficinasPorProjeto } from '../../api/oficina.api';
import { listarMeusProjetos } from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { getUrlImagem } from '../../utils/media';
import { useLocalizacao } from '../../utils/useLocalizacao';
import OficinaCard from '../../components/OficinaCard';
import BackButton from '../../components/BackButton';

const nomeServico = (s) => s.NomeServico || s.Nome || s.nome || 'Serviço';

export default function OficinasPorProjetoScreen({ route, navigation }) {
  const { colors } = useTheme();
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

  // ---------- Escolha do projeto ----------
  if (!idProjeto) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: colors.text }]}>Escolha o projeto</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Vamos buscar as oficinas que fazem os serviços que ainda faltam nele.
        </Text>

        {carregandoProjetos ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={projetos}
            keyExtractor={(item) => String(item.IdProjeto)}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}
            ListEmptyComponent={
              <Text style={[styles.vazio, { color: colors.textSecondary }]}>
                Você ainda não tem projetos ativos.
              </Text>
            }
            renderItem={({ item }) => {
              const nomeCarro = nomesModelos[String(item.IdModelo)] || 'Carro';
              return (
                <Pressable
                  onPress={() => setIdProjeto(item.IdProjeto)}
                  style={[styles.projetoItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.projetoNome, { color: colors.text }]} numberOfLines={1}>
                    {item.Descricao || nomeCarro}
                  </Text>
                  {item.Descricao ? (
                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{nomeCarro}</Text>
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
        {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
      </View>
    );
  }

  // ---------- Resultado ----------
  const tituloProjeto =
    projeto?.Descricao || [projeto?.NomeMontadora, projeto?.NomeModelo].filter(Boolean).join(' ') || 'Seu projeto';
  const semPendentes = !carregando && projeto && todosServicos.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Oficinas para o projeto</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {tituloProjeto}
        {!carregando && selecionados?.length ? ` · ${total} ${total === 1 ? 'oficina' : 'oficinas'}` : ''}
      </Text>

      {todosServicos.length > 0 ? (
        <>
          <Text style={[styles.secao, { color: colors.textSecondary }]}>SERVIÇOS QUE VOCÊ QUER FAZER</Text>
          <View style={styles.chips}>
            {todosServicos.map((s) => {
              const ativo = selecionados?.includes(s.IdServico);
              return (
                <Pressable
                  key={s.IdServico}
                  onPress={() => alternarServico(s.IdServico)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: ativo ? colors.primary : colors.surface,
                      borderColor: ativo ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipTexto, { color: ativo ? colors.background : colors.text }]}>
                    {nomeServico(s)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {semPendentes ? (
        <Text style={[styles.vazio, { color: colors.textSecondary }]}>
          Este projeto não tem serviços pendentes. Adicione serviços na lista do projeto para buscar oficinas.
        </Text>
      ) : carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={oficinas}
          keyExtractor={(item) => String(item.IdOficina)}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          onEndReached={carregarMais}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            erro ? null : (
              <Text style={[styles.vazio, { color: colors.textSecondary }]}>
                {selecionados?.length === 0
                  ? 'Selecione ao menos um serviço.'
                  : 'Nenhuma oficina atende esses serviços por perto.'}
              </Text>
            )
          }
          ListFooterComponent={
            carregandoMais ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : null
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
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 4 },
  secao: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginTop: 20, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8 },
  chipTexto: { fontSize: 13, fontWeight: '700' },
  vazio: { textAlign: 'center', marginTop: 40, lineHeight: 20 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  projetoItem: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  projetoNome: { fontSize: 16, fontWeight: '800' },
});