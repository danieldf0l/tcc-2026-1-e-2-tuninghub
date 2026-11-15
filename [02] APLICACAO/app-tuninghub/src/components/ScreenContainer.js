import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Platform,
  StyleSheet,
  Keyboard,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

// Folga entre o campo focado e o fim da área visível
// (mostra a mensagem de erro e o começo do próximo campo/botão)
const MARGEM_ABAIXO = 80;
const MARGEM_ACIMA = 16;

const ScreenContainerContext = createContext({ garantirCampoVisivel: () => {} });
export const useScreenContainer = () => useContext(ScreenContainerContext);

export default function ScreenContainer({ children, rodape, scroll = true, contentStyle }) {
  const { colors, layout } = useTheme();
  const insets = useSafeAreaInsets();

  const scrollRef = useRef(null);
  const areaRef = useRef(null);
  const offsetY = useRef(0);
  const timerRef = useRef(null);

  // Rola a tela até o campo focado, se ele estiver escondido
  const garantirCampoVisivel = useCallback(() => {
    if (!scroll) return;
    clearTimeout(timerRef.current);

    // Espera o KeyboardAvoidingView terminar de ajustar a tela
    timerRef.current = setTimeout(() => {
      const campo = TextInput.State.currentlyFocusedInput();
      const area = areaRef.current;
      if (!campo || !area || !scrollRef.current) return;

      area.measureInWindow((_ax, areaY, _aw, areaAltura) => {
        campo.measureInWindow((_cx, campoY, _cw, campoAltura) => {
          const limiteBaixo = areaY + areaAltura - MARGEM_ABAIXO;
          const limiteCima = areaY + MARGEM_ACIMA;
          const campoFim = campoY + campoAltura;

          let destino = null;
          if (campoFim > limiteBaixo) {
            destino = offsetY.current + (campoFim - limiteBaixo);
          } else if (campoY < limiteCima) {
            destino = Math.max(0, offsetY.current - (limiteCima - campoY));
          }

          if (destino !== null) {
            scrollRef.current?.scrollTo({ y: destino, animated: true });
          }
        });
      });
    }, 150);
  }, [scroll]);

  // Quando o teclado abre, garante que o campo apareça
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', garantirCampoVisivel);
    return () => {
      sub.remove();
      clearTimeout(timerRef.current);
    };
  }, [garantirCampoVisivel]);

  const espacamento = {
    paddingTop: insets.top + 12,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: rodape ? 24 : insets.bottom + 24,
  };

  return (
    <ScreenContainerContext.Provider value={{ garantirCampoVisivel }}>
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: colors.background }]}
        // Com edgeToEdgeEnabled o Android não redimensiona mais a tela sozinho,
        // então o padding precisa valer para as duas plataformas
        behavior="padding"
      >
        {scroll ? (
          <View ref={areaRef} style={styles.flex} collapsable={false}>
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={[styles.crescer, espacamento, contentStyle]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                offsetY.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
            >
              {children}
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.flex, espacamento, contentStyle]}>{children}</View>
        )}

        {rodape ? (
          <View
            style={[
              styles.rodape,
              {
                paddingHorizontal: layout.screenPadding,
                paddingBottom: insets.bottom + 12,
                backgroundColor: colors.background,
                borderTopColor: colors.border,
              },
            ]}
          >
            {rodape}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </ScreenContainerContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  crescer: { flexGrow: 1 },
  rodape: { paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
});