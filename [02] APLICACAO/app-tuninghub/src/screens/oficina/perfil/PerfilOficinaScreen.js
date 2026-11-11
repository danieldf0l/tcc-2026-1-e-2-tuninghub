import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { abrirEmailSuporte } from '../../../utils/contato';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, MapPin, CreditCard, Camera, ShieldCheck, FileText, Info, HelpCircle,
  MessageSquareWarning, LogOut, Lock, Trash2, Crown, ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useAssinaturaOficina } from '../../../hooks/useAssinaturaOficina';
import MenuSection from '../../../components/MenuSection';
import MenuListItem from '../../../components/MenuListItem';

export default function PerfilOficinaScreen({ navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario, sair } = useAuth();
  const { temPlanoPro, pendente, planoVencido } = useAssinaturaOficina();

  const nome = usuario?.NomeOficina || 'Oficina';
  const email = usuario?.Email || '';
  const versao = Constants.expoConfig?.version || '1.0.0';

  const selo = temPlanoPro
    ? { texto: 'Pro', cor: colors.primary, fundo: colors.primarySoft }
    : pendente
    ? { texto: 'Pagamento pendente', cor: colors.warning, fundo: colors.warningSoft }
    : planoVencido
    ? { texto: 'Pro vencido', cor: colors.danger, fundo: colors.dangerSoft }
    : { texto: 'Gratuito', cor: colors.textSecondary, fundo: colors.surfaceElevated };

  function confirmarSaida() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: layout.screenPadding, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.h1, styles.titulo, { color: colors.text }]}>Perfil</Text>

      <Pressable
        onPress={() => navigation.navigate('MeusDadosOficina')}
        accessibilityRole="button"
        accessibilityLabel="Abrir meus dados"
        style={({ pressed }) => [
          styles.cabecalho,
          {
            backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary, borderRadius: radius.pill }]}>
          <Text style={[styles.avatarTexto, { color: colors.textOnPrimary, fontFamily: fonts.extrabold }]}>
            {nome.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cabecalhoTextos}>
          <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>{nome}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]} numberOfLines={1}>
            {email}
          </Text>
          <View style={[styles.selo, { backgroundColor: selo.fundo, borderRadius: radius.pill }]}>
            <Crown size={12} color={selo.cor} strokeWidth={2.5} />
            <Text style={[styles.seloTexto, { color: selo.cor, fontFamily: fonts.bold }]}>{selo.texto}</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textSecondary} />
      </Pressable>

      <MenuSection title="Minha oficina">
        <MenuListItem
          Icone={User}
          titulo="Meus dados"
          subtitulo="Nome, contato e faixa de preço"
          onPress={() => navigation.navigate('MeusDadosOficina')}
        />
        <MenuListItem
          Icone={MapPin}
          titulo="Endereço"
          subtitulo="Localização da oficina"
          onPress={() => navigation.navigate('EnderecoOficina')}
        />
        <MenuListItem
          Icone={Camera}
          titulo="Fotos da oficina"
          subtitulo={temPlanoPro ? 'Logo e galeria' : 'Recurso do plano Pro'}
          onPress={() => navigation.navigate('FotosOficina')}
        />
        <MenuListItem
          Icone={CreditCard}
          titulo="Meu plano"
          subtitulo={selo.texto === 'Pro' ? 'Plano Pro ativo' : selo.texto}
          onPress={() => navigation.navigate('MinhaAssinatura')}
          ultimo
        />
      </MenuSection>

      <MenuSection title="Conta e segurança">
        <MenuListItem Icone={Lock} titulo="Alterar senha" onPress={() => navigation.navigate('AlterarSenha')} />
        <MenuListItem
          Icone={Trash2}
          titulo="Excluir conta da oficina"
          subtitulo="Apaga seus dados definitivamente"
          onPress={() => navigation.navigate('ExcluirConta')}
          perigo
          ultimo
        />
      </MenuSection>

      <MenuSection title="Ajuda">
        <MenuListItem Icone={HelpCircle} titulo="Dúvidas frequentes" onPress={() => navigation.navigate('Ajuda')} />
        <MenuListItem
          Icone={MessageSquareWarning}
          titulo="Sugestões e problemas"
          onPress={() => abrirEmailSuporte('Sugestão / Problema no app TuningHub')}
          ultimo
        />
      </MenuSection>

      <MenuSection title="Sobre">
        <MenuListItem Icone={ShieldCheck} titulo="Política de Privacidade" onPress={() => navigation.navigate('Privacidade')} />
        <MenuListItem Icone={FileText} titulo="Termos de Uso" onPress={() => navigation.navigate('Termos')} />
        <MenuListItem Icone={Info} titulo="Sobre o aplicativo" subtitulo={`Versão ${versao}`} chevron={false} ultimo />
      </MenuSection>

      <MenuListItem Icone={LogOut} titulo="Sair da conta" onPress={confirmarSaida} perigo semCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { marginBottom: 16 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 14, marginBottom: 24 },
  avatar: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontSize: 22 },
  cabecalhoTextos: { flex: 1, marginLeft: 14, marginRight: 8, gap: 2 },
  selo: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  seloTexto: { fontSize: 11 },
});