import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wrench, Camera, CreditCard, Store, Check, ChevronRight, Crown, Clock, CalendarX, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAssinaturaOficina } from '../../hooks/useAssinaturaOficina';
import { buscarPerfilPublicoOficina } from '../../api/oficinaPublica.api';
import { listarImagensDaOficina } from '../../api/imagem.api';
import { listarServicosDaOficina } from '../../api/oficinaServico.api';
import { getUrlImagem } from '../../utils/media';
import { getSaudacao } from '../../utils/saudacao';
import { formatarData } from '../../utils/formatters';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';

const LIMITE_GALERIA = 6;

export default function OficinaHomeScreen({ navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const { assinatura, temPlanoPro, planoVencido, diasRestantes, venceEmBreve, verificar } = useAssinaturaOficina();
  const idOficina = usuario?.IdOficina;

  const [imagens, setImagens] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [perfil, setPerfil] = useState(null); // perfil público (GET /oficina/:id)
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    verificar();
    const [img, serv, perf] = await Promise.allSettled([
      listarImagensDaOficina(idOficina),
      listarServicosDaOficina(idOficina),
      buscarPerfilPublicoOficina(idOficina),
    ]);
    if (img.status === 'fulfilled') setImagens(img.value || []);
    if (serv.status === 'fulfilled') setServicos(serv.value || []);
    setPerfil(perf.status === 'fulfilled' ? perf.value : null);
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
  const faixaPreco = perfil?.FaixaPreco;

  // A logo só entra na lista para quem tem Pro (sem Pro não há como enviar)
  const pendencias = [
    { ok: servicos.length > 0, texto: 'Cadastrar os serviços oferecidos', rota: 'ServicosOficinaTab' },
    { ok: !!faixaPreco, texto: 'Definir a faixa de preço', rota: 'MeusDadosOficina' },
    ...(temPlanoPro ? [{ ok: !!logo, texto: 'Enviar a logo da oficina', rota: 'FotosOficina' }] : []),
  ];
  const concluidas = pendencias.filter((p) => p.ok).length;
  const perfilCompleto = concluidas === pendencias.length;

  function abrirPerfilPublico() {
    if (!perfil) {
      Alert.alert('Perfil indisponível', 'Não foi possível carregar seu perfil público agora. Tente de novo em instantes.');
      return;
    }
    navigation.navigate('OficinaPerfil', { oficina: { ...perfil, distanciaKm: null } });
  }

  function renderPlano() {
    const pendente = assinatura?.Status === 'PENDENTE';

    let c;
    if (pendente) {
      c = {
        Icone: Clock, cor: colors.warning, fundo: colors.warningSoft, borda: colors.warning,
        titulo: 'Pagamento pendente',
        texto: 'Estamos aguardando a confirmação do seu PIX.',
        acao: 'Verificar pagamento', variante: 'primary',
      };
    } else if (planoVencido) {
      c = {
        Icone: CalendarX, cor: colors.danger, fundo: colors.dangerSoft, borda: colors.danger,
        titulo: 'Seu plano Pro venceu',
        texto: 'Sua logo, fotos e o botão de WhatsApp estão ocultos até você renovar. Nada foi apagado.',
        acao: 'Renovar plano', variante: 'primary',
      };
    } else if (temPlanoPro) {
      const textoVencimento =
        diasRestantes === 0
          ? 'Vence hoje. Renove para não perder o destaque.'
          : `Vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}. Renove para não perder o destaque.`;
      c = {
        Icone: Crown, cor: colors.primary, fundo: colors.primarySoft,
        borda: venceEmBreve ? colors.warning : colors.primary,
        titulo: assinatura?.NomePlano || 'Plano Pro',
        texto: venceEmBreve ? textoVencimento : `Ativo até ${formatarData(assinatura?.DataFim)}`,
        acao: venceEmBreve ? 'Renovar' : null, variante: 'primary',
      };
    } else {
      c = {
        Icone: Crown, cor: colors.textSecondary, fundo: colors.surfaceElevated, borda: colors.border,
        titulo: assinatura?.NomePlano || 'Plano gratuito',
        texto: 'Com o Pro, sua oficina mostra logo, até 6 fotos e um botão de WhatsApp no perfil.',
        acao: 'Conhecer o plano Pro', variante: 'outline',
      };
    }

    return (
      <View style={[styles.plano, { backgroundColor: colors.surface, borderColor: c.borda, borderRadius: radius.lg }]}>
        <View style={styles.planoTopo}>
          <View style={[styles.planoIcone, { backgroundColor: c.fundo, borderRadius: radius.md }]}>
            <c.Icone size={20} color={c.cor} strokeWidth={2.25} />
          </View>
          <View style={styles.flex}>
            <Text style={[typography.overline, { color: colors.textSecondary }]}>Seu plano</Text>
            <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>{c.titulo}</Text>
          </View>
        </View>
        <Text style={[typography.body, styles.planoTexto, { color: colors.textSecondary }]}>{c.texto}</Text>
        {c.acao ? (
          <View style={styles.planoAcao}>
            <Button title={c.acao} variant={c.variante} onPress={() => navigation.navigate('MinhaAssinatura')} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: layout.screenPadding, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={() => {
            setAtualizando(true);
            carregar();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTextos}>
          <Text style={[typography.body, { color: colors.textSecondary, fontFamily: fonts.medium }]}>{getSaudacao()},</Text>
          <Text style={[typography.h1, { color: colors.text }]} numberOfLines={2}>
            {nome}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('PerfilOficinaTab')}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          style={({ pressed }) => [
            styles.avatar,
            { backgroundColor: colors.primary, borderRadius: radius.pill, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          {logo ? (
            <Image source={{ uri: getUrlImagem(logo.UrlImagem) }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.avatarTexto, { color: colors.textOnPrimary, fontFamily: fonts.extrabold }]}>
              {nome.charAt(0).toUpperCase()}
            </Text>
          )}
        </Pressable>
      </View>

      {renderPlano()}

      {carregando ? (
        <>
          <View style={styles.statsRow}>
            <Skeleton height={112} borderRadius={radius.lg} style={styles.flex} />
            <View style={styles.gap} />
            <Skeleton height={112} borderRadius={radius.lg} style={styles.flex} />
          </View>
          <Skeleton height={150} borderRadius={radius.lg} style={styles.skeletonChecklist} />
        </>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard
              valor={servicos.length}
              rotulo="Serviços oferecidos"
              Icone={Wrench}
              destaque={servicos.length === 0}
            />
            <View style={styles.gap} />
            {temPlanoPro ? (
              <StatCard valor={`${totalGaleria}/${LIMITE_GALERIA}`} rotulo="Fotos na galeria" Icone={Camera} />
            ) : (
              <StatCard valor="Pro" rotulo="Fotos e logo" Icone={Lock} />
            )}
          </View>

          {!perfilCompleto ? (
            <View
              style={[styles.checklist, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
            >
              <View style={styles.checklistTopo}>
                <Text style={[typography.h3, { color: colors.text }]}>Complete seu perfil</Text>
                <Text style={[typography.caption, { color: colors.primary, fontFamily: fonts.bold }]}>
                  {concluidas} de {pendencias.length}
                </Text>
              </View>
              <Text style={[typography.caption, styles.checklistTexto, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Perfis completos passam mais confiança para quem busca uma oficina.
              </Text>

              {pendencias.map((p) => (
                <Pressable
                  key={p.texto}
                  disabled={p.ok}
                  onPress={() => navigation.navigate(p.rota)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.checkItem, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    style={[
                      styles.checkCirculo,
                      { borderColor: p.ok ? colors.success : colors.placeholder, backgroundColor: p.ok ? colors.success : 'transparent' },
                    ]}
                  >
                    {p.ok ? <Check size={12} color={colors.textOnPrimary} strokeWidth={3.5} /> : null}
                  </View>
                  <Text
                    style={[
                      typography.body,
                      styles.flex,
                      {
                        color: p.ok ? colors.textSecondary : colors.text,
                        fontFamily: p.ok ? fonts.regular : fonts.medium,
                        textDecorationLine: p.ok ? 'line-through' : 'none',
                      },
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

      <Text style={[typography.h3, styles.secaoTitulo, { color: colors.text }]}>Atalhos</Text>
      <QuickActionCard
        Icone={Store}
        titulo="Ver meu perfil público"
        subtitulo="Como os Entusiastas enxergam sua oficina"
        onPress={abrirPerfilPublico}
      />
      <QuickActionCard
        Icone={Wrench}
        titulo="Meus serviços"
        subtitulo="Escolha o que sua oficina oferece"
        onPress={() => navigation.navigate('ServicosOficinaTab')}
      />
      <QuickActionCard
        Icone={Camera}
        titulo="Fotos da oficina"
        subtitulo={temPlanoPro ? 'Logo e galeria' : 'Recurso do plano Pro'}
        onPress={() => navigation.navigate('FotosOficina')}
      />
      <QuickActionCard
        Icone={CreditCard}
        titulo="Meu plano"
        subtitulo="Assinatura e pagamento"
        onPress={() => navigation.navigate('MinhaAssinatura')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { width: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTextos: { flex: 1, marginRight: 12 },
  avatar: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarTexto: { fontSize: 20 },
  plano: { borderWidth: 1.5, padding: 16, marginBottom: 20 },
  planoTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planoIcone: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  planoTexto: { marginTop: 12 },
  planoAcao: { marginTop: 14 },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  skeletonChecklist: { marginBottom: 20 },
  checklist: { borderWidth: 1, padding: 16, marginBottom: 24 },
  checklistTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checklistTexto: { marginTop: 4, marginBottom: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkCirculo: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  secaoTitulo: { marginBottom: 12 },
});