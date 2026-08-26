import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function AnimatedTabIcon({ Icone, color, size, focused }) {
  const escala = useRef(new Animated.Value(focused ? 1.15 : 1)).current;

  useEffect(() => {
    Animated.spring(escala, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: escala }] }}>
      <Icone color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
    </Animated.View>
  );
}