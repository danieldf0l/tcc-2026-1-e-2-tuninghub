import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, FlatList, Image, Pressable, Modal, Alert, StatusBar, Animated,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin, Copy, X, Share2, Map as MapaIcone, MessageCircle, BadgeCheck, Wrench, Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  buscarEnderecoOficina, listarServicosOficina, listarImagensOficina,
} from '../../api/oficinaPublica.api';
import { getUrlImagem } from '../../utils/media';
import { abrirWhatsApp, abrirNoMapa, compartilharOficina } from '../../utils/contato';
import { formatarDistancia } from '../../utils/formatters';
import { formatarFaixaPreco, descreverFaixaPreco } from '../../utils/faixaPreco';
import { getCategoriaInfo } from '../../constants/categoriasServico';
import MiniMapa from '../../components/MiniMapa';
import BackButton from '../../components/BackButton';
import AvisoInline from '../../components/AvisoInline';
import Skeleton from '../../components/Skeleton';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import { LogoIcone } from '../../components/Logo';

const ALTURA_CAPA = 240;
const TAMANHO_LOGO = 88;

function obterIniciais(nome) {
  return (nome || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function Pilula({ Icone, texto }) {
  const { colors, fonts, radius } = useTheme();
  return (
    <View style={[styles.pilula, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill }]}>
      {Icone ? <Icone size={13} color={colors.textSecondary} strokeWidth={2.25} /> : null}
      <Text style={[styles.pilulaTexto, { color: colors.textSecondary, fontFamily: fonts.semibold }]} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

function AcaoRapida({ Icone, rotulo, onPress }) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={rotulo} style={styles.acao}>
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.acaoCirculo,
              { backgroundColor: pressed ? colors.border : colors.surface, borderColor: colors.border },
            ]}
          >
            <Icone size={20} color={colors.text} strokeWidth={2} />
          </View>
          <Text style={[styles.acaoRotulo, { color: colors.textSecondary, fontFamily: fonts.medium }]}>{rotulo}</Text>
        </>
      )}
    </Pressable>
  );
}

