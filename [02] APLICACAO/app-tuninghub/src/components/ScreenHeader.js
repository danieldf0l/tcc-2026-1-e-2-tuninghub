import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import BackButton from './BackButton';

export default function ScreenHeader({ titulo, subtitulo, onVoltar, acaoDireita }) {
  const { colors, typography } = useTheme();
  const temBarra = !!onVoltar || !!acaoDireita;

  return (
    <View style={styles.wrapper}>
      {temBarra ? (
        <View style={styles.barra}>
          {onVoltar ? <BackButton onPress={onVoltar} /> : <View style={styles.espaco} />}
          {acaoDireita || null}
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
  wrapper: { marginBottom: 20 },
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  espaco: { width: 40, height: 40 },
  subtitulo: { marginTop: 6 },
});