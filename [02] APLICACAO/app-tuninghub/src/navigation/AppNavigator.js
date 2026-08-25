import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProjetosScreen from '../screens/projeto/ProjetosScreen';
import EscolhaCarroScreen from '../screens/projeto/EscolhaCarroScreen';
import EscolhaEstiloScreen from '../screens/projeto/EscolhaEstiloScreen';
import ProjetoDetalheScreen from '../screens/projeto/ProjetoDetalheScreen';
import AdicionarServicoScreen from '../screens/projeto/AdicionarServicoScreen';
import OficinasScreen from '../screens/oficina/OficinasScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Projetos" component={ProjetosScreen} />
      <Stack.Screen name="EscolhaCarro" component={EscolhaCarroScreen} />
      <Stack.Screen name="EscolhaEstilo" component={EscolhaEstiloScreen} />
      <Stack.Screen name="ProjetoDetalhe" component={ProjetoDetalheScreen} />
      <Stack.Screen name="AdicionarServico" component={AdicionarServicoScreen} />
      <Stack.Screen name="Oficinas" component={OficinasScreen} />
    </Stack.Navigator>
  );
}