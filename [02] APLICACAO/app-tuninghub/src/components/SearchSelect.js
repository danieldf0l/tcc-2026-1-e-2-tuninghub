import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, X, Search, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SearchSelect({ label, placeholder, value, items, onSelect, disabled }) {
  const { colors, fonts, typography, layout, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');

  const lista = items || [];
  const itemSelecionado = lista.find((i) => String(i.value) === String(value));

  const filtrados = useMemo(() => {
    if (!busca.trim()) return lista;
    const termo = busca.trim().toLowerCase();
    return lista.filter((i) => i.label.toLowerCase().includes(termo));
  }, [busca, lista]);

  function abrir() {
    if (disabled) return;
    setBusca('');
    setAberto(true);
  }

  function selecionar(item) {
    onSelect(item.value);
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
        onPress={abrir}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.box,
          {
            height: layout.controlHeight,
            borderRadius: radius.md,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.boxTexto,
            { fontFamily: fonts.regular, color: itemSelecionado ? colors.text : colors.placeholder },
          ]}
          numberOfLines={1}
        >
          {itemSelecionado ? itemSelecionado.label : placeholder || 'Selecione...'}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={aberto} animationType="slide" onRequestClose={() => setAberto(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => setAberto(false)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              style={({ pressed }) => [
                styles.fechar,
                {
                  borderRadius: radius.pill,
                  borderColor: colors.border,
                  backgroundColor: pressed ? colors.border : colors.surface,
                },
              ]}
            >
              <X size={20} color={colors.text} strokeWidth={2.25} />
            </Pressable>
            <Text style={[typography.h3, styles.modalTitulo, { color: colors.text }]} numberOfLines={1}>
              {label}
            </Text>
            <View style={styles.fecharEspaco} />
          </View>

          <View
            style={[
              styles.busca,
              { borderRadius: radius.md, borderColor: colors.primary, backgroundColor: colors.surface },
            ]}
          >
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              autoFocus
              value={busca}
              onChangeText={setBusca}
              placeholder="Digite para buscar..."
              placeholderTextColor={colors.placeholder}
              autoCorrect={false}
              style={[styles.buscaInput, { color: colors.text, fontFamily: fonts.regular }]}
            />
            {busca ? (
              <Pressable onPress={() => setBusca('')} hitSlop={10} accessibilityLabel="Limpar busca">
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filtrados}
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            ListEmptyComponent={
              <Text style={[typography.body, styles.vazio, { color: colors.textSecondary }]}>
                Nenhum resultado para "{busca}"
              </Text>
            }
            renderItem={({ item }) => {
              const ativo = String(item.value) === String(value);
              return (
                <Pressable
                  onPress={() => selecionar(item)}
                  style={({ pressed }) => [
                    styles.item,
                    { borderBottomColor: colors.border, backgroundColor: pressed ? colors.surface : 'transparent' },
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      styles.itemTexto,
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
  modalContainer: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  fechar: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fecharEspaco: { width: 40 },
  modalTitulo: { flex: 1, textAlign: 'center', marginHorizontal: 8 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 8,
  },
  buscaInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemTexto: { flex: 1 },
  vazio: { textAlign: 'center', marginTop: 40 },
});