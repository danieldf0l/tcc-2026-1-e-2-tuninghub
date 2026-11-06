import { Platform } from 'react-native';

// Famílias da Inter — cada peso é uma fonte separada (não usar fontWeight)
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
};

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
  display: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  h3: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.1 },
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