import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, ShieldCheck, FileText, Info, HelpCircle, MessageSquareWarning, LogOut, Lock, Trash2, Archive, Car, ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { abrirEmailSuporte } from '../../utils/contato';
import MenuSection from '../../components/MenuSection';
import MenuListItem from '../../components/MenuListItem';

export default function PerfilScreen({ navigation }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario, sair } = useAuth();

  const nome = usuario?.Nome || usuario?.nome || 'Entusiasta';
  const email = usuario?.Email || usuario?.email || '';
  const versao = Constants.expoConfig?.version || '1.0.0';

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
        onPress={() => navigation.navigate('MeusDados')}
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
          <View style={[styles.selo, { backgroundColor: colors.primarySoft, borderRadius: radius.pill }]}>
            <Car size={12} color={colors.primary} strokeWidth={2.5} />
            <Text style={[styles.seloTexto, { color: colors.primary, fontFamily: fonts.bold }]}>Entusiasta</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textSecondary} />
      </Pressable>

      <MenuSection title="Minha conta">
        <MenuListItem
          Icone={User}
          titulo="Meus dados"
          subtitulo="Nome e e-mail"
          onPress={() => navigation.navigate('MeusDados')}
        />
        <MenuListItem
          Icone={Archive}
          titulo="Projetos arquivados"
          subtitulo="Desarquive ou exclua de vez"
          onPress={() => navigation.navigate('ProjetosArquivados')}
          ultimo
        />
      </MenuSection>

      <MenuSection title="Conta e segurança">
        <MenuListItem Icone={Lock} titulo="Alterar senha" onPress={() => navigation.navigate('AlterarSenha')} />
        <MenuListItem
          Icone={Trash2}
          titulo="Excluir minha conta"
          subtitulo="Apaga seus dados definitivamente"
          onPress={() => navigation.navigate('ExcluirConta')}
          perigo
          ultimo
        />
      </MenuSection>

      <MenuSection title="Ajuda">
        <MenuListItem
          Icone={HelpCircle}
          titulo="Dúvidas frequentes"
          subtitulo="Tire suas dúvidas sobre o app"
          onPress={() => navigation.navigate('Ajuda')}
        />
        <MenuListItem
          Icone={MessageSquareWarning}
          titulo="Sugestões e problemas"
          subtitulo="Fale com a nossa equipe"
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