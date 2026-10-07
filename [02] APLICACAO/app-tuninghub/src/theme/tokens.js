import { Platform } from 'react-native';

// Espaçamentos — usar sempre estes valores em margin/padding/gap
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// Arredondamentos
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

// Medidas de layout recorrentes
export const layout = {
  screenPadding: 20, // padding lateral padrão das telas
  controlHeight: 52, // altura de Button e Input
};

// Escala tipográfica — espalhar no style: [typography.h1, { color: colors.text }]
export const typography = {
  display: { fontSize: 32, fontWeight: '800', lineHeight: 38, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '800', lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
};

// Sombras — iOS usa shadow*, Android usa elevation.
// No escuro a sombra quase não aparece, então reforçamos a opacidade.
export function getShadows(isDark) {
  const make = (height, opacity, blur, elevation) =>
    Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: height },
        shadowOpacity: isDark ? opacity * 3 : opacity,
        shadowRadius: blur,
      },
      android: { elevation },
      default: {},
    });

  return {
    none: {},
    sm: make(1, 0.06, 3, 1),
    md: make(4, 0.08, 10, 3),
    lg: make(8, 0.12, 20, 6),
  };
}