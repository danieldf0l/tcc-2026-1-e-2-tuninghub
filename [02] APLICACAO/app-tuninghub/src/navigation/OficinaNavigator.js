import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import OficinaHomeScreen from '../screens/oficina/OficinaHomeScreen';
import PerfilOficinaScreen from '../screens/oficina/perfil/PerfilOficinaScreen';
import MeusDadosOficinaScreen from '../screens/oficina/perfil/MeusDadosOficinaScreen';
import EnderecoOficinaScreen from '../screens/oficina/perfil/EnderecoOficinaScreen';
import PrivacidadeScreen from '../screens/perfil/PrivacidadeScreen';
import TermosScreen from '../screens/perfil/TermosScreen';
import AjudaScreen from '../screens/perfil/AjudaScreen';
import { Home, Wrench, User } from 'lucide-react-native';
import MeusServicosScreen from '../screens/oficina/servicos/MeusServicosScreen';
import MinhaAssinaturaScreen from '../screens/oficina/assinatura/MinhaAssinaturaScreen';
import FotosOficinaScreen from '../screens/oficina/imagens/FotosOficinaScreen';
import OficinaPerfilScreen from '../screens/oficina/OficinaPerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OficinaTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        animation: 'fade',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OficinaMainTabs" component={OficinaTabs} />
      <Stack.Screen name="MeusDadosOficina" component={MeusDadosOficinaScreen} />
      <Stack.Screen name="EnderecoOficina" component={EnderecoOficinaScreen} />
      <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
      <Stack.Screen name="Termos" component={TermosScreen} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} />
      <Stack.Screen name="MinhaAssinatura" component={MinhaAssinaturaScreen} />
      <Stack.Screen name="FotosOficina" component={FotosOficinaScreen} />
      <Stack.Screen name="OficinaPerfil" component={OficinaPerfilScreen} />
    </Stack.Navigator>
  );
}