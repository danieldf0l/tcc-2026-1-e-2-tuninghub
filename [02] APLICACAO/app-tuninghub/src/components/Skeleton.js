import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Skeleton({ width = '100%', height = 16, borderRadius, style }) {
  const { colors, radius } = useTheme();
  const opacidade = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidade, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacidade]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? radius.sm,
          backgroundColor: colors.skeleton,
          opacity: opacidade,
        },
        style,
      ]}
    />
  );
}