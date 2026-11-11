import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Check, SlidersHorizontal, Tag, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useEstilos } from '../../context/EstilosContext';
import { useToast } from '../../context/ToastContext';
import { TIPO_CUSTOMIZACAO, getEstiloVisual } from '../../constants/estilos';
import { criarProjeto } from '../../api/projeto.api';
import { listarServicosSugeridos } from '../../api/estilo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import ProgressoEtapas from '../../components/ProgressoEtapas';
import AvisoInline from '../../components/AvisoInline';
import Skeleton from '../../components/Skeleton';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Button from '../../components/Button';

const PERSONALIZADA = 'PERSONALIZADA';
const GAP = 10;

function SeloSelecionado() {
  const { colors } = useTheme();
  return (
    <View style={[styles.selo, { backgroundColor: colors.primary }]}>
      <Check size={12} color={colors.textOnPrimary} strokeWidth={3.5} />
    </View>
  );
}

export default function EscolhaEstiloScreen({ route, navigation }) {
  const { idModelo, nomeCarro } = route.params;
  const { colors, fonts, typography, radius, layout } = useTheme();
  const { estilos, refetch } = useEstilos();
  const { mostrar } = useToast();
  const { width } = useWindowDimensions();

  const [carregandoEstilos, setCarregandoEstilos] = useState(true);
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [selecao, setSelecao] = useState(null); // Codigo do estilo ou 'PERSONALIZADA'
  const [kits, setKits] = useState({}); // cache: codigo -> [nomes] | null (falhou)
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const larguraCartao = (width - layout.screenPadding * 2 - GAP) / 2;

  useFocusEffect(
    useCallback(() => {
      async function atualizar() {
        setCarregandoEstilos(true);
        await refetch();
        setCarregandoEstilos(false);
      }
      atualizar();
    }, [refetch])
  );

  async function selecionar(codigo) {
    setSelecao(codigo);
    setErro('');
    if (codigo === PERSONALIZADA || kits[codigo] !== undefined) return;

    try {
      const lista = await listarServicosSugeridos(codigo);
      const nomes = (lista || []).map((s) => s.NomeServico || s.Nome || s.nome).filter(Boolean);
      setKits((prev) => ({ ...prev, [codigo]: nomes }));
    } catch {
      setKits((prev) => ({ ...prev, [codigo]: null })); // sem prévia, mas não impede criar
    }
  }

  async function criar() {
    if (!selecao) return;
    setErro('');
    setLoading(true);

    const tipoCustomizacao = selecao === PERSONALIZADA ? TIPO_CUSTOMIZACAO.PERSONALIZADA : TIPO_CUSTOMIZACAO.ESTILO;
    const apelido = nomeProjeto.trim();

    try {
      const projeto = await criarProjeto({
        idModelo,
        descricao: apelido || null,
        tipoCustomizacao,
        estilo: tipoCustomizacao === TIPO_CUSTOMIZACAO.ESTILO ? selecao : null,
      });

      // Limpa o fluxo de criação da pilha: "voltar" no detalhe leva à aba de origem
      navigation.popToTop();
      navigation.navigate('ProjetoDetalhe', {
        idProjeto: projeto.id ?? projeto.IdProjeto,
        nomeCarro: apelido || nomeCarro,
        nomeModelo: nomeCarro,
      });
      mostrar('Projeto criado!');
    } catch (e) {
      setErro(getErrorMessage(e));
      setLoading(false);
    }
  }

  function renderPrevia() {
    if (!selecao) return null;

    if (selecao === PERSONALIZADA) {
      return <AvisoInline tipo="info" mensagem="A lista começa vazia e você escolhe cada serviço." />;
    }

    const kit = kits[selecao];

    if (kit === undefined) {
      return <Skeleton height={96} borderRadius={radius.lg} style={styles.previaSkeleton} />;
    }
    if (kit === null) return null;
    if (kit.length === 0) {
      return <AvisoInline tipo="info" mensagem="Este estilo ainda não tem serviços sugeridos. A lista começa vazia." />;
    }

    return (
      <View style={[styles.previa, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
        <View style={styles.previaTopo}>
          <Sparkles size={16} color={colors.primary} strokeWidth={2.25} />
          <Text style={[typography.bodyStrong, { color: colors.text }]}>
            A lista já vem com {kit.length} {kit.length === 1 ? 'serviço' : 'serviços'}
          </Text>
        </View>
        <View style={styles.previaChips}>
          {kit.map((nome) => (
            <Chip key={nome} label={nome} small />
          ))}
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          Você pode adicionar ou remover serviços depois.
        </Text>
      </View>
    );
  }

  const rodape = (
    <>
      <AvisoInline mensagem={erro} />
      <Button title="Criar projeto" onPress={criar} loading={loading} disabled={!selecao || loading} />
    </>
  );

  const personalizadaSelecionada = selecao === PERSONALIZADA;

  return (
    <ScreenContainer rodape={rodape}>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        acaoDireita={<ProgressoEtapas atual={2} total={2} />}
        titulo="Escolha o estilo"
        subtitulo={nomeCarro ? `Qual é a proposta para o seu ${nomeCarro}?` : 'Qual é a proposta do projeto?'}
      />

      {carregandoEstilos && estilos.length === 0 ? (
        <View style={styles.grade}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={larguraCartao} height={104} borderRadius={radius.lg} />
          ))}
        </View>
      ) : estilos.length === 0 ? (
        <AvisoInline tipo="info" mensagem="Nenhum estilo disponível no momento. Você ainda pode criar do seu jeito." />
      ) : (
        <View style={styles.grade}>
          {estilos.map((estilo) => {
            const visual = getEstiloVisual(estilo.Codigo);
            const ativo = selecao === estilo.Codigo;
            return (
              <Pressable
                key={estilo.IdEstilo ?? estilo.Codigo}
                onPress={() => selecionar(estilo.Codigo)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo }}
                style={({ pressed }) => [
                  styles.cartao,
                  {
                    width: larguraCartao,
                    borderRadius: radius.lg,
                    backgroundColor: ativo ? colors.primarySoft : colors.surface,
                    borderColor: ativo ? colors.primary : colors.border,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <View style={[styles.cartaoIcone, { backgroundColor: visual.cor, borderRadius: radius.md }]}>
                  <visual.Icone size={22} color="#FEFEFE" strokeWidth={2} />
                </View>
                <Text style={[typography.bodyStrong, { color: colors.text }]} numberOfLines={2}>
                  {estilo.Nome}
                </Text>
                {ativo ? <SeloSelecionado /> : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable
        onPress={() => selecionar(PERSONALIZADA)}
        accessibilityRole="radio"
        accessibilityState={{ selected: personalizadaSelecionada }}
        style={({ pressed }) => [
          styles.cartaoLargo,
          {
            borderRadius: radius.lg,
            backgroundColor: personalizadaSelecionada ? colors.primarySoft : colors.surface,
            borderColor: personalizadaSelecionada ? colors.primary : colors.border,
            opacity: pressed ? 0.88 : 1,
          },
        ]}
      >
        <View style={[styles.cartaoIcone, styles.cartaoIconeLargo, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md }]}>
          <SlidersHorizontal size={22} color={colors.text} strokeWidth={2} />
        </View>
        <View style={styles.cartaoLargoTextos}>
          <Text style={[typography.bodyStrong, { color: colors.text }]}>Do meu jeito</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            Comece com a lista vazia e escolha cada serviço
          </Text>
        </View>
        {personalizadaSelecionada ? <SeloSelecionado /> : null}
      </Pressable>

      {renderPrevia()}

      <View style={styles.apelido}>
        <Input
          Icone={Tag}
          placeholder="Apelido do projeto (opcional)"
          value={nomeProjeto}
          onChangeText={setNomeProjeto}
          autoCapitalize="sentences"
          maxLength={60}
          returnKeyType="done"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginBottom: GAP },
  cartao: { borderWidth: 1.5, padding: 14, minHeight: 104, gap: 10 },
  cartaoIcone: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  cartaoLargo: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, padding: 14, marginBottom: 16 },
  cartaoIconeLargo: { marginRight: 12 },
  cartaoLargoTextos: { flex: 1, gap: 2, paddingRight: 24 },
  selo: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previaSkeleton: { marginBottom: 16 },
  previa: { borderWidth: 1, padding: 14, marginBottom: 16, gap: 10 },
  previaTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previaChips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 },
  apelido: { marginTop: 4 },
});