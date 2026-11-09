import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, Wrench } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import Logo from '../../components/Logo';
import QuickActionCard from '../../components/QuickActionCard';

export default function RoleSelectScreen({ navigation }) {
  const { colors, typography, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const subir = fade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: layout.screenPadding,
        },
      ]}
    >
      <Animated.View style={{ opacity: fade, transform: [{ translateY: subir }] }}>
        <Logo tamanho={28} />
        <Text style={[typography.display, styles.titulo, { color: colors.text }]}>
          Seu carro do jeito que você imagina.
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Monte seu projeto de customização e encontre as oficinas certas perto de você.
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: fade }}>
        <Text style={[typography.overline, styles.pergunta, { color: colors.textSecondary }]}>
          Como você quer entrar?
        </Text>
        <QuickActionCard
          Icone={Car}
          titulo="Sou entusiasta"
          subtitulo="Quero customizar meu carro"
          onPress={() => navigation.navigate('Login', { tipo: 'usuario' })}
        />
        <QuickActionCard
          Icone={Wrench}
          titulo="Sou oficina"
          subtitulo="Quero receber novos clientes"
          onPress={() => navigation.navigate('Login', { tipo: 'oficina' })}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  titulo: { marginTop: 36, marginBottom: 12 },
  pergunta: { marginBottom: 12, marginLeft: 4 },
});