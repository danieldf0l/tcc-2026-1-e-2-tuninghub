import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';
import PrivacidadeScreen from '../screens/perfil/PrivacidadeScreen';
import TermosScreen from '../screens/perfil/TermosScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
      <Stack.Screen name="Termos" component={TermosScreen} />
    </Stack.Navigator>
  );
}