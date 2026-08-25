import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProjetosScreen from '../screens/projeto/ProjetosScreen';
import EscolhaCarroScreen from '../screens/projeto/EscolhaCarroScreen';
import EscolhaEstiloScreen from '../screens/projeto/EscolhaEstiloScreen';
import ProjetoDetalheScreen from '../screens/projeto/ProjetoDetalheScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Projetos" component={ProjetosScreen} />
      <Stack.Screen name="EscolhaCarro" component={EscolhaCarroScreen} />
      <Stack.Screen name="EscolhaEstilo" component={EscolhaEstiloScreen} />
      <Stack.Screen name="ProjetoDetalhe" component={ProjetoDetalheScreen} />
    </Stack.Navigator>
  );
}