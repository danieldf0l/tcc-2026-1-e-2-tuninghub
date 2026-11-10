import { useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Archive, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useEstilos } from '../../context/EstilosContext';
import { useToast } from '../../context/ToastContext';
import {
  listarMeusProjetos,
  listarMeusProjetosArquivados,
  arquivarProjeto,
  excluirProjetoDefinitivamente,
} from '../../api/projeto.api';
import { listarTodosModelos } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { getEstiloVisual } from '../../constants/estilos';
import { LIMITE_PROJETOS_ATIVOS, LIMITE_PROJETOS_ARQUIVADOS } from '../../utils/limitesProjeto';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import ProgressoEtapas from '../../components/ProgressoEtapas';
import AvisoInline from '../../components/AvisoInline';
import Skeleton from '../../components/Skeleton';

function LinhaProjeto({ item, nomeCarro, nomeEstilo, rotuloAcao, perigo, processando, desabilitado, onAcao }) {
  const { colors, fonts, typography, radius } = useTheme();
  const visual = getEstiloVisual(item.Estilo);
  const corAcao = perigo ? colors.danger : colors.primary;

  return (
    <View style={[styles.linha, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={[styles.linhaIcone, { backgroundColor: visual.cor, borderRadius: radius.md }]}>
        <visual.Icone size={20} color="#FEFEFE" strokeWidth={2} />
      </View>

      <View style={styles.linhaTextos}>
        <Text style={[typography.bodyStrong, { color: colors.text }]} numberOfLines={1}>
          {item.Descricao || nomeCarro}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]} numberOfLines={1}>
          {item.Descricao ? `${nomeCarro} · ` : ''}
          {nomeEstilo}
        </Text>
      </View>

      <Pressable
        onPress={onAcao}
        disabled={desabilitado}
        hitSlop={6}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.acaoBotao,
          {
            borderRadius: radius.pill,
            backgroundColor: perigo ? colors.dangerSoft : colors.primarySoft,
            opacity: desabilitado && !processando ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        {processando ? (
          <ActivityIndicator size="small" color={corAcao} />
        ) : (
          <Text style={[styles.acaoTexto, { color: corAcao, fontFamily: fonts.bold }]}>{rotuloAcao}</Text>
        )}
      </Pressable>
    </View>
  );
}

export default function LiberarVagaScreen({ navigation }) {
  const { colors, fonts, typography, radius } = useTheme();
  const { getNomeEstilo } = useEstilos();
  const { mostrar } = useToast();

  const [ativos, setAtivos] = useState([]);
  const [arquivados, setArquivados] = useState([]);
  const [nomesModelos, setNomesModelos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [idProcessando, setIdProcessando] = useState(null);
  const [comecouExcluindo, setComecouExcluindo] = useState(null); // definido na 1ª carga
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const [listaAtivos, listaArquivados, modelos] = await Promise.all([
        listarMeusProjetos(),
        listarMeusProjetosArquivados(),
        listarTodosModelos(),
      ]);

      // Já existe vaga: não há nada a liberar
      if (listaAtivos.length < LIMITE_PROJETOS_ATIVOS) {
        navigation.replace('EscolhaCarro');
        return;
      }

      setAtivos(listaAtivos);
      setArquivados(listaArquivados);

      const mapa = {};
      modelos.forEach((m) => {
        mapa[String(m.IdModelo ?? m.id)] = m.NomeModelo || m.Nome || m.nome || 'Carro';
      });
      setNomesModelos(mapa);

      setComecouExcluindo((prev) => prev ?? listaArquivados.length >= LIMITE_PROJETOS_ARQUIVADOS);
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const passo = arquivados.length >= LIMITE_PROJETOS_ARQUIVADOS ? 'excluir' : 'arquivar';
  const lista = passo === 'excluir' ? arquivados : ativos;

  async function handleArquivar(item) {
    setErro('');
    setIdProcessando(item.IdProjeto);
    try {
      await arquivarProjeto(item.IdProjeto);
      mostrar('Vaga liberada! Agora é só escolher o carro.');
      navigation.replace('EscolhaCarro');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setIdProcessando(null);
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
            try {
              await excluirProjetoDefinitivamente(item.IdProjeto);
              setArquivados((prev) => prev.filter((p) => p.IdProjeto !== item.IdProjeto));
              mostrar('Projeto excluído. Agora arquive um projeto ativo.');
            } catch (e) {
              setErro(getErrorMessage(e));
            } finally {
              setIdProcessando(null);
            }
          },
        },
      ]
    );
  }

  const textos =
    passo === 'excluir'
      ? {
          Icone: Trash2,
          titulo: 'Abra espaço nos arquivados',
          subtitulo: `Você tem ${LIMITE_PROJETOS_ATIVOS} projetos ativos e ${LIMITE_PROJETOS_ARQUIVADOS} arquivados. Primeiro, exclua um arquivado.`,
          secao: `Arquivados (${arquivados.length}/${LIMITE_PROJETOS_ARQUIVADOS})`,
          dica: 'A exclusão é definitiva: o projeto e a lista de serviços dele são apagados.',
        }
      : {
          Icone: Archive,
          titulo: 'Libere uma vaga',
          subtitulo: `Você já tem ${LIMITE_PROJETOS_ATIVOS} projetos ativos. Arquive um para criar outro.`,
          secao: `Ativos (${ativos.length}/${LIMITE_PROJETOS_ATIVOS})`,
          dica: 'Projetos arquivados podem ser desarquivados depois, em "Projetos arquivados".',
        };

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        acaoDireita={comecouExcluindo ? <ProgressoEtapas atual={passo === 'excluir' ? 1 : 2} total={2} /> : undefined}
        Icone={textos.Icone}
        titulo={textos.titulo}
        subtitulo={textos.subtitulo}
      />

      <AvisoInline mensagem={erro} />

      {carregando ? (
        <>
          <Skeleton height={72} borderRadius={radius.lg} style={styles.skeleton} />
          <Skeleton height={72} borderRadius={radius.lg} style={styles.skeleton} />
          <Skeleton height={72} borderRadius={radius.lg} style={styles.skeleton} />
        </>
      ) : (
        <>
          <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>{textos.secao}</Text>

          {lista.map((item) => {
            const nomeCarro = nomesModelos[String(item.IdModelo)] || 'Carro';
            return (
              <LinhaProjeto
                key={item.IdProjeto}
                item={item}
                nomeCarro={nomeCarro}
                nomeEstilo={item.Estilo ? getNomeEstilo(item.Estilo) : 'Personalizado'}
                rotuloAcao={passo === 'excluir' ? 'Excluir' : 'Arquivar'}
                perigo={passo === 'excluir'}
                processando={idProcessando === item.IdProjeto}
                desabilitado={idProcessando !== null}
                onAcao={() => (passo === 'excluir' ? confirmarExclusao(item) : handleArquivar(item))}
              />
            );
          })}

          <Text style={[typography.caption, styles.dica, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            {textos.dica}
          </Text>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  skeleton: { marginBottom: 10 },
  secao: { marginBottom: 10, marginLeft: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 12, marginBottom: 10 },
  linhaIcone: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linhaTextos: { flex: 1, gap: 2, marginRight: 10 },
  acaoBotao: { minWidth: 92, height: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  acaoTexto: { fontSize: 13 },
  dica: { textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
});