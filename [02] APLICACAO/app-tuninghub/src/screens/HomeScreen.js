import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Car, MapPin, Wrench, ListTodo } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { listarMeusProjetos } from '../api/projeto.api';
import { listarTodosModelos } from '../api/modelo.api';
import { listarItensDoProjeto } from '../api/projetoServico.api';
import { getSaudacao } from '../utils/saudacao';
import StatCard from '../components/StatCard';
import QuickActionCard from '../components/QuickActionCard';
import ProjetoCard from '../components/ProjetoCard';
import Button from '../components/Button';

const LIMITE_PROJETOS = 3;

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario, sair } = useAuth();

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
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={handleAtualizar} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.saudacao, { color: colors.textSecondary }]}>{getSaudacao()},</Text>
          <Text style={[styles.nome, { color: colors.text }]}>{primeiroNome}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarTexto}>{primeiroNome.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard
              valor={`${projetos.length}/${LIMITE_PROJETOS}`}
              rotulo="Projetos ativos"
              Icone={Car}
            />
            <View style={{ width: 12 }} />
            <StatCard
              valor={totalPendentes}
              rotulo="Itens pendentes"
              destaque={totalPendentes > 0}
              Icone={ListTodo}
            />
          </View>

          {projetoMaisRecente ? (
            <View style={styles.secao}>
              <Text style={[styles.secaoTitulo, { color: colors.text }]}>Continue de onde parou</Text>
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
            <View style={[styles.vazioCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Wrench size={28} color={colors.textSecondary} style={{ marginBottom: 8 }} />
              <Text style={[styles.vazioTitulo, { color: colors.text }]}>Comece seu primeiro projeto</Text>
              <Text style={[styles.vazioTexto, { color: colors.textSecondary }]}>
                Escolha seu carro e monte a to-do list de customização.
              </Text>
            </View>
          )}
        </>
      )}

      <View style={styles.secao}>
        <Text style={[styles.secaoTitulo, { color: colors.text }]}>Explorar</Text>
        <QuickActionCard
          Icone={Car}
          titulo="Meus Projetos"
          subtitulo="Veja e gerencie suas customizações"
          corFundo={colors.primary}
          onPress={() => navigation.navigate('Projetos')}
        />
        <QuickActionCard
          Icone={MapPin}
          titulo="Oficinas Próximas"
          subtitulo="Encontre onde executar seus serviços"
          corFundo={colors.secondary}
          onPress={() => navigation.navigate('Oficinas')}
        />
      </View>

      <Button title="Sair" variant="outline" onPress={sair} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  saudacao: { fontSize: 15, fontWeight: '500' },
  nome: { fontSize: 26, fontWeight: '800', marginTop: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#FEFEFE', fontSize: 18, fontWeight: '800' },
  statsRow: { flexDirection: 'row', marginBottom: 28 },
  secao: { marginBottom: 28 },
  secaoTitulo: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  vazioCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 28 },
  vazioTitulo: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  vazioTexto: { fontSize: 13, textAlign: 'center' },
});