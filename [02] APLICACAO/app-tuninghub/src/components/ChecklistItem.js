import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ChecklistItem({ titulo, concluido, onToggle }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: concluido ? colors.primary : colors.border,
            backgroundColor: concluido ? colors.primary : 'transparent',
          },
        ]}
      >
        {concluido ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text
        style={[
          styles.titulo,
          { color: colors.text, textDecorationLine: concluido ? 'line-through' : 'none', opacity: concluido ? 0.6 : 1 },
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  check: { color: '#FEFEFE', fontSize: 14, fontWeight: '900' },
  titulo: { fontSize: 15, fontWeight: '600', flex: 1 },
});