import { useCallback, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Archive } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useEstilos } from '../../context/EstilosContext';
import { useToast } from '../../context/ToastContext';
import { LIMITE_PROJETOS_ARQUIVADOS } from '../../utils/limitesProjeto';
import {
  listarMeusProjetosArquivados,
  desarquivarProjeto,
  excluirProjetoDefinitivamente,
} from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { getEstiloVisual } from '../../constants/estilos';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';

export default function ProjetosArquivadosScreen({ navigation }) {
  const { colors, fonts, typography, radius } = useTheme();
  const { getNomeEstilo } = useEstilos();
  const { mostrar } = useToast();

  const [projetos, setProjetos] = useState([]);
  const [nomesModelos, setNomesModelos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [idProcessando, setIdProcessando] = useState(null);
  const [acaoEmCurso, setAcaoEmCurso] = useState(null); // 'desarquivar' | 'excluir'
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const [lista, modelos] = await Promise.all([listarMeusProjetosArquivados(), listarTodosModelos()]);
      setProjetos(lista);

      const mapa = {};
      modelos.forEach((m) => {
        mapa[String(m.IdModelo ?? m.id)] = m.NomeModelo || m.Nome || m.nome || 'Carro';
      });
      setNomesModelos(mapa);
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
    }, [])
  );

  async function handleDesarquivar(item) {
    setErro('');
    setIdProcessando(item.IdProjeto);
    setAcaoEmCurso('desarquivar');
    try {
      await desarquivarProjeto(item.IdProjeto);
      setProjetos((prev) => prev.filter((p) => p.IdProjeto !== item.IdProjeto));
      mostrar('Projeto desarquivado. Ele voltou para sua lista.');
    } catch (e) {
      setErro(getErrorMessage(e)); // ex.: limite de 3 projetos ativos
    } finally {
      setIdProcessando(null);
      setAcaoEmCurso(null);
    }
  }

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir definitivamente',
      'O projeto e toda a lista de serviços dele serão apagados. Não dá para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setErro('');
            setIdProcessando(item.IdProjeto);
            setAcaoEmCurso('excluir');
            try {
              await excluirProjetoDefinitivamente(item.IdProjeto);
              setProjetos((prev) => prev.filter((p) => p.IdProjeto !== item.IdProjeto));
              mostrar('Projeto excluído.');
            } catch (e) {
              setErro(getErrorMessage(e));
            } finally {
              setIdProcessando(null);
              setAcaoEmCurso(null);
            }
          },
        },
      ]
    );
  }

  function renderCard({ item }) {
    const nomeCarro = nomesModelos[String(item.IdModelo)] || 'Carro';
    const visual = getEstiloVisual(item.Estilo);
    const processando = idProcessando === item.IdProjeto;
    const ocupado = idProcessando !== null;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
        ]}
      >
        <View style={styles.cardTopo}>
          <View style={[styles.cardIcone, { backgroundColor: visual.cor, borderRadius: radius.md }]}>
            <visual.Icone size={22} color="#FEFEFE" strokeWidth={2} />
          </View>
          <View style={styles.cardTextos}>
            <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>
              {item.Descricao || nomeCarro}
            </Text>
            <Text
              style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}
              numberOfLines={1}
            >
              {item.Descricao ? `${nomeCarro} · ` : ''}
              {item.Estilo ? getNomeEstilo(item.Estilo) : 'Personalizado'}
            </Text>
          </View>
        </View>

        <View style={styles.acoes}>
          <View style={styles.acao}>
            <Button
              title="Desarquivar"
              variant="outline"
              onPress={() => handleDesarquivar(item)}
              loading={processando && acaoEmCurso === 'desarquivar'}
              disabled={ocupado}
            />
          </View>
          <View style={styles.acao}>
            <Button
              title="Excluir"
              variant="danger"
              onPress={() => confirmarExclusao(item)}
              loading={processando && acaoEmCurso === 'excluir'}
              disabled={ocupado}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        acaoDireita={
          carregando ? null : (
            <View
              style={[
                styles.contador,
                {
                  borderRadius: radius.pill,
                  backgroundColor: projetos.length >= LIMITE_PROJETOS_ARQUIVADOS ? colors.primarySoft : colors.surface,
                  borderColor: projetos.length >= LIMITE_PROJETOS_ARQUIVADOS ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.contadorTexto,
                  {
                    fontFamily: fonts.bold,
                    color: projetos.length >= LIMITE_PROJETOS_ARQUIVADOS ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {projetos.length}/{LIMITE_PROJETOS_ARQUIVADOS}
              </Text>
            </View>
          )
        }
        titulo="Projetos arquivados"
        subtitulo={
          projetos.length >= LIMITE_PROJETOS_ARQUIVADOS
            ? 'Limite atingido. Exclua um para poder arquivar outros projetos.'
            : 'Desarquive para voltar a usar, ou exclua de vez.'
        }
      />

      <AvisoInline mensagem={erro} />

      {carregando ? (
        <View>
          <Skeleton height={140} borderRadius={radius.lg} style={styles.skeleton} />
          <Skeleton height={140} borderRadius={radius.lg} style={styles.skeleton} />
        </View>
      ) : (
        <FlatList
          style={styles.lista}
          data={projetos}
          keyExtractor={(item) => String(item.IdProjeto)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaConteudo}
          ListEmptyComponent={
            <EmptyState
              Icone={Archive}
              titulo="Nenhum projeto arquivado"
              descricao="Quando você arquivar um projeto, ele aparece aqui."
            />
          }
          renderItem={renderCard}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lista: { flex: 1 },
  listaConteudo: { paddingBottom: 8, flexGrow: 1 },
  skeleton: { marginBottom: 14 },
  card: { borderWidth: 1, padding: 16, marginBottom: 14 },
  cardTopo: { flexDirection: 'row', alignItems: 'center' },
  cardIcone: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTextos: { flex: 1, gap: 2 },
  acoes: { flexDirection: 'row', gap: 10, marginTop: 16 },
  acao: { flex: 1 },
  contador: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  contadorTexto: { fontSize: 13 },
});