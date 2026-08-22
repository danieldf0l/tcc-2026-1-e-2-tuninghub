import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import Button from '../../components/Button';

export default function RoleSelectScreen({ navigation }) {
  const { colors } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ opacity: fade, width: '100%' }}>
        <Text style={[styles.title, { color: colors.text }]}>Você é</Text>

        <View style={styles.buttons}>
          <Button title="Entusiasta" onPress={() => navigation.navigate('Login', { tipo: 'usuario' })} />
          <View style={{ height: 14 }} />
          <Button
            title="Oficina"
            variant="outline"
            onPress={() => navigation.navigate('Login', { tipo: 'oficina' })}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 40, textAlign: 'center' },
  buttons: { width: '100%' },
});