import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import EscolhaCarroScreen from '../screens/projeto/EscolhaCarroScreen';
import EscolhaEstiloScreen from '../screens/projeto/EscolhaEstiloScreen';
import ProjetoDetalheScreen from '../screens/projeto/ProjetoDetalheScreen';
import AdicionarServicoScreen from '../screens/projeto/AdicionarServicoScreen';
import MeusDadosScreen from '../screens/perfil/MeusDadosScreen';
import PrivacidadeScreen from '../screens/perfil/PrivacidadeScreen';
import TermosScreen from '../screens/perfil/TermosScreen';
import AjudaScreen from '../screens/perfil/AjudaScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="EscolhaCarro" component={EscolhaCarroScreen} />
      <Stack.Screen name="EscolhaEstilo" component={EscolhaEstiloScreen} />
      <Stack.Screen name="ProjetoDetalhe" component={ProjetoDetalheScreen} />
      <Stack.Screen name="AdicionarServico" component={AdicionarServicoScreen} />
      <Stack.Screen name="MeusDados" component={MeusDadosScreen} />
      <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
      <Stack.Screen name="Termos" component={TermosScreen} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} />
    </Stack.Navigator>
  );
}