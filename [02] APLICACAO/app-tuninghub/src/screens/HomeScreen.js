import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, MapPin, ListTodo } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { listarMeusProjetos } from '../api/projeto.api';
import { listarTodosModelos } from '../api/modelo.api';
import { listarItensDoProjeto } from '../api/projetoServico.api';
import { getSaudacao } from '../utils/saudacao';
import StatCard from '../components/StatCard';
import QuickActionCard from '../components/QuickActionCard';
import ProjetoCard from '../components/ProjetoCard';
import ProjetoCardSkeleton from '../components/ProjetoCardSkeleton';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const LIMITE_PROJETOS = 3;

function TituloSecao({ titulo, acao, onAcao }) {
  const { colors, typography, fonts } = useTheme();
  return (
    <View style={styles.tituloSecao}>
      <Text style={[typography.h3, { color: colors.text }]}>{titulo}</Text>
      {acao ? (
        <Pressable onPress={onAcao} hitSlop={8}>
          <Text style={[typography.caption, { color: colors.primary, fontFamily: fonts.semibold }]}>{acao}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();

  const [projetos, setProjetos] = useState([]);
  const [nomesModelos, setNomesModelos] = useState({});
  const [progressos, setProgressos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

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
            return [idProjeto, { concluidos: itens.filter((i) => !!i.Concluido).length, total: itens.length }];
          } catch {
            return [idProjeto, { concluidos: 0, total: 0 }];
          }
        })
      );
      setProgressos(Object.fromEntries(entradas));
    } catch {
      // Home é um resumo — se algo falhar aqui, deixamos os atalhos funcionando mesmo assim
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

  const primeiroNome = (usuario?.Nome || usuario?.nome || 'Entusiasta').split(' ')[0];
  const totalPendentes = Object.values(progressos).reduce((soma, p) => soma + (p.total - p.concluidos), 0);

  const projetoMaisRecente = [...projetos].sort((a, b) => {
    const dataA = new Date(a.DataAtualizacao || a.DataCriacao || 0);
    const dataB = new Date(b.DataAtualizacao || b.DataCriacao || 0);
    return dataB - dataA;
  })[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={handleAtualizar} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.headerTextos}>
          <Text style={[typography.body, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
            {getSaudacao()},
          </Text>
          <Text style={[typography.h1, { color: colors.text }]} numberOfLines={1}>
            {primeiroNome}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('PerfilTab')}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          style={({ pressed }) => [
            styles.avatar,
            { backgroundColor: colors.primary, borderRadius: radius.pill, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.avatarTexto, { color: colors.textOnPrimary, fontFamily: fonts.extrabold }]}>
            {primeiroNome.charAt(0).toUpperCase()}
          </Text>
        </Pressable>
      </View>

      {carregando ? (
        <>
          <View style={styles.statsRow}>
            <Skeleton height={112} borderRadius={radius.lg} style={styles.flex} />
            <View style={styles.gap} />
            <Skeleton height={112} borderRadius={radius.lg} style={styles.flex} />
          </View>
          <View style={styles.secao}>
            <Skeleton width={180} height={20} style={styles.skeletonTitulo} />
            <ProjetoCardSkeleton />
          </View>
        </>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard valor={`${projetos.length}/${LIMITE_PROJETOS}`} rotulo="Projetos ativos" Icone={Car} />
            <View style={styles.gap} />
            <StatCard
              valor={totalPendentes}
              rotulo="Serviços pendentes"
              destaque={totalPendentes > 0}
              Icone={ListTodo}
            />
          </View>

          {projetoMaisRecente ? (
            <View style={styles.secao}>
              <TituloSecao
                titulo="Continue de onde parou"
                acao="Ver todos"
                onAcao={() => navigation.navigate('ProjetosTab')}
              />
              <ProjetoCard
                nome={projetoMaisRecente.Descricao}
                nomeCarro={nomesModelos[String(projetoMaisRecente.IdModelo)] || 'Carro'}
                estilo={projetoMaisRecente.Estilo}
                progresso={progressos[projetoMaisRecente.IdProjeto ?? projetoMaisRecente.id]}
                onPress={() =>
                  navigation.navigate('ProjetoDetalhe', {
                    idProjeto: projetoMaisRecente.IdProjeto ?? projetoMaisRecente.id,
                    nomeCarro:
                      projetoMaisRecente.Descricao ||
                      nomesModelos[String(projetoMaisRecente.IdModelo)] ||
                      'Carro',
                  })
                }
              />
            </View>
          ) : (
            <View
              style={[
                styles.vazioCard,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
              ]}
            >
              <EmptyState
                compacto
                Icone={Car}
                titulo="Comece seu primeiro projeto"
                descricao="Escolha seu carro e monte a lista de customização."
                acaoTitulo="Criar projeto"
                onAcao={() => navigation.navigate('EscolhaCarro')}
              />
            </View>
          )}
        </>
      )}

      <View style={styles.secao}>
        <TituloSecao titulo="Explorar" />
        <QuickActionCard
          Icone={Car}
          titulo="Meus projetos"
          subtitulo="Veja e gerencie suas customizações"
          onPress={() => navigation.navigate('ProjetosTab')}
        />
        <QuickActionCard
          Icone={MapPin}
          titulo="Oficinas próximas"
          subtitulo="Encontre onde executar seus serviços"
          onPress={() => navigation.navigate('OficinasTab')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { width: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTextos: { flex: 1, marginRight: 12 },
  avatar: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontSize: 18 },
  statsRow: { flexDirection: 'row', marginBottom: 28 },
  secao: { marginBottom: 28 },
  tituloSecao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  skeletonTitulo: { marginBottom: 12 },
  vazioCard: { borderWidth: 1, marginBottom: 28 },
});