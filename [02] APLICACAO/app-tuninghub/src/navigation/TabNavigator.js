import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Car, MapPin, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import ProjetosScreen from '../screens/projeto/ProjetosScreen';
import OficinasScreen from '../screens/oficina/OficinasScreen';
import PerfilScreen from '../screens/perfil/PerfilScreen';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import { getTabScreenOptions } from './navigationOptions';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();

  return (
      <Tab.Navigator screenOptions={getTabScreenOptions({ colors, fonts, insets })}>
      <Tab.Screen
        name="InicioTab"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon Icone={Home} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProjetosTab"
        component={ProjetosScreen}
        options={{
          title: 'Projetos',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon Icone={Car} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="OficinasTab"
        component={OficinasScreen}
        options={{
          title: 'Oficinas',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon Icone={MapPin} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
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