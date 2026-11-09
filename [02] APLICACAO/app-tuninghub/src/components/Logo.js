import { Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Wordmark provisório — será trocado pela imagem da logo oficial
export default function Logo({ tamanho = 28 }) {
  const { colors, fonts } = useTheme();

  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel="TuningHub"
      style={{ fontFamily: fonts.extrabold, fontSize: tamanho, letterSpacing: -0.6, color: colors.text }}
    >
      Tuning<Text style={{ color: colors.primary }}>Hub</Text>
    </Text>
  );
}