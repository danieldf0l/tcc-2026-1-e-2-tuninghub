import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Select({ label, value, onValueChange, items, placeholder, disabled }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);

  const lista = items || [];
  const selecionado = lista.find((i) => String(i.value) === String(value));

  function selecionar(item, index) {
    // index + 1 mantém o mesmo índice que o Picker antigo entregava (o placeholder era o 0)
    onValueChange(item.value, index + 1);
    setAberto(false);
  }

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[typography.caption, styles.label, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => !disabled && setAberto(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.box,
          {
            height: layout.controlHeight,
            borderRadius: radius.md,
            borderColor: aberto ? colors.primary : colors.border,
            backgroundColor: colors.surface,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[styles.boxTexto, { fontFamily: fonts.regular, color: selecionado ? colors.text : colors.placeholder }]}
          numberOfLines={1}
        >
          {selecionado ? selecionado.label : placeholder || 'Selecione...'}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setAberto(false)}
      >
        <View style={styles.modalRaiz}>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
            onPress={() => setAberto(false)}
            accessibilityLabel="Fechar"
          />

          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surfaceElevated,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingBottom: insets.bottom + 12,
              },
            ]}
          >
            <View style={[styles.alca, { backgroundColor: colors.border }]} />

            {label ? (
              <Text style={[typography.h3, styles.sheetTitulo, { color: colors.text }]}>{label}</Text>
            ) : null}

            <FlatList
              data={lista}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item, index }) => {
                const ativo = String(item.value) === String(value);
                return (
                  <Pressable
                    onPress={() => selecionar(item, index)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: ativo }}
                    style={({ pressed }) => [
                      styles.opcao,
                      { borderBottomColor: colors.border, backgroundColor: pressed ? colors.surface : 'transparent' },
                    ]}
                  >
                    <Text
                      style={[
                        typography.body,
                        styles.opcaoTexto,
                        { color: ativo ? colors.primary : colors.text, fontFamily: ativo ? fonts.semibold : fonts.regular },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {ativo ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { marginBottom: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  boxTexto: { flex: 1, fontSize: 15, marginRight: 8 },
  modalRaiz: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '70%' },
  alca: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 12 },
  sheetTitulo: { paddingHorizontal: 20, marginBottom: 4 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  opcaoTexto: { flex: 1 },
});