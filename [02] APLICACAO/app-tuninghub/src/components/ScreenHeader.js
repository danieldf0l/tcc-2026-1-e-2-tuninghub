import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import BackButton from './BackButton';

export default function ScreenHeader({ titulo, subtitulo, onVoltar, acaoDireita, Icone }) {
  const { colors, typography, radius } = useTheme();
  const temBarra = !!onVoltar || !!acaoDireita;

  return (
    <View style={styles.wrapper}>
      {temBarra ? (
        <View style={styles.barra}>
          {onVoltar ? <BackButton onPress={onVoltar} /> : <View style={styles.espaco} />}
          {acaoDireita || null}
        </View>
      ) : null}

      {Icone ? (
        <View style={[styles.icone, { backgroundColor: colors.primarySoft, borderRadius: radius.lg }]}>
          <Icone size={26} color={colors.primary} strokeWidth={2} />
        </View>
      ) : null}

      {titulo ? (
        <Text style={[typography.h1, { color: colors.text }]} accessibilityRole="header">
          {titulo}
        </Text>
      ) : null}

      {subtitulo ? (
        <Text style={[typography.body, styles.subtitulo, { color: colors.textSecondary }]}>{subtitulo}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  espaco: { width: 40, height: 40 },
  icone: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  subtitulo: { marginTop: 6 },
});