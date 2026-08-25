import { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { buscarOficinas } from '../../api/oficina.api';
import { listarImagensDaOficina } from '../../api/imagem.api';
import { listarServicosDaOficina } from '../../api/oficinaServico.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { getUrlImagem } from '../../utils/media';
import { useLocalizacao } from '../../utils/useLocalizacao';
import OficinaCard from '../../components/OficinaCard';
import FiltroServicoModal from '../../components/FiltroServicoModal';
import BackButton from '../../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OficinasScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { coords, status: statusLocalizacao } = useLocalizacao();

  const [oficinas, setOficinas] = useState([]);
  const [extras, setExtras] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [filtroAberto, setFiltroAberto] = useState(false);
  const [idServicoFiltro, setIdServicoFiltro] = useState(null);
  const [nomeServicoFiltro, setNomeServicoFiltro] = useState('');

  async function carregar(idServico) {
    setCarregando(true);
    try {
      const lista = await buscarOficinas({
        idServico,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setOficinas(lista);

      const entradas = await Promise.all(
        lista.map(async (of) => {
          try {
            const [imagens, servicos] = await Promise.all([
              listarImagensDaOficina(of.IdOficina),
              listarServicosDaOficina(of.IdOficina),
            ]);
            const logo = imagens.find((i) => i.TipoImagem === 'LOGO') || imagens[0];
            return [of.IdOficina, { fotoUrl: logo ? getUrlImagem(logo.UrlImagem) : null, servicos }];
          } catch {
            return [of.IdOficina, { fotoUrl: null, servicos: [] }];
          }
        })
      );
      setExtras(Object.fromEntries(entradas));
      setErro('');
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      // Só busca quando a permissão de localização já foi resolvida
      // (concedida com coords, ou negada/erro -> cai no fallback do SENAC)
      if (statusLocalizacao !== 'carregando') {
        carregar(idServicoFiltro);
      }
    }, [idServicoFiltro, statusLocalizacao, coords])
  );

  function selecionarFiltro(idServico, nomeServico) {
    setIdServicoFiltro(idServico);
    setNomeServicoFiltro(idServico ? nomeServico : '');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Pressable
          onPress={() => setFiltroAberto(true)}
          style={[styles.filtroBotao, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
            {nomeServicoFiltro || 'Filtro'}
          </Text>
          <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>⌄</Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Oficinas</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {carregando
          ? 'Buscando...'
          : statusLocalizacao === 'negada'
          ? `${oficinas.length} encontradas perto do SENAC`
          : `${oficinas.length} encontradas perto de você`}
      </Text>

      {statusLocalizacao === 'negada' && (
        <Text style={[styles.avisoLocalizacao, { color: colors.textSecondary }]}>
          Localização não autorizada — mostrando resultados perto do SENAC.
        </Text>
      )}

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={oficinas}
          keyExtractor={(item) => String(item.IdOficina)}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={
            <Text style={[styles.vazio, { color: colors.textSecondary }]}>
              Nenhuma oficina encontrada com esse filtro.
            </Text>
          }
          renderItem={({ item }) => (
            <OficinaCard
              oficina={item}
              fotoUrl={extras[item.IdOficina]?.fotoUrl}
              servicos={extras[item.IdOficina]?.servicos || []}
              onPress={() => {}}
            />
          )}
        />
      )}

      {erro ? <Text style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

      <FiltroServicoModal
        visivel={filtroAberto}
        onFechar={() => setFiltroAberto(false)}
        onSelecionar={selecionarFiltro}
        idServicoSelecionado={idServicoFiltro}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filtroBotao: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxWidth: 160 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 20 },
  subtitle: { fontSize: 14, marginTop: 4 },
  avisoLocalizacao: { fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  vazio: { textAlign: 'center', marginTop: 40 },
  erro: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});