import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Chip({ label, selected, onPress, small }) {
  const { colors } = useTheme();

  const conteudo = (
    <Text
      style={[
        small ? styles.textoSmall : styles.texto,
        { color: selected ? colors.background : colors.text },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );

  if (!onPress) {
    return (
      <Text
        style={[
          styles.chipEstatico,
          small ? styles.textoSmall : styles.texto,
          { backgroundColor: colors.background, color: colors.textSecondary, borderColor: colors.border },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        small && styles.chipSmall,
        { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border },
      ]}
    >
      {conteudo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 5 },
  chipEstatico: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginRight: 6, overflow: 'hidden' },
  texto: { fontSize: 13, fontWeight: '600' },
  textoSmall: { fontSize: 11, fontWeight: '600' },
});