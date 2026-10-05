import { View, Text, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import MenuSection from '../../../components/MenuSection';
import MenuListItem from '../../../components/MenuListItem';
import { User, MapPin, CreditCard, ShieldCheck, FileText, Info, HelpCircle, MessageSquareWarning, LogOut } from 'lucide-react-native';

const EMAIL_SUPORTE = 'suporte@tuninghub.com';

export default function PerfilOficinaScreen({ navigation }) {
  const { colors } = useTheme();
  const { usuario, sair } = useAuth();

  const nome = usuario?.NomeOficina || 'Oficina';
  const email = usuario?.Email || '';
  const versao = Constants.expoConfig?.version || '1.0.0';

  async function abrirEmailSuporte(assunto) {
    const url = `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(assunto)}`;
    try {
      const suportado = await Linking.canOpenURL(url);
      if (suportado) {
        await Linking.openURL(url);
      } else {
        Alert.alert('E-mail não configurado', `Entre em contato pelo e-mail: ${EMAIL_SUPORTE}`);
      }
    } catch {
      Alert.alert('E-mail não configurado', `Entre em contato pelo e-mail: ${EMAIL_SUPORTE}`);
    }
  }

  function confirmarSaida() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarTexto}>{nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={[styles.nome, { color: colors.text }]} numberOfLines={1}>{nome}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>{email}</Text>
        </View>
      </View>

      <MenuSection title="Minha Oficina">
        <MenuListItem
          Icone={User}
          titulo="Meus dados"
          subtitulo="Nome, CNPJ, faixa de preço..."
          onPress={() => navigation.navigate('MeusDadosOficina')}
        />
        <MenuListItem
          Icone={MapPin}
          titulo="Endereço"
          subtitulo="Localização e raio de atuação"
          onPress={() => navigation.navigate('EnderecoOficina')}
          ultimo
        />
      </MenuSection>

      <MenuSection title="Segurança e Suporte">
        <MenuListItem
          Icone={HelpCircle}
          titulo="Dúvidas frequentes"
          onPress={() => navigation.navigate('Ajuda')}
        />
        <MenuListItem
          Icone={MessageSquareWarning}
          titulo="Sugestões e problemas"
          onPress={() => abrirEmailSuporte('Sugestão / Problema no app TuningHub')}
          ultimo
        />
      </MenuSection>

      <MenuSection title="Privacidade e Dados">
        <MenuListItem
          Icone={ShieldCheck}
          titulo="Política de Privacidade"
          onPress={() => navigation.navigate('Privacidade')}
        />
        <MenuListItem
          Icone={FileText}
          titulo="Termos de Uso"
          onPress={() => navigation.navigate('Termos')}
        />
        <MenuListItem
          Icone={Info}
          titulo="Sobre o aplicativo"
          subtitulo={`Versão ${versao}`}
          chevron={false}
          ultimo
        />
        <MenuListItem
          Icone={User}
          titulo="Meus dados"
          subtitulo="Nome, CNPJ, faixa de preço..."
          onPress={() => navigation.navigate('MeusDadosOficina')}
        />
        <MenuListItem
          Icone={CreditCard}
          titulo="Meu plano"
          subtitulo="Assinatura e pagamento"
          onPress={() => navigation.navigate('MinhaAssinatura')}
        />
        <MenuListItem
          Icone={MapPin}
          titulo="Endereço"
          subtitulo="Localização e raio de atuação"
          onPress={() => navigation.navigate('EnderecoOficina')}
          ultimo
        />
      </MenuSection>

      <MenuListItem Icone={LogOut} titulo="Sair da conta" onPress={confirmarSaida} perigo semCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#FEFEFE', fontSize: 22, fontWeight: '800' },
  nome: { fontSize: 18, fontWeight: '800' },
  email: { fontSize: 13, marginTop: 2 },
});