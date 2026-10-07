import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Image, Pressable, Modal, ActivityIndicator, Alert,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MapPin, Copy, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import {
  buscarEnderecoOficina, listarServicosOficina, listarImagensOficina,
} from '../../api/oficinaPublica.api';
import { getUrlImagem } from '../../utils/media';
import { abrirWhatsApp, abrirNoMapa } from '../../utils/contato';
import MiniMapa from '../../components/MiniMapa';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';

export default function OficinaPerfilScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { oficina } = route.params;

  const [imagens, setImagens] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [endereco, setEndereco] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoAberta, setFotoAberta] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const timerCopiado = useRef(null);

  useEffect(() => {
    (async () => {
      const [img, serv, end] = await Promise.allSettled([
        listarImagensOficina(oficina.IdOficina),
        listarServicosOficina(oficina.IdOficina),
        buscarEnderecoOficina(oficina.IdOficina),
      ]);
      if (img.status === 'fulfilled') setImagens(img.value);
      if (serv.status === 'fulfilled') setServicos(serv.value);
      if (end.status === 'fulfilled') setEndereco(end.value);
      setCarregando(false);
    })();
    return () => clearTimeout(timerCopiado.current);
  }, [oficina.IdOficina]);

  const logo = imagens.find((i) => i.TipoImagem === 'LOGO');
  const galeria = imagens.filter((i) => i.TipoImagem === 'GALERIA');
  const tile = (width - 48 - 8) / 3;

  const porCategoria = servicos.reduce((acc, s) => {
    const cat = s.Categoria || 'Outros';
    (acc[cat] = acc[cat] || []).push(s.NomeServico || s.Nome || s.nome);
    return acc;
  }, {});

  const linhaEndereco = endereco
    ? [
        [endereco.Rua || endereco.Logradouro, endereco.Numero].filter(Boolean).join(', '),
        endereco.Bairro || oficina.Bairro,
        endereco.Cidade || oficina.Cidade,
      ].filter(Boolean).join(' - ')
    : [oficina.Bairro, oficina.Cidade].filter(Boolean).join(' - ');

  async function falarNoWhatsApp() {
    try {
      await abrirWhatsApp(oficina.Telefone, oficina.NomeOficina);
    } catch {
      Alert.alert('Não foi possível abrir o WhatsApp', 'Verifique se o aplicativo está instalado.');
    }
  }

  async function copiarEndereco() {
    const cep = endereco?.CEP || endereco?.Cep;
    await Clipboard.setStringAsync(cep ? `${linhaEndereco} - CEP ${cep}` : linhaEndereco);
    setCopiado(true);
    clearTimeout(timerCopiado.current);
    timerCopiado.current = setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.topo}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        {/* Cabeçalho estilo perfil */}
        <View style={styles.cabecalho}>
          <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            {logo ? (
              <Image source={{ uri: getUrlImagem(logo.UrlImagem) }} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.inicial, { color: colors.textSecondary }]}>
                {oficina.NomeOficina?.charAt(0)?.toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={[styles.nome, { color: colors.text }]}>{oficina.NomeOficina}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {[
              oficina.distanciaKm != null ? `${oficina.distanciaKm} km` : null,
              oficina.FaixaPreco,
              [oficina.Bairro, oficina.Cidade].filter(Boolean).join(', '),
            ].filter(Boolean).join(' · ')}
          </Text>
          <View style={{ height: 16, alignSelf: 'stretch' }} />
          <View style={{ alignSelf: 'stretch' }}>
            <Button title="Falar no WhatsApp" onPress={falarNoWhatsApp} />
          </View>
        </View>

        <View style={styles.corpo}>
          {carregando ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <>
              {galeria.length ? (
                <>
                  <Text style={[styles.secao, { color: colors.textSecondary }]}>FOTOS</Text>
                  <View style={styles.grid}>
                    {galeria.map((f) => (
                      <Pressable key={f.IdImagem} onPress={() => setFotoAberta(f)}>
                        <Image
                          source={{ uri: getUrlImagem(f.UrlImagem) }}
                          style={{ width: tile, height: tile, borderRadius: 8 }}
                        />
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              <Text style={[styles.secao, { color: colors.textSecondary }]}>SERVIÇOS</Text>
              {Object.keys(porCategoria).length ? (
                Object.entries(porCategoria).map(([cat, nomes]) => (
                  <View key={cat} style={{ marginBottom: 14 }}>
                    <Text style={[styles.categoria, { color: colors.text }]}>{cat}</Text>
                    <View style={styles.chips}>
                      {nomes.map((n) => (
                        <View key={n} style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={[styles.chipTexto, { color: colors.text }]}>{n}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: colors.textSecondary }}>Esta oficina ainda não cadastrou serviços.</Text>
              )}

              <Text style={[styles.secao, { color: colors.textSecondary }]}>LOCALIZAÇÃO</Text>
              <View style={styles.enderecoRow}>
                <MapPin size={16} color={colors.primary} />
                <Text style={[styles.endereco, { color: colors.text }]}>{linhaEndereco}</Text>
                <Pressable onPress={copiarEndereco} hitSlop={10} style={styles.copiar}>
                  <Copy size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
              {copiado ? (
                <Text style={[styles.copiado, { color: colors.primary }]}>Endereço copiado para a área de transferência</Text>
              ) : null}

              <MiniMapa latitude={oficina.Latitude} longitude={oficina.Longitude} />
              <View style={{ height: 12 }} />
              <Button
                title="Abrir no mapa"
                variant="outline"
                onPress={() => abrirNoMapa(oficina.Latitude, oficina.Longitude)}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Foto em tela cheia */}
      <Modal visible={!!fotoAberta} transparent animationType="fade" onRequestClose={() => setFotoAberta(null)}>
        <View style={styles.viewer}>
          {fotoAberta ? (
            <Image
              source={{ uri: getUrlImagem(fotoAberta.UrlImagem) }}
              style={{ width, height: width * 1.2 }}
              resizeMode="contain"
            />
          ) : null}
          <Pressable onPress={() => setFotoAberta(null)} style={styles.fechar} hitSlop={10}>
            <X size={24} color="#FEFEFE" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topo: { paddingTop: 56, paddingHorizontal: 16 },
  cabecalho: { alignItems: 'center', paddingHorizontal: 24, marginTop: 4 },
  avatar: {
    width: 112, height: 112, borderRadius: 56, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  inicial: { fontSize: 44, fontWeight: '800' },
  nome: { fontSize: 22, fontWeight: '800', marginTop: 14, textAlign: 'center' },
  meta: { fontSize: 13.5, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  corpo: { paddingHorizontal: 24 },
  secao: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginTop: 28, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  categoria: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  chipTexto: { fontSize: 12.5, fontWeight: '600' },
  enderecoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  endereco: { fontSize: 14, flex: 1 },
  copiar: { padding: 4 },
  copiado: { fontSize: 12.5, fontWeight: '700', marginBottom: 10 },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  fechar: { position: 'absolute', top: 56, right: 20 },
});