// Fotos em tela cheia, deslizando para os lados
function VisualizadorFotos({ fotos, indiceInicial, onFechar }) {
  const { fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [indice, setIndice] = useState(indiceInicial ?? 0);
  const aberto = indiceInicial !== null && indiceInicial !== undefined;

  useEffect(() => {
    if (aberto) setIndice(indiceInicial);
  }, [aberto, indiceInicial]);

  return (
    <Modal visible={aberto} transparent animationType="fade" statusBarTranslucent onRequestClose={onFechar}>
      <StatusBar barStyle="light-content" />
      <View style={styles.visualizador}>
        {aberto ? (
          <FlatList
            data={fotos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={indiceInicial}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            keyExtractor={(f) => String(f.IdImagem)}
            onMomentumScrollEnd={(e) => setIndice(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={{ width, height, justifyContent: 'center' }}>
                <Image source={{ uri: getUrlImagem(item.UrlImagem) }} style={{ width, height: height * 0.75 }} resizeMode="contain" />
              </View>
            )}
          />
        ) : null}

        <View style={[styles.visualizadorTopo, { top: insets.top + 8 }]} pointerEvents="box-none">
          <Text style={[styles.visualizadorContador, { fontFamily: fonts.semibold }]}>
            {fotos.length > 1 ? `${indice + 1} de ${fotos.length}` : ''}
          </Text>
          <Pressable onPress={onFechar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar fotos" style={styles.visualizadorFechar}>
            <X size={22} color="#FEFEFE" strokeWidth={2.25} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function OficinaPerfilScreen({ route, navigation }) {
  const { colors, fonts, typography, layout, radius, isDark } = useTheme();
  const { mostrar } = useToast();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { oficina, contextoProjeto } = route.params;

  const [imagens, setImagens] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [endereco, setEndereco] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [indiceCapa, setIndiceCapa] = useState(0);
  const [fotoAberta, setFotoAberta] = useState(null); // índice da foto no visualizador
  const montado = useRef(true);
    // A barra do topo ganha fundo e o nome da oficina quando a capa sai da tela
  const scrollY = useRef(new Animated.Value(0)).current;
  const opacidadeBarra = scrollY.interpolate({
    inputRange: [ALTURA_CAPA - 120, ALTURA_CAPA - 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    montado.current = true;
    (async () => {
      const [img, serv, end] = await Promise.allSettled([
        listarImagensOficina(oficina.IdOficina),
        listarServicosOficina(oficina.IdOficina),
        buscarEnderecoOficina(oficina.IdOficina),
      ]);
      if (!montado.current) return;
      if (img.status === 'fulfilled') setImagens(img.value || []);
      if (serv.status === 'fulfilled') setServicos(serv.value || []);
      if (end.status === 'fulfilled') setEndereco(end.value);
      setCarregando(false);
    })();
    return () => {
      montado.current = false;
    };
  }, [oficina.IdOficina]);

  const logo = imagens.find((i) => i.TipoImagem === 'LOGO');
  const galeria = imagens.filter((i) => i.TipoImagem === 'GALERIA');

  const categorias = useMemo(() => {
    const grupos = {};
    servicos.forEach((s) => {
      const cat = s.Categoria || 'Outros';
      (grupos[cat] = grupos[cat] || []).push(s.NomeServico || s.Nome || s.nome);
    });
    return Object.entries(grupos).map(([cat, nomes]) => ({ ...getCategoriaInfo(cat), nomes }));
  }, [servicos]);

  const linhaEndereco = endereco
    ? [
        [endereco.Rua || endereco.Logradouro, endereco.Numero].filter(Boolean).join(', '),
        endereco.Bairro || oficina.Bairro,
        endereco.Cidade || oficina.Cidade,
      ].filter(Boolean).join(' - ')
    : [oficina.Bairro, oficina.Cidade].filter(Boolean).join(' - ');
  const cep = endereco?.CEP || endereco?.Cep;
  const enderecoCompleto = cep ? `${linhaEndereco} - CEP ${cep}` : linhaEndereco;

  const distancia = formatarDistancia(oficina.distanciaKm);
  const faixa = formatarFaixaPreco(oficina.FaixaPreco);
  const descricaoFaixa = descreverFaixaPreco(oficina.FaixaPreco);
  const temContato = !!oficina.Telefone;
  const servicosDoProjeto = contextoProjeto?.servicos || [];
  const carroDoProjeto = [contextoProjeto?.montadora, contextoProjeto?.modelo].filter(Boolean).join(' ');
  const temMapa = !!Number(oficina.Latitude) && !!Number(oficina.Longitude);

  async function falarNoWhatsApp() {
    try {
      await abrirWhatsApp(oficina.Telefone, oficina.NomeOficina, contextoProjeto);
    } catch {
      Alert.alert('Não foi possível abrir o WhatsApp', 'Verifique se o aplicativo está instalado.');
    }
  }

  async function copiarEndereco() {
    await Clipboard.setStringAsync(enderecoCompleto);
    mostrar('Endereço copiado.');
  }

  function abrirMapa() {
    if (!temMapa) {
      mostrar('Localização indisponível para esta oficina.', 'info');
      return;
    }
    abrirNoMapa(oficina.Latitude, oficina.Longitude, oficina.NomeOficina);
  }

  function compartilhar() {
    compartilharOficina({ nome: oficina.NomeOficina, endereco: linhaEndereco }).catch(() => {});
  }

  function renderCapa() {
    if (carregando) return <Skeleton height={ALTURA_CAPA} borderRadius={0} />;

    if (galeria.length === 0) {
      return (
        <View style={[styles.capaVazia, { height: ALTURA_CAPA, backgroundColor: colors.surface }]}>
          <LogoIcone tamanho={64} variante={isDark ? 'branco' : 'escuro'} />
        </View>
      );
    }

    return (
      <View>
        <FlatList
          data={galeria}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => String(f.IdImagem)}
          onMomentumScrollEnd={(e) => setIndiceCapa(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => setFotoAberta(index)} accessibilityRole="imagebutton" accessibilityLabel="Ver foto">
              <Image source={{ uri: getUrlImagem(item.UrlImagem) }} style={{ width, height: ALTURA_CAPA }} resizeMode="cover" />
            </Pressable>
          )}
        />
        {galeria.length > 1 ? (
          <View style={[styles.contadorCapa, { borderRadius: radius.pill }]}>
            <Text style={[styles.contadorCapaTexto, { fontFamily: fonts.semibold }]}>
              {indiceCapa + 1}/{galeria.length}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: temContato ? 120 + insets.bottom : insets.bottom + 32 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {renderCapa()}

        <View style={{ paddingHorizontal: layout.screenPadding }}>
          {/* Logo sobreposta à capa */}
          <View
            style={[
              styles.logo,
              { backgroundColor: colors.surface, borderColor: colors.background, borderRadius: TAMANHO_LOGO / 2 },
            ]}
          >
            {logo ? (
              <Image source={{ uri: getUrlImagem(logo.UrlImagem) }} style={styles.logoImagem} />
            ) : (
              <Text style={[styles.logoIniciais, { color: colors.primary, fontFamily: fonts.extrabold }]}>
                {obterIniciais(oficina.NomeOficina)}
              </Text>
            )}
          </View>

          <Text style={[typography.h1, styles.nome, { color: colors.text }]}>{oficina.NomeOficina}</Text>

          <View style={styles.verificado}>
            <BadgeCheck size={15} color={colors.success} strokeWidth={2.25} />
            <Text style={[typography.caption, { color: colors.success, fontFamily: fonts.semibold }]}>CNPJ verificado</Text>
          </View>

          <View style={styles.pilulas}>
            {distancia ? <Pilula Icone={MapPin} texto={distancia} /> : null}
            {faixa ? <Pilula texto={descricaoFaixa ? `${faixa} · ${descricaoFaixa}` : faixa} /> : null}
            {oficina.Bairro ? <Pilula texto={oficina.Bairro} /> : null}
          </View>

          <View style={styles.acoes}>
            <AcaoRapida Icone={MapaIcone} rotulo="Mapa" onPress={abrirMapa} />
            <AcaoRapida Icone={Copy} rotulo="Copiar" onPress={copiarEndereco} />
            <AcaoRapida Icone={Share2} rotulo="Compartilhar" onPress={compartilhar} />
          </View>

          <View style={[styles.divisor, { backgroundColor: colors.border }]} />

          {servicosDoProjeto.length > 0 ? (
            <View
              style={[
                styles.projeto,
                { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderRadius: radius.lg },
              ]}
            >
              <View style={styles.projetoTopo}>
                <Sparkles size={16} color={colors.primary} strokeWidth={2.25} />
                <Text style={[typography.bodyStrong, styles.flex, { color: colors.text }]}>
                  {carroDoProjeto ? `Faz para o seu ${carroDoProjeto}` : 'Faz para o seu projeto'}
                </Text>
              </View>
              <View style={styles.chips}>
                {servicosDoProjeto.map((nome) => (
                  <Chip key={nome} label={nome} small />
                ))}
              </View>
            </View>
          ) : null}

          {!temContato ? (
            <AvisoInline
              tipo="info"
              mensagem="Esta oficina ainda não tem contato direto pelo app. Você pode visitá-la pelo endereço abaixo."
            />
          ) : null}

          <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>Serviços</Text>
          {carregando ? (
            <View style={styles.chips}>
              <Skeleton width={90} height={28} borderRadius={radius.pill} />
              <Skeleton width={120} height={28} borderRadius={radius.pill} />
              <Skeleton width={70} height={28} borderRadius={radius.pill} />
            </View>
          ) : categorias.length > 0 ? (
            categorias.map((cat) => (
              <View key={cat.rotulo} style={styles.categoria}>
                <View style={styles.categoriaTopo}>
                  <cat.Icone size={15} color={colors.text} strokeWidth={2.25} />
                  <Text style={[typography.bodyStrong, { color: colors.text }]}>{cat.rotulo}</Text>
                </View>
                <View style={styles.chips}>
                  {cat.nomes.map((n) => (
                    <Chip key={n} label={n} small />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              Esta oficina ainda não cadastrou serviços.
            </Text>
          )}

          <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>Localização</Text>
          <View style={styles.endereco}>
            <MapPin size={16} color={colors.primary} strokeWidth={2.25} />
            <Text style={[typography.body, styles.flex, { color: colors.text }]}>{enderecoCompleto}</Text>
          </View>

          {temMapa ? (
            <Pressable onPress={abrirMapa} accessibilityRole="button" accessibilityLabel="Abrir no app de mapas">
              <MiniMapa latitude={oficina.Latitude} longitude={oficina.Longitude} />
              <Text style={[typography.caption, styles.dicaMapa, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Toque no mapa para abrir no seu app de mapas.
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Voltar e compartilhar: flutuam sobre a capa; ganham fundo e título ao rolar */}
      <View
        style={[styles.barraTopo, { paddingTop: insets.top + 4, paddingHorizontal: layout.screenPadding }]}
        pointerEvents="box-none"
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              borderBottomWidth: StyleSheet.hairlineWidth,
              opacity: opacidadeBarra,
            },
          ]}
        />
        <BackButton onPress={() => navigation.goBack()} />
        <Animated.Text
          style={[typography.h3, styles.barraTitulo, { color: colors.text, opacity: opacidadeBarra }]}
          numberOfLines={1}
        >
          {oficina.NomeOficina}
        </Animated.Text>
        <Pressable
          onPress={compartilhar}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Compartilhar oficina"
          style={({ pressed }) => [
            styles.botaoRedondo,
            { borderRadius: radius.pill, borderColor: colors.border, backgroundColor: pressed ? colors.border : colors.surface },
          ]}
        >
          <Share2 size={18} color={colors.text} strokeWidth={2.25} />
        </Pressable>
      </View>

      {/* Barra de ação fixa (só oficina com contato liberado — plano Pro) */}
      {temContato ? (
        <View
          style={[
            styles.rodape,
            {
              paddingBottom: insets.bottom + 12,
              paddingHorizontal: layout.screenPadding,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Button
            title={servicosDoProjeto.length > 0 ? 'Pedir orçamento no WhatsApp' : 'Falar no WhatsApp'}
            Icone={MessageCircle}
            onPress={falarNoWhatsApp}
          />
        </View>
      ) : null}

      <VisualizadorFotos fotos={galeria} indiceInicial={fotoAberta} onFechar={() => setFotoAberta(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  capaVazia: { alignItems: 'center', justifyContent: 'center' },
  contadorCapa: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(5, 5, 5, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  contadorCapaTexto: { color: '#FEFEFE', fontSize: 12 },
  logo: {
    width: TAMANHO_LOGO,
    height: TAMANHO_LOGO,
    borderWidth: 4,
    marginTop: -TAMANHO_LOGO / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImagem: { width: '100%', height: '100%' },
  logoIniciais: { fontSize: 28 },
  nome: { marginTop: 12 },
  verificado: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  pilulas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  pilula: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  pilulaTexto: { fontSize: 12 },
  acoes: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 22 },
  acao: { alignItems: 'center', gap: 6, minWidth: 72 },
  acaoCirculo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  acaoRotulo: { fontSize: 12 },
  divisor: { height: StyleSheet.hairlineWidth, marginVertical: 22 },
  projeto: { borderWidth: 1.5, padding: 14, marginBottom: 16, gap: 10 },
  projetoTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 },
  secao: { marginTop: 8, marginBottom: 12 },
  categoria: { marginBottom: 16 },
  categoriaTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  endereco: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  dicaMapa: { textAlign: 'center', marginTop: 8, marginBottom: 8 },
  barraTopo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  barraTitulo: { flex: 1, textAlign: 'center', marginHorizontal: 8 },
  botaoRedondo: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  visualizador: { flex: 1, backgroundColor: '#050505' },
  visualizadorTopo: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  visualizadorContador: { color: '#FEFEFE', fontSize: 14 },
  visualizadorFechar: { position: 'absolute', right: 20 },
});