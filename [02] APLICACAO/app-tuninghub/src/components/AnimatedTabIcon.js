import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function AnimatedTabIcon({ Icone, color, size, focused }) {
  const escala = useRef(new Animated.Value(focused ? 1.08 : 1)).current;

  useEffect(() => {
    Animated.spring(escala, {
      toValue: focused ? 1.08 : 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: escala }] }}>
      <Icone color={color} size={size} strokeWidth={focused ? 2.4 : 1.9} />
    </Animated.View>
  );
}