import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, WifiOff } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { listarServicos } from '../api/servico.api';
import { getCategoriaInfo } from '../constants/categoriasServico';
import EmptyState from './EmptyState';

export default function FiltroServicoModal({ visivel, onFechar, onSelecionar, idServicoSelecionado }) {
  const { colors, fonts, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      const lista = await listarServicos();
      setServicos(lista || []);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (visivel) carregar();
  }, [visivel, carregar]);

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

  function escolher(id, nome) {
    onSelecionar(id, nome);
    onFechar();
  }

  function Linha({ titulo, selecionado, onPress }) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected: selecionado }}
        style={({ pressed }) => [
          styles.item,
          {
            borderRadius: radius.md,
            borderColor: selecionado ? colors.primary : colors.border,
            backgroundColor: selecionado ? colors.primarySoft : colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[
            typography.body,
            styles.itemTexto,
            { color: selecionado ? colors.primary : colors.text, fontFamily: selecionado ? fonts.semibold : fonts.regular },
          ]}
        >
          {titulo}
        </Text>
        {selecionado ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : null}
      </Pressable>
    );
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <Pressable
            onPress={onFechar}
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
          <Text style={[typography.h3, { color: colors.text }]}>Filtrar por serviço</Text>
          <View style={styles.fecharEspaco} />
        </View>

        <Linha titulo="Todos os serviços" selecionado={!idServicoSelecionado} onPress={() => escolher(null)} />

        {carregando ? (
          <ActivityIndicator color={colors.primary} style={styles.carregando} />
        ) : erro ? (
          <EmptyState
            Icone={WifiOff}
            titulo="Não foi possível carregar"
            descricao="Verifique sua conexão e tente de novo."
            acaoTitulo="Tentar novamente"
            onAcao={carregar}
          />
        ) : (
          <SectionList
            sections={secoes}
            keyExtractor={(item) => String(item.IdServico)}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <Text style={[typography.overline, styles.secao, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
            )}
            renderItem={({ item }) => (
              <Linha
                titulo={item.Nome}
                selecionado={idServicoSelecionado === item.IdServico}
                onPress={() => escolher(item.IdServico, item.Nome)}
              />
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  fechar: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fecharEspaco: { width: 40 },
  carregando: { marginTop: 30 },
  secao: { marginTop: 18, marginBottom: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  itemTexto: { flex: 1 },
});