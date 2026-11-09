import { StyleSheet } from 'react-native';

// Opções das abas — usadas pelo Entusiasta (TabNavigator) e pela Oficina (OficinaNavigator)
export function getTabScreenOptions({ colors, fonts, insets }) {
  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    animation: 'fade',
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      elevation: 0,
      height: 68 + insets.bottom,
      paddingBottom: insets.bottom + 12,
      paddingTop: 10,
    },
    tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
  };
}

// Opções das pilhas (stacks) — mesma transição nos dois sistemas e fundo
// pintado durante a animação (evita "piscar" a cor errada)
export function getStackScreenOptions({ colors }) {
  return {
    headerShown: false,
    animation: 'slide_from_right',
    contentStyle: { backgroundColor: colors.background },
  };
}