import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Wrench, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { getTabScreenOptions, getStackScreenOptions } from './navigationOptions';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import OficinaHomeScreen from '../screens/oficina/OficinaHomeScreen';
import PerfilOficinaScreen from '../screens/oficina/perfil/PerfilOficinaScreen';
import MeusDadosOficinaScreen from '../screens/oficina/perfil/MeusDadosOficinaScreen';
import EnderecoOficinaScreen from '../screens/oficina/perfil/EnderecoOficinaScreen';
import PrivacidadeScreen from '../screens/perfil/PrivacidadeScreen';
import TermosScreen from '../screens/perfil/TermosScreen';
import AjudaScreen from '../screens/perfil/AjudaScreen';
import MeusServicosScreen from '../screens/oficina/servicos/MeusServicosScreen';
import MinhaAssinaturaScreen from '../screens/oficina/assinatura/MinhaAssinaturaScreen';
import FotosOficinaScreen from '../screens/oficina/imagens/FotosOficinaScreen';
import OficinaPerfilScreen from '../screens/oficina/OficinaPerfilScreen';
import ConfirmarTrocaEmailScreen from '../screens/perfil/ConfirmarTrocaEmailScreen';
import AlterarSenhaScreen from '../screens/perfil/AlterarSenhaScreen';
import ExcluirContaScreen from '../screens/perfil/ExcluirContaScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OficinaTabs() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator screenOptions={getTabScreenOptions({ colors, fonts, insets })}>
      <Tab.Screen
        name="InicioOficinaTab"
        component={OficinaHomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon Icone={Home} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ServicosOficinaTab"
        component={MeusServicosScreen}
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon Icone={Wrench} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfilOficinaTab"
        component={PerfilOficinaScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon Icone={User} color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function OficinaNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={getStackScreenOptions({ colors })}>
      <Stack.Screen name="OficinaMainTabs" component={OficinaTabs} />
      <Stack.Screen name="MeusDadosOficina" component={MeusDadosOficinaScreen} />
      <Stack.Screen name="EnderecoOficina" component={EnderecoOficinaScreen} />
      <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
      <Stack.Screen name="Termos" component={TermosScreen} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} />
      <Stack.Screen name="MinhaAssinatura" component={MinhaAssinaturaScreen} />
      <Stack.Screen name="FotosOficina" component={FotosOficinaScreen} />
      <Stack.Screen name="OficinaPerfil" component={OficinaPerfilScreen} />
      <Stack.Screen name="ConfirmarTrocaEmail" component={ConfirmarTrocaEmailScreen} />
      <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} />
      <Stack.Screen name="ExcluirConta" component={ExcluirContaScreen} />
    </Stack.Navigator>
  );
}