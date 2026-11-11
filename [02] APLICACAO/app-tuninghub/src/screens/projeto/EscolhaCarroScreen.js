import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Car } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { listarMontadoras } from '../../api/montadora.api';
import { listarModelosPorMontadora } from '../../api/modelo.api';
import { getErrorMessage } from '../../utils/errorHandler';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import ProgressoEtapas from '../../components/ProgressoEtapas';
import SearchSelect from '../../components/SearchSelect';
import AvisoInline from '../../components/AvisoInline';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';

// Atalhos para as marcas mais comuns (procuradas pelo nome na lista da FIPE).
// Sigla em texto (monograma), sem logos: logos de montadoras são marcas registradas.
const MARCAS_POPULARES = [
  { nome: 'Volkswagen', sigla: 'VW' },
  { nome: 'Chevrolet', sigla: 'CH' },
  { nome: 'Fiat', sigla: 'FI' },
  { nome: 'Toyota', sigla: 'TO' },
  { nome: 'Honda', sigla: 'HO' },
  { nome: 'Hyundai', sigla: 'HY' },
  { nome: 'Ford', sigla: 'FO' },
  { nome: 'Renault', sigla: 'RE' },
];

const COLUNAS = 4;
const GAP = 8;

const normalizar = (t) =>
  (t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function EscolhaCarroScreen({ navigation }) {
  const { colors, fonts, typography, radius, layout } = useTheme();
  const { width } = useWindowDimensions();

  const [montadoras, setMontadoras] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [idMontadora, setIdMontadora] = useState('');
  const [idModelo, setIdModelo] = useState('');
  const [carregandoMontadoras, setCarregandoMontadoras] = useState(true);
  const [carregandoModelos, setCarregandoModelos] = useState(false);
  const [erro, setErro] = useState('');

  // Mesma largura para todos os cartões, independente do tamanho do nome
  const larguraMarca = (width - layout.screenPadding * 2 - GAP * (COLUNAS - 1)) / COLUNAS;

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await listarMontadoras();
        setMontadoras(lista);
      } catch (e) {
        setErro(getErrorMessage(e));
      } finally {
        setCarregandoMontadoras(false);
      }
    }
    carregar();
  }, []);

  useEffect(() => {
    if (!idMontadora) {
      setModelos([]);
      setIdModelo('');
      return;
    }
    async function carregarModelos() {
      setCarregandoModelos(true);
      setIdModelo('');
      try {
        const lista = await listarModelosPorMontadora(idMontadora);
        setModelos(lista);
      } catch (e) {
        setErro(getErrorMessage(e));
      } finally {
        setCarregandoModelos(false);
      }
    }
    carregarModelos();
  }, [idMontadora]);

  const populares = useMemo(
    () =>
      MARCAS_POPULARES.map(({ nome, sigla }) => {
        const m = montadoras.find((x) => normalizar(x.Nome || x.nome).includes(normalizar(nome)));
        return m ? { rotulo: nome, sigla, value: String(m.IdMontadora ?? m.id) } : null;
      }).filter(Boolean),
    [montadoras]
  );

  const montadoraSelecionada = montadoras.find((m) => String(m.IdMontadora ?? m.id) === String(idMontadora));
  const modeloSelecionado = modelos.find((m) => String(m.IdModelo ?? m.id) === String(idModelo));
  const nomeModelo = modeloSelecionado?.NomeModelo || modeloSelecionado?.Nome || modeloSelecionado?.nome || '';

  function handleProximo() {
    if (!idModelo) {
      setErro('Selecione a marca e o modelo do carro.');
      return;
    }
    setErro('');
    navigation.navigate('EscolhaEstilo', { idModelo, nomeCarro: nomeModelo });
  }

  const rodape = <Button title="Continuar" onPress={handleProximo} disabled={!idModelo} />;

  return (
    <ScreenContainer rodape={rodape}>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        acaoDireita={<ProgressoEtapas atual={1} total={2} />}
        titulo="Qual é o seu carro?"
        subtitulo="Escolha a marca e o modelo do carro que você vai customizar."
      />

      {carregandoMontadoras ? (
        <View>
          <View style={styles.grade}>
            {Array.from({ length: COLUNAS * 2 }).map((_, i) => (
              <Skeleton key={i} width={larguraMarca} height={80} borderRadius={radius.md} />
            ))}
          </View>
          <Skeleton width={60} height={12} style={styles.skeletonLabel} />
          <Skeleton height={52} borderRadius={radius.md} style={styles.skeletonCampo} />
        </View>
      ) : (
        <>
          {populares.length > 0 ? (
            <>
              <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>Marcas populares</Text>
              <View style={styles.grade}>
                {populares.map((p) => {
                  const ativo = String(idMontadora) === p.value;
                  return (
                    <Pressable
                      key={p.value}
                      onPress={() => setIdMontadora(p.value)}
                      accessibilityRole="button"
                      accessibilityLabel={p.rotulo}
                      accessibilityState={{ selected: ativo }}
                      style={({ pressed }) => [
                        styles.marca,
                        {
                          width: larguraMarca,
                          borderRadius: radius.md,
                          backgroundColor: ativo ? colors.primarySoft : colors.surface,
                          borderColor: ativo ? colors.primary : colors.border,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.sigla, { backgroundColor: ativo ? colors.primary : colors.surfaceElevated }]}>
                        <Text
                          style={[
                            styles.siglaTexto,
                            { fontFamily: fonts.extrabold, color: ativo ? colors.textOnPrimary : colors.text },
                          ]}
                        >
                          {p.sigla}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.marcaNome,
                          {
                            fontFamily: ativo ? fonts.semibold : fonts.medium,
                            color: ativo ? colors.primary : colors.textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {p.rotulo}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <SearchSelect
            label={populares.length > 0 ? 'Ou busque a marca' : 'Marca'}
            placeholder="Selecione a marca"
            value={idMontadora}
            onSelect={setIdMontadora}
            items={montadoras.map((m) => ({
              label: m.Nome || m.nome,
              value: String(m.IdMontadora ?? m.id),
            }))}
          />

          <SearchSelect
            label="Modelo"
            placeholder={carregandoModelos ? 'Carregando...' : idMontadora ? 'Selecione o modelo' : 'Escolha a marca primeiro'}
            value={idModelo}
            onSelect={setIdModelo}
            disabled={!idMontadora || carregandoModelos}
            items={modelos.map((m) => ({
              label: m.NomeModelo || m.Nome || m.nome,
              value: String(m.IdModelo ?? m.id),
            }))}
          />
        </>
      )}

      {modeloSelecionado ? (
        <View
          style={[
            styles.resumo,
            { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderRadius: radius.lg },
          ]}
        >
          <View style={[styles.resumoIcone, { backgroundColor: colors.primary, borderRadius: radius.md }]}>
            <Car size={22} color={colors.textOnPrimary} strokeWidth={2} />
          </View>
          <View style={styles.resumoTextos}>
            <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.medium }]}>Seu carro</Text>
            <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>
              {nomeModelo}
            </Text>
            {montadoraSelecionada ? (
              <Text
                style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}
                numberOfLines={1}
              >
                {montadoraSelecionada.Nome || montadoraSelecionada.nome}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <AvisoInline mensagem={erro} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  secao: { marginBottom: 10, marginLeft: 4 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginBottom: 20 },
  marca: { borderWidth: 1.5, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, gap: 6 },
  sigla: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  siglaTexto: { fontSize: 13, letterSpacing: 0.5 },
  marcaNome: { fontSize: 11.5 },
  skeletonLabel: { marginBottom: 8 },
  skeletonCampo: { marginBottom: 16 },
  resumo: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, padding: 14, marginTop: 4, marginBottom: 16 },
  resumoIcone: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  resumoTextos: { flex: 1 },
});