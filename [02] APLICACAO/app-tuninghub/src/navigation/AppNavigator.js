import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import EscolhaCarroScreen from '../screens/projeto/EscolhaCarroScreen';
import EscolhaEstiloScreen from '../screens/projeto/EscolhaEstiloScreen';
import ProjetoDetalheScreen from '../screens/projeto/ProjetoDetalheScreen';
import AdicionarServicoScreen from '../screens/projeto/AdicionarServicoScreen';
import ProjetosArquivadosScreen from '../screens/projeto/ProjetosArquivadosScreen';
import MeusDadosScreen from '../screens/perfil/MeusDadosScreen';
import ConfirmarTrocaEmailScreen from '../screens/perfil/ConfirmarTrocaEmailScreen';
import AlterarSenhaScreen from '../screens/perfil/AlterarSenhaScreen';
import ExcluirContaScreen from '../screens/perfil/ExcluirContaScreen';
import PrivacidadeScreen from '../screens/perfil/PrivacidadeScreen';
import TermosScreen from '../screens/perfil/TermosScreen';
import AjudaScreen from '../screens/perfil/AjudaScreen';
import OficinaPerfilScreen from '../screens/oficina/OficinaPerfilScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="EscolhaCarro" component={EscolhaCarroScreen} />
      <Stack.Screen name="EscolhaEstilo" component={EscolhaEstiloScreen} />
      <Stack.Screen name="ProjetoDetalhe" component={ProjetoDetalheScreen} />
      <Stack.Screen name="AdicionarServico" component={AdicionarServicoScreen} />
      <Stack.Screen name="ProjetosArquivados" component={ProjetosArquivadosScreen} />
      <Stack.Screen name="MeusDados" component={MeusDadosScreen} />
      <Stack.Screen name="ConfirmarTrocaEmail" component={ConfirmarTrocaEmailScreen} />
      <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} />
      <Stack.Screen name="ExcluirConta" component={ExcluirContaScreen} />
      <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
      <Stack.Screen name="Termos" component={TermosScreen} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} />
      <Stack.Screen name="OficinaPerfil" component={OficinaPerfilScreen} />
    </Stack.Navigator>
  );
}