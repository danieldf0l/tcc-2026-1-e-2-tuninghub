import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../theme/ThemeContext';

export default function Select({ label, value, onValueChange, items, placeholder, disabled }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <View
        style={[
          styles.box,
          { borderColor: colors.border, backgroundColor: colors.surface, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Picker
          enabled={!disabled}
          selectedValue={value}
          onValueChange={onValueChange}
          style={{ color: colors.text }}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label={placeholder || 'Selecione...'} value="" color={colors.placeholder} />
          {items.map((item) => (
            <Picker.Item key={String(item.value)} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  box: {
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    ...Platform.select({ android: { paddingHorizontal: 4 } }),
  },
});