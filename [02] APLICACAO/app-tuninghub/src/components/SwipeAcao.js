import { useRef } from 'react';
import { Animated, PanResponder, View, Text, StyleSheet } from 'react-native';
import { Archive } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { toqueImpacto } from '../utils/haptics';

const LIMIAR = 0.4; // fração da largura que dispara a ação

export default function SwipeAcao({ children, onAcao, rotulo = 'Arquivar', Icone = Archive, cor, raio = 0, style, desabilitado }) {
  const { colors, fonts } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const larguraRef = useRef(0);
    const passouRef = useRef(false); // para vibrar só uma vez ao cruzar o limiar

  // O PanResponder é criado uma vez; refs garantem que ele use as props mais recentes
  const onAcaoRef = useRef(onAcao);
  onAcaoRef.current = onAcao;
  const desabilitadoRef = useRef(desabilitado);
  desabilitadoRef.current = desabilitado;

  function voltar() {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
  }

  const pan = useRef(
    PanResponder.create({
      // Só assume o gesto se for claramente horizontal e para a esquerda
      onMoveShouldSetPanResponder: (_, g) =>
        !desabilitadoRef.current && g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        translateX.setValue(Math.min(0, g.dx));
        const passou = -g.dx > (larguraRef.current || 1) * LIMIAR;
        if (passou !== passouRef.current) {
          passouRef.current = passou;
          if (passou) toqueImpacto(); // "clique" ao chegar no ponto que dispara a ação
        }
      },
      onPanResponderRelease: (_, g) => {
        passouRef.current = false;
        const largura = larguraRef.current || 1;
        const passouDoLimiar = -g.dx > largura * LIMIAR || g.vx < -1.2;

        if (!passouDoLimiar) {
          voltar();
          return;
        }

        Animated.timing(translateX, { toValue: -largura, duration: 180, useNativeDriver: true }).start(async () => {
          const ok = await onAcaoRef.current?.();
          if (ok === false) voltar();
        });
      },
      onPanResponderTerminate: () => {
        passouRef.current = false;
        voltar();
      },
    })
  ).current;

  // O fundo só aparece quando o card começa a se mover (não "vaza" nas bordas arredondadas)
  const opacidadeFundo = translateX.interpolate({ inputRange: [-40, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const escalaIcone = translateX.interpolate({ inputRange: [-120, -40], outputRange: [1, 0.7], extrapolate: 'clamp' });

  return (
    <View style={style} onLayout={(e) => (larguraRef.current = e.nativeEvent.layout.width)}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.fundo,
          { backgroundColor: cor || colors.secondary, borderRadius: raio, opacity: opacidadeFundo },
        ]}
      >
        <Animated.View style={[styles.acao, { transform: [{ scale: escalaIcone }] }]}>
          <Icone size={22} color="#FEFEFE" strokeWidth={2.25} />
          <Text style={[styles.rotulo, { fontFamily: fonts.semibold }]}>{rotulo}</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={{ transform: [{ translateX }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { alignItems: 'flex-end', justifyContent: 'center', paddingRight: 28 },
  acao: { alignItems: 'center', gap: 4 },
  rotulo: { color: '#FEFEFE', fontSize: 12 },
});