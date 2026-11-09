import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, Info } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const ToastContext = createContext(null);
const DURACAO_MS = 2800;

export function ToastProvider({ children }) {
  const { colors, fonts, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const esconder = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
  }, [anim]);

  // tipo: 'sucesso' | 'erro' | 'info'
  const mostrar = useCallback(
    (mensagem, tipo = 'sucesso') => {
      clearTimeout(timer.current);
      setToast({ mensagem, tipo });
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
      timer.current = setTimeout(esconder, DURACAO_MS);
    },
    [anim, esconder]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ mostrar }), [mostrar]);

  const tipos = {
    sucesso: { Icone: Check, cor: colors.success, fundo: colors.successSoft },
    erro: { Icone: X, cor: colors.danger, fundo: colors.dangerSoft },
    info: { Icone: Info, cor: colors.text, fundo: colors.surface },
  };
  const t = toast ? tipos[toast.tipo] || tipos.info : null;

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.raiz}>
        {children}

        {toast ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.posicao,
              {
                top: insets.top + 8,
                opacity: anim,
                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
              },
            ]}
          >
            <Pressable
              onPress={esconder}
              accessibilityRole="alert"
              style={[
                styles.toast,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
                shadows.md,
              ]}
            >
              <View style={[styles.icone, { backgroundColor: t.fundo }]}>
                <t.Icone size={14} color={t.cor} strokeWidth={3} />
              </View>
              <Text style={[styles.texto, { color: colors.text, fontFamily: fonts.medium }]} numberOfLines={3}>
                {toast.mensagem}
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  posicao: { position: 'absolute', left: 16, right: 16, zIndex: 1000, elevation: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  icone: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texto: { flex: 1, fontSize: 14 },
});