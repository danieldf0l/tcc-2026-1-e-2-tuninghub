import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SearchSelect({ label, placeholder, value, items, onSelect, disabled }) {
  const { colors } = useTheme();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');

  const itemSelecionado = items.find((i) => String(i.value) === String(value));

  const filtrados = useMemo(() => {
    if (!busca.trim()) return items;
    const termo = busca.trim().toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(termo));
  }, [busca, items]);

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
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}

      <Pressable
        onPress={abrir}
        style={[
          styles.box,
          { borderColor: colors.border, backgroundColor: colors.surface, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Text
          style={[
            styles.boxText,
            { color: itemSelecionado ? colors.text : colors.placeholder },
          ]}
        >
          {itemSelecionado ? itemSelecionado.label : placeholder || 'Selecione...'}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>⌄</Text>
      </Pressable>

      <Modal visible={aberto} animationType="slide" onRequestClose={() => setAberto(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setAberto(false)} hitSlop={10}>
              <Text style={{ color: colors.text, fontSize: 24 }}>✕</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
            <View style={{ width: 24 }} />
          </View>

          <TextInput
            autoFocus
            value={busca}
            onChangeText={setBusca}
            placeholder="Digite para buscar..."
            placeholderTextColor={colors.placeholder}
            style={[
              styles.buscaInput,
              { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
            ]}
          />

          <FlatList
            data={filtrados}
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              <Text style={[styles.vazio, { color: colors.textSecondary }]}>
                Nenhum resultado para "{busca}"
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => selecionar(item)}
                style={({ pressed }) => [
                  styles.item,
                  { borderBottomColor: colors.border, backgroundColor: pressed ? colors.surface : 'transparent' },
                ]}
              >
                <Text style={{ color: colors.text, fontSize: 15 }}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  boxText: { fontSize: 15 },
  modalContainer: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  buscaInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, marginBottom: 8 },
  item: { paddingVertical: 16, borderBottomWidth: 1 },
  vazio: { textAlign: 'center', marginTop: 40 },
});