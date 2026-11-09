import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { getStackScreenOptions } from './navigationOptions';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';
import ConfirmarEmailScreen from '../screens/auth/ConfirmarEmailScreen';
import EsqueciSenhaScreen from '../screens/auth/EsqueciSenhaScreen';
import RedefinirSenhaScreen from '../screens/auth/RedefinirSenhaScreen';
import PrivacidadeScreen from '../screens/perfil/PrivacidadeScreen';
import TermosScreen from '../screens/perfil/TermosScreen';
import CadastroOficinaAcessoScreen from '../screens/auth/oficina/CadastroOficinaAcessoScreen';
import CadastroOficinaDadosScreen from '../screens/auth/oficina/CadastroOficinaDadosScreen';
import CadastroOficinaEnderecoScreen from '../screens/auth/oficina/CadastroOficinaEnderecoScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={getStackScreenOptions({ colors })}>
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="ConfirmarEmail" component={ConfirmarEmailScreen} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
      <Stack.Screen name="RedefinirSenha" component={RedefinirSenhaScreen} />
      <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
      <Stack.Screen name="Termos" component={TermosScreen} />
      <Stack.Screen name="CadastroOficinaAcesso" component={CadastroOficinaAcessoScreen} />
      <Stack.Screen name="CadastroOficinaDados" component={CadastroOficinaDadosScreen} />
      <Stack.Screen name="CadastroOficinaEndereco" component={CadastroOficinaEnderecoScreen} />
    </Stack.Navigator>
  );
}