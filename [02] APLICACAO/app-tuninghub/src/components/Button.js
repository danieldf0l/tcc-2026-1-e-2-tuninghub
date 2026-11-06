import { useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// variant: 'primary' | 'outline' | 'ghost' | 'danger'
export default function Button({ title, onPress, variant = 'primary', loading, disabled, Icone }) {
  const { colors, typography, layout, radius } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const inativo = disabled || loading;

  function animar(valor) {
    Animated.spring(scale, { toValue: valor, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  }

  const variantes = {
    primary: {
      fundo: colors.primary,
      fundoPressionado: colors.primaryPressed,
      borda: colors.primary,
      texto: colors.textOnPrimary,
    },
    outline: {
      fundo: 'transparent',
      fundoPressionado: colors.primarySoft,
      borda: colors.primary,
      texto: colors.primary,
    },
    ghost: {
      fundo: 'transparent',
      fundoPressionado: colors.surface,
      borda: 'transparent',
      texto: colors.text,
    },
    danger: {
      fundo: colors.dangerSoft,
      fundoPressionado: colors.dangerSoft,
      borda: colors.danger,
      texto: colors.danger,
    },
  };
  const v = variantes[variant] || variantes.primary;
  const temBorda = variant === 'outline' || variant === 'danger';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animar(0.97)}
        onPressOut={() => animar(1)}
        disabled={inativo}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!inativo, busy: !!loading }}
        style={({ pressed }) => [
          styles.base,
          {
            height: layout.controlHeight,
            borderRadius: radius.md,
            backgroundColor: pressed ? v.fundoPressionado : v.fundo,
            borderColor: v.borda,
            borderWidth: temBorda ? 1.5 : 0,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.texto} />
        ) : (
          <View style={styles.conteudo}>
            {Icone ? <Icone size={18} color={v.texto} strokeWidth={2.25} /> : null}
            <Text style={[typography.button, { color: v.texto }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});