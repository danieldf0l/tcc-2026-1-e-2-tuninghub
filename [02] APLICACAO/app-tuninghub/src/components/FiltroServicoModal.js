import { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { listarServicos } from '../api/servico.api';
import { getCategoriaInfo } from '../constants/categoriasServico';

export default function FiltroServicoModal({ visivel, onFechar, onSelecionar, idServicoSelecionado }) {
  const { colors } = useTheme();
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!visivel) return;
    async function carregar() {
      setCarregando(true);
      try {
        const lista = await listarServicos();
        setServicos(lista);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [visivel]);

  const secoes = useMemo(() => {
    const grupos = {};
    servicos.forEach((s) => {
      const chave = s.Categoria || 'OUTROS';
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(s);
    });
    return Object.entries(grupos).map(([categoria, itens]) => {
      const info = getCategoriaInfo(categoria);
      return { title: `${info.icone}  ${info.rotulo}`, data: itens };
    });
  }, [servicos]);

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={onFechar} hitSlop={10}>
            <Text style={{ color: colors.text, fontSize: 24 }}>✕</Text>
          </Pressable>
          <Text style={[styles.titulo, { color: colors.text }]}>Filtrar por serviço</Text>
          <View style={{ width: 24 }} />
        </View>

        <Pressable
          onPress={() => {
            onSelecionar(null);
            onFechar();
          }}
          style={[styles.opcaoTodos, { borderColor: colors.border, backgroundColor: !idServicoSelecionado ? colors.primary : colors.surface }]}
        >
          <Text style={{ color: !idServicoSelecionado ? colors.background : colors.text, fontWeight: '700' }}>
            Todos os serviços
          </Text>
        </Pressable>

        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
        ) : (
          <SectionList
            sections={secoes}
            keyExtractor={(item) => String(item.IdServico)}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderSectionHeader={({ section }) => (
              <Text style={[styles.sectionHeader, { color: colors.text }]}>{section.title}</Text>
            )}
            renderItem={({ item }) => {
              const selecionado = idServicoSelecionado === item.IdServico;
              return (
                <Pressable
                  onPress={() => {
                    onSelecionar(item.IdServico, item.Nome);
                    onFechar();
                  }}
                  style={[
                    styles.item,
                    { borderColor: selecionado ? colors.primary : colors.border, backgroundColor: selecionado ? `${colors.primary}14` : 'transparent' },
                  ]}
                >
                  <Text style={{ color: colors.text }}>{item.Nome}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titulo: { fontSize: 17, fontWeight: '700' },
  opcaoTodos: { borderWidth: 1.5, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  sectionHeader: { fontSize: 14, fontWeight: '800', marginTop: 14, marginBottom: 8 },
  item: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
});