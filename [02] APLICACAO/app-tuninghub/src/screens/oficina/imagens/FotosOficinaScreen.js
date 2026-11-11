import { useCallback, useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X, Lock, Camera, Images, Crown } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useAssinaturaOficina } from '../../../hooks/useAssinaturaOficina';
import { listarImagensDaOficina, enviarImagem, removerImagem } from '../../../api/imagem.api';
import { getUrlImagem } from '../../../utils/media';
import { getErrorMessage } from '../../../utils/errorHandler';
import ScreenContainer from '../../../components/ScreenContainer';
import ScreenHeader from '../../../components/ScreenHeader';
import MenuAcoes from '../../../components/MenuAcoes';
import AvisoInline from '../../../components/AvisoInline';
import Skeleton from '../../../components/Skeleton';
import Button from '../../../components/Button';

const LIMITE_GALERIA = 6; // RN20
const GAP = 10;

function prepararArquivo(asset) {
  const mime = (asset.mimeType || '').toLowerCase();
  const ehPng = mime === 'image/png' || asset.uri.toLowerCase().endsWith('.png');
  return {
    uri: asset.uri,
    type: ehPng ? 'image/png' : 'image/jpeg',
    name: ehPng ? 'foto.png' : 'foto.jpg',
  };
}

export default function FotosOficinaScreen({ navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const { mostrar } = useToast();
  const { usuario } = useAuth();
  const { temPlanoPro, planoVencido, verificar } = useAssinaturaOficina();
  const { width } = useWindowDimensions();
  const idOficina = usuario?.IdOficina;

  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(null); // 'LOGO' | 'GALERIA' | null
  const [origemPara, setOrigemPara] = useState(null); // tipo aguardando escolha câmera/galeria
  const [erro, setErro] = useState('');

  const tamanhoTile = (width - layout.screenPadding * 2 - GAP * 2) / 3;

  async function carregar() {
    try {
      const lista = await listarImagensDaOficina(idOficina);
      setImagens(lista || []);
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      verificar(); // atualiza o plano (ex.: voltou da tela de pagamento)
      carregar();
    }, [idOficina])
  );

  const logo = imagens.find((i) => i.TipoImagem === 'LOGO');
  const galeria = imagens.filter((i) => i.TipoImagem === 'GALERIA');

  function irParaPlanos() {
    navigation.navigate('MinhaAssinatura');
  }

  function pedirFoto(tipo) {
    if (!temPlanoPro) {
      irParaPlanos();
      return;
    }
    if (tipo === 'GALERIA' && galeria.length >= LIMITE_GALERIA) {
      mostrar(`Limite de ${LIMITE_GALERIA} fotos atingido. Remova uma para adicionar outra.`, 'erro');
      return;
    }
    setOrigemPara(tipo);
  }

  async function enviarDe(origem, tipo) {
    const usarCamera = origem === 'camera';

    const permissao = usarCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        usarCamera
          ? 'Autorize o acesso à câmera nos ajustes do aparelho para fotografar.'
          : 'Autorize o acesso às fotos nos ajustes do aparelho para enviar imagens.'
      );
      return;
    }

    const opcoes = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: tipo === 'LOGO' ? [1, 1] : [4, 3],
      quality: 0.8,
    };
    const resultado = usarCamera
      ? await ImagePicker.launchCameraAsync(opcoes)
      : await ImagePicker.launchImageLibraryAsync(opcoes);
    if (resultado.canceled) return;

    setErro('');
    setEnviando(tipo);
    try {
      await enviarImagem(prepararArquivo(resultado.assets[0]), tipo);
      await carregar();
      mostrar(tipo === 'LOGO' ? 'Logo atualizada.' : 'Foto adicionada à galeria.');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setEnviando(null);
    }
  }

  function confirmarRemocao(imagem) {
    Alert.alert('Remover imagem', 'Tem certeza que deseja remover esta imagem?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerImagem(imagem.IdImagem);
            await carregar();
            mostrar('Imagem removida.');
          } catch (e) {
            setErro(getErrorMessage(e));
          }
        },
      },
    ]);
  }

  const tipoEscolhido = origemPara;
  const opcoesOrigem = [
    { chave: 'camera', rotulo: 'Tirar foto', Icone: Camera, onPress: () => enviarDe('camera', tipoEscolhido) },
    { chave: 'galeria', rotulo: 'Escolher da galeria', Icone: Images, onPress: () => enviarDe('galeria', tipoEscolhido) },
  ];

  function renderBloqueado() {
    return (
      <>
        <View
          style={[
            styles.avisoPro,
            { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderRadius: radius.lg },
          ]}
        >
          <View style={styles.avisoTopo}>
            <Crown size={18} color={colors.primary} strokeWidth={2.25} />
            <Text style={[typography.bodyStrong, { color: colors.text }]}>
              {planoVencido ? 'Seu plano Pro venceu' : 'Recurso do plano Pro'}
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {planoVencido
              ? 'Suas fotos e sua logo estão guardadas e voltam a aparecer assim que você renovar.'
              : 'Assine o Pro para mostrar sua logo e até 6 fotos no perfil da oficina. Se você já teve o plano, suas fotos continuam guardadas.'}
          </Text>
          <View style={styles.avisoAcao}>
            <Button title={planoVencido ? 'Renovar plano' : 'Ver planos'} onPress={irParaPlanos} />
          </View>
        </View>

        {/* Prévia do que a oficina ganha, bloqueada */}
        <View style={styles.bloqueado} pointerEvents="none">
          <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>Logo</Text>
          <View style={[styles.logoBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <Lock size={24} color={colors.textSecondary} />
          </View>
          <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>Galeria</Text>
          <View style={styles.grade}>
            {Array.from({ length: LIMITE_GALERIA }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tileVazio,
                  { width: tamanhoTile, height: tamanhoTile, borderColor: colors.border, borderRadius: radius.md },
                ]}
              >
                <Lock size={18} color={colors.textSecondary} />
              </View>
            ))}
          </View>
        </View>
      </>
    );
  }

  function renderPro() {
    return (
      <>
        <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>Logo</Text>
        <View style={styles.logoLinha}>
          <Pressable
            onPress={() => pedirFoto('LOGO')}
            disabled={enviando !== null}
            accessibilityRole="button"
            accessibilityLabel={logo ? 'Trocar logo' : 'Adicionar logo'}
            style={[styles.logoBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
          >
            {enviando === 'LOGO' ? (
              <ActivityIndicator color={colors.primary} />
            ) : logo ? (
              <Image source={{ uri: getUrlImagem(logo.UrlImagem) }} style={styles.imagemCheia} />
            ) : (
              <Camera size={26} color={colors.textSecondary} />
            )}
          </Pressable>
          <View style={styles.logoTextos}>
            <Text style={[typography.bodyStrong, { color: colors.text }]}>{logo ? 'Sua logo' : 'Sem logo ainda'}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              Aparece no card e no perfil da oficina. Enviar outra substitui a atual.
            </Text>
            <View style={styles.logoBotao}>
              <Button
                title={logo ? 'Trocar logo' : 'Adicionar logo'}
                variant="outline"
                onPress={() => pedirFoto('LOGO')}
                disabled={enviando !== null}
              />
            </View>
          </View>
        </View>

        <View style={styles.galeriaTopo}>
          <Text style={[typography.overline, { color: colors.textSecondary }]}>Galeria</Text>
          <Text style={[styles.contador, { fontFamily: fonts.bold, color: colors.textSecondary }]}>
            {galeria.length}/{LIMITE_GALERIA}
          </Text>
        </View>

        <View style={styles.grade}>
          {galeria.map((img) => (
            <View key={img.IdImagem} style={{ width: tamanhoTile, height: tamanhoTile }}>
              <Image source={{ uri: getUrlImagem(img.UrlImagem) }} style={[styles.imagemCheia, { borderRadius: radius.md }]} />
              <Pressable
                onPress={() => confirmarRemocao(img)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remover foto"
                style={styles.remover}
              >
                <X size={14} color="#FEFEFE" strokeWidth={2.5} />
              </Pressable>
            </View>
          ))}

          {galeria.length < LIMITE_GALERIA ? (
            <Pressable
              onPress={() => pedirFoto('GALERIA')}
              disabled={enviando !== null}
              accessibilityRole="button"
              accessibilityLabel="Adicionar foto à galeria"
              style={({ pressed }) => [
                styles.tileVazio,
                {
                  width: tamanhoTile,
                  height: tamanhoTile,
                  borderColor: pressed ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                },
              ]}
            >
              {enviando === 'GALERIA' ? (
                <>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[styles.tileTexto, { color: colors.textSecondary, fontFamily: fonts.medium }]}>Enviando...</Text>
                </>
              ) : (
                <>
                  <Plus size={24} color={colors.textSecondary} />
                  <Text style={[styles.tileTexto, { color: colors.textSecondary, fontFamily: fonts.medium }]}>Adicionar</Text>
                </>
              )}
            </Pressable>
          ) : null}
        </View>

        <Text style={[typography.caption, styles.dica, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          JPEG ou PNG de até 5 MB. Fotos bem iluminadas do espaço e de trabalhos prontos atraem mais clientes.
        </Text>
      </>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        titulo="Fotos da oficina"
        subtitulo="Sua logo e as fotos aparecem no perfil que os Entusiastas veem."
      />

      <AvisoInline mensagem={erro} />

      {carregando ? (
        <>
          <Skeleton width={60} height={12} style={styles.secao} />
          <Skeleton width={96} height={96} borderRadius={radius.lg} />
          <Skeleton width={80} height={12} style={[styles.secao, styles.skeletonGaleria]} />
          <View style={styles.grade}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width={tamanhoTile} height={tamanhoTile} borderRadius={radius.md} />
            ))}
          </View>
        </>
      ) : temPlanoPro ? (
        renderPro()
      ) : (
        renderBloqueado()
      )}

      <MenuAcoes
        visivel={!!origemPara}
        onFechar={() => setOrigemPara(null)}
        titulo={origemPara === 'LOGO' ? 'Logo da oficina' : 'Nova foto da galeria'}
        opcoes={opcoesOrigem}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  secao: { marginBottom: 10 },
  skeletonGaleria: { marginTop: 24 },
  avisoPro: { borderWidth: 1.5, padding: 16, marginBottom: 24, gap: 10 },
  avisoTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avisoAcao: { marginTop: 4 },
  bloqueado: { opacity: 0.45 },
  logoLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 96, height: 96, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 24 },
  imagemCheia: { width: '100%', height: '100%' },
  logoTextos: { flex: 1, marginLeft: 16, gap: 2 },
  logoBotao: { marginTop: 10 },
  galeriaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  contador: { fontSize: 12.5 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tileVazio: { borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  tileTexto: { fontSize: 11.5 },
  remover: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 5, 5, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dica: { marginTop: 14 },
});