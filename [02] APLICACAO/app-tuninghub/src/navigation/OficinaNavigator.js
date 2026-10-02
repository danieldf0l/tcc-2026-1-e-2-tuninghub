import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OficinaHomeScreen from '../screens/oficina/OficinaHomeScreen';

const Stack = createNativeStackNavigator();

export default function OficinaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OficinaHome" component={OficinaHomeScreen} />
    </Stack.Navigator>
  );
}