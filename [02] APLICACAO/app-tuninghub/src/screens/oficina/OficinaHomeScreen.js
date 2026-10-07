import { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, Image, Pressable, StyleSheet, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Wrench, Camera, CreditCard, Store, Check, Circle, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAssinaturaOficina } from '../../hooks/useAssinaturaOficina';
import { buscarOficinas } from '../../api/oficina.api';
import { listarImagensDaOficina } from '../../api/imagem.api';
import { listarServicosDaOficina } from '../../api/oficinaServico.api';
import { getUrlImagem } from '../../utils/media';
import { getSaudacao } from '../../utils/saudacao';
import { formatarData } from '../../utils/formatters';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';
import Button from '../../components/Button';

const LIMITE_GALERIA = 6;

export default function OficinaHomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario } = useAuth();
  const { assinatura, temPlanoPro, verificar } = useAssinaturaOficina();
  const idOficina = usuario?.IdOficina;

  const [imagens, setImagens] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [dadosBusca, setDadosBusca] = useState(null); // item de /oficina/buscar desta oficina
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    verificar();
    const [img, serv, busca] = await Promise.allSettled([
      listarImagensDaOficina(idOficina),
      listarServicosDaOficina(idOficina),
      buscarOficinas({}),
    ]);
    if (img.status === 'fulfilled') setImagens(img.value);
    if (serv.status === 'fulfilled') setServicos(serv.value);
    if (busca.status === 'fulfilled') {
      setDadosBusca(busca.value.find((o) => String(o.IdOficina) === String(idOficina)) || null);
    }
    setCarregando(false);
    setAtualizando(false);
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [idOficina])
  );

  const nome = usuario?.NomeOficina || 'Oficina';
  const logo = imagens.find((i) => i.TipoImagem === 'LOGO');
  const totalGaleria = imagens.filter((i) => i.TipoImagem === 'GALERIA').length;
  const faixaPreco = dadosBusca?.FaixaPreco;

  const pendencias = [
    { ok: !!logo, texto: 'Enviar a logo da oficina', rota: 'FotosOficina' },
    { ok: servicos.length > 0, texto: 'Cadastrar os serviços oferecidos', rota: 'ServicosOficinaTab' },
    { ok: !!faixaPreco, texto: 'Definir a faixa de preço', rota: 'MeusDadosOficina' },
  ];
  const faltando = pendencias.filter((p) => !p.ok);

  const pendente = assinatura?.Status === 'PENDENTE';

  function abrirPerfilPublico() {
    if (!dadosBusca) {
      Alert.alert(
        'Perfil indisponível',
        'Cadastre o endereço da oficina para que ela apareça na busca e o perfil possa ser exibido.'
      );
      return;
    }
    navigation.navigate('OficinaPerfil', { oficina: { ...dadosBusca, distanciaKm: null } });
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={() => { setAtualizando(true); carregar(); }}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[styles.saudacao, { color: colors.textSecondary }]}>{getSaudacao()},</Text>
          <Text style={[styles.nome, { color: colors.text }]} numberOfLines={2}>{nome}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {logo ? (
            <Image source={{ uri: getUrlImagem(logo.UrlImagem) }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarTexto}>{nome.charAt(0).toUpperCase()}</Text>
          )}
        </View>
      </View>

      {/* Card do plano */}
      <View style={[styles.planoCard, { backgroundColor: colors.surface, borderColor: temPlanoPro ? colors.primary : colors.border }]}>
        <Text style={[styles.planoRotulo, { color: colors.textSecondary }]}>SEU PLANO</Text>
        <Text style={[styles.planoNome, { color: colors.text }]}>{assinatura?.NomePlano || '—'}</Text>

        {pendente ? (
          <>
            <Text style={[styles.planoTexto, { color: colors.textSecondary }]}>Aguardando confirmação do pagamento via PIX.</Text>
            <View style={{ height: 12 }} />
            <Button title="Verificar pagamento" onPress={() => navigation.navigate('MinhaAssinatura')} />
          </>
        ) : temPlanoPro ? (
          <Text style={[styles.planoTexto, { color: colors.textSecondary }]}>
            Ativo até {formatarData(assinatura.DataFim)}
          </Text>
        ) : (
          <>
            <Text style={[styles.planoTexto, { color: colors.textSecondary }]}>
              Com o plano Pro você envia a logo e a galeria de fotos e se destaca na busca.
            </Text>
            <View style={{ height: 12 }} />
            <Button title="Conhecer o plano Pro" onPress={() => navigation.navigate('MinhaAssinatura')} />
          </>
        )}
      </View>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard valor={servicos.length} rotulo="Serviços oferecidos" Icone={Wrench} destaque={servicos.length === 0} />
            <View style={{ width: 12 }} />
            <StatCard valor={`${totalGaleria}/${LIMITE_GALERIA}`} rotulo="Fotos na galeria" Icone={Camera} />
          </View>

          {faltando.length > 0 ? (
            <View style={[styles.checklist, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.secaoTitulo, { color: colors.text, marginBottom: 4 }]}>Complete seu perfil</Text>
              <Text style={[styles.planoTexto, { color: colors.textSecondary, marginBottom: 8 }]}>
                Perfis completos passam mais confiança para quem busca uma oficina.
              </Text>
              {pendencias.map((p) => (
                <Pressable
                  key={p.texto}
                  disabled={p.ok}
                  onPress={() => navigation.navigate(p.rota)}
                  style={styles.checkItem}
                >
                  {p.ok ? <Check size={18} color={colors.primary} /> : <Circle size={18} color={colors.textSecondary} />}
                  <Text
                    style={[
                      styles.checkTexto,
                      { color: p.ok ? colors.textSecondary : colors.text, textDecorationLine: p.ok ? 'line-through' : 'none' },
                    ]}
                  >
                    {p.texto}
                  </Text>
                  {!p.ok ? <ChevronRight size={16} color={colors.textSecondary} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      )}

      <View style={styles.secao}>
        <Text style={[styles.secaoTitulo, { color: colors.text }]}>Atalhos</Text>
        <QuickActionCard
          Icone={Store}
          titulo="Ver meu perfil público"
          subtitulo="Como os Entusiastas enxergam sua oficina"
          corFundo={colors.primary}
          onPress={abrirPerfilPublico}
        />
        <QuickActionCard
          Icone={Wrench}
          titulo="Meus serviços"
          subtitulo="Escolha o que sua oficina oferece"
          corFundo={colors.secondary}
          onPress={() => navigation.navigate('ServicosOficinaTab')}
        />
        <QuickActionCard
          Icone={Camera}
          titulo="Fotos da oficina"
          subtitulo="Logo e galeria"
          corFundo={colors.secondary}
          onPress={() => navigation.navigate('FotosOficina')}
        />
        <QuickActionCard
          Icone={CreditCard}
          titulo="Meu plano"
          subtitulo="Assinatura e pagamento"
          corFundo={colors.secondary}
          onPress={() => navigation.navigate('MinhaAssinatura')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  saudacao: { fontSize: 15, fontWeight: '500' },
  nome: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarTexto: { color: '#FEFEFE', fontSize: 20, fontWeight: '800' },
  planoCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 20 },
  planoRotulo: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  planoNome: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  planoTexto: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  checklist: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  checkTexto: { flex: 1, fontSize: 14, fontWeight: '600', marginLeft: 10 },
  secao: { marginTop: 8, marginBottom: 12 },
  secaoTitulo: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
});