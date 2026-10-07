import { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X, Lock, Camera } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useAssinaturaOficina } from '../../../hooks/useAssinaturaOficina';
import { listarImagensDaOficina, enviarImagem, removerImagem } from '../../../api/imagem.api';
import { getUrlImagem } from '../../../utils/media';
import { getErrorMessage } from '../../../utils/errorHandler';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';

const LIMITE_GALERIA = 6; // RN20

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
  const { colors } = useTheme();
  const { usuario } = useAuth();
  const { temPlanoPro, verificar } = useAssinaturaOficina();
  const { width } = useWindowDimensions();
  const idOficina = usuario?.IdOficina;

  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(null); // 'LOGO' | 'GALERIA' | null
  const [erro, setErro] = useState('');

  const tamanhoTile = (width - 48 - 20) / 3;

  async function carregar() {
    try {
      const lista = await listarImagensDaOficina(idOficina);
      setImagens(lista);
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      verificar(); // atualiza o plano (ex: voltou da tela de pagamento)
      carregar();
    }, [idOficina])
  );

  const logo = imagens.find((i) => i.TipoImagem === 'LOGO');
  const galeria = imagens.filter((i) => i.TipoImagem === 'GALERIA');

  function irParaPlanos() {
    navigation.navigate('MinhaAssinatura');
  }

  async function escolherEEnviar(tipo) {
    if (!temPlanoPro) {
      irParaPlanos();
      return;
    }
    if (tipo === 'GALERIA' && galeria.length >= LIMITE_GALERIA) {
      setErro(`Limite de ${LIMITE_GALERIA} fotos na galeria atingido. Remova uma para adicionar outra.`);
      return;
    }

    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos nos ajustes do aparelho para enviar imagens.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: tipo === 'LOGO' ? [1, 1] : [4, 3],
      quality: 0.8,
    });
    if (resultado.canceled) return;

    setErro('');
    setEnviando(tipo);
    try {
      await enviarImagem(prepararArquivo(resultado.assets[0]), tipo);
      await carregar();
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
          } catch (e) {
            setErro(getErrorMessage(e));
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text }]}>Fotos da oficina</Text>

      {!temPlanoPro ? (
        <View style={[styles.aviso, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Lock size={20} color={colors.primary} />
          <Text style={[styles.avisoTexto, { color: colors.textSecondary }]}>
            O envio de fotos é um recurso do plano Pro. Assine para destacar sua oficina com logo e galeria.
          </Text>
          <View style={{ height: 12 }} />
          <Button title="Ver planos" onPress={irParaPlanos} />
        </View>
      ) : null}

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <Text style={[styles.secaoLabel, { color: colors.textSecondary }]}>LOGO</Text>
          <View style={styles.logoRow}>
            <Pressable
              onPress={() => escolherEEnviar('LOGO')}
              style={[styles.logoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {enviando === 'LOGO' ? (
                <ActivityIndicator color={colors.primary} />
              ) : logo ? (
                <Image source={{ uri: getUrlImagem(logo.UrlImagem) }} style={styles.logoImagem} />
              ) : (
                <Camera size={28} color={colors.textSecondary} />
              )}
            </Pressable>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.logoTitulo, { color: colors.text }]}>
                {logo ? 'Sua logo' : 'Sem logo ainda'}
              </Text>
              <Text style={[styles.logoDica, { color: colors.textSecondary }]}>
                Aparece como foto principal no card da sua oficina. Enviar outra substitui a atual.
              </Text>
              <View style={{ height: 10 }} />
              <Button
                title={logo ? 'Trocar logo' : 'Adicionar logo'}
                variant="outline"
                onPress={() => escolherEEnviar('LOGO')}
                disabled={enviando !== null}
              />
            </View>
          </View>

          <View style={styles.galeriaHeader}>
            <Text style={[styles.secaoLabel, { color: colors.textSecondary, marginBottom: 0 }]}>GALERIA</Text>
            <Text style={[styles.contador, { color: colors.textSecondary }]}>
              {galeria.length}/{LIMITE_GALERIA}
            </Text>
          </View>

          <View style={styles.grid}>
            {galeria.map((img) => (
              <View key={img.IdImagem} style={{ width: tamanhoTile, height: tamanhoTile }}>
                <Image source={{ uri: getUrlImagem(img.UrlImagem) }} style={styles.tileImagem} />
                <Pressable
                  onPress={() => confirmarRemocao(img)}
                  hitSlop={6}
                  style={[styles.remover, { backgroundColor: 'rgba(0,0,0,0.65)' }]}
                >
                  <X size={14} color="#FEFEFE" />
                </Pressable>
              </View>
            ))}

            {galeria.length < LIMITE_GALERIA ? (
              <Pressable
                onPress={() => escolherEEnviar('GALERIA')}
                disabled={enviando !== null}
                style={[
                  styles.tileAdicionar,
                  { width: tamanhoTile, height: tamanhoTile, borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              >
                {enviando === 'GALERIA' ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Plus size={26} color={colors.textSecondary} />
                )}
              </Pressable>
            ) : null}
          </View>
        </>
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, marginBottom: 20 },
  aviso: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  avisoTexto: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  secaoLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 96, height: 96, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  logoImagem: { width: '100%', height: '100%' },
  logoTitulo: { fontSize: 15, fontWeight: '800' },
  logoDica: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  galeriaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  contador: { fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tileImagem: { width: '100%', height: '100%', borderRadius: 12 },
  tileAdicionar: { borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  remover: {
    position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 16 },
});