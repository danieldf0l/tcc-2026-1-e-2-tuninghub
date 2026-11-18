import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, Modal, Pressable, SectionList, ScrollView, KeyboardAvoidingView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, WifiOff, Search, SearchX } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { listarServicos } from '../api/servico.api';
import { getCategoriaInfo } from '../constants/categoriasServico';
import EmptyState from './EmptyState';
import Input from './Input';
import Chip from './Chip';

// Busca sem acento e sem diferenciar maiúscula ("suspensao" acha "Suspensão")
function normalizar(texto) {
  return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default function FiltroServicoModal({ visivel, onFechar, onSelecionar, idServicoSelecionado }) {
  const { colors, fonts, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState(null); // rótulo da categoria escolhida nos chips

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

  // Sempre abre limpo
  useEffect(() => {
    if (!visivel) return;
    setBusca('');
    setCategoria(null);
    carregar();
  }, [visivel, carregar]);

  const todasSecoes = useMemo(() => {
    const grupos = {};
    servicos.forEach((s) => {
      const chave = s.Categoria || 'Outros';
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(s);
    });
    return Object.entries(grupos)
      .map(([cat, itens]) => {
        const info = getCategoriaInfo(cat);
        return {
          title: info.rotulo,
          Icone: info.Icone,
          data: [...itens].sort((a, b) => (a.Nome || '').localeCompare(b.Nome || '')),
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [servicos]);

  const secoes = useMemo(() => {
    const termo = normalizar(busca);
    return todasSecoes
      .filter((s) => !categoria || s.title === categoria)
      .map((s) => (termo ? { ...s, data: s.data.filter((i) => normalizar(i.Nome).includes(termo)) } : s))
      .filter((s) => s.data.length > 0);
  }, [todasSecoes, busca, categoria]);

  const filtrando = !!busca.trim() || !!categoria;

  function escolher(id, nome) {
    onSelecionar(id, nome);
    onFechar();
  }

  function limparBusca() {
    setBusca('');
    setCategoria(null);
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

  function renderConteudo() {
    if (carregando) return <ActivityIndicator color={colors.primary} style={styles.carregando} />;
    if (erro) {
      return (
        <EmptyState
          Icone={WifiOff}
          titulo="Não foi possível carregar"
          descricao="Verifique sua conexão e tente de novo."
          acaoTitulo="Tentar novamente"
          onAcao={carregar}
        />
      );
    }

    return (
      <SectionList
        sections={secoes}
        style={styles.flex}
        keyExtractor={(item) => String(item.IdServico)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          !filtrando ? (
            <Linha titulo="Todos os serviços" selecionado={!idServicoSelecionado} onPress={() => escolher(null)} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            compacto
            Icone={SearchX}
            titulo="Nenhum serviço encontrado"
            descricao={busca.trim() ? `Nada com "${busca.trim()}"${categoria ? ` em ${categoria}` : ''}.` : 'Nenhum serviço nesta categoria.'}
            acaoTitulo="Limpar busca"
            onAcao={limparBusca}
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.secaoLinha, { backgroundColor: colors.background }]}>
            <section.Icone size={15} color={colors.textSecondary} strokeWidth={2.25} />
            <Text style={[typography.overline, styles.flex, { color: colors.textSecondary }]}>{section.title}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.semibold }]}>
              {section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Linha
            titulo={item.Nome}
            selecionado={idServicoSelecionado === item.IdServico}
            onPress={() => escolher(item.IdServico, item.Nome)}
          />
        )}
      />
    );
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView behavior="padding" style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}>
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

        {!carregando && !erro ? (
          <>
            <Input
              Icone={Search}
              placeholder="Buscar serviço (ex.: rebaixamento)"
              value={busca}
              onChangeText={setBusca}
              autoCorrect={false}
              returnKeyType="search"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.chipsScroll}
              contentContainerStyle={styles.chips}
            >
              <Chip label="Todas" selected={!categoria} onPress={() => setCategoria(null)} />
              {todasSecoes.map((s) => (
                <Chip
                  key={s.title}
                  label={s.title}
                  selected={categoria === s.title}
                  onPress={() => setCategoria(categoria === s.title ? null : s.title)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        {renderConteudo()}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  fechar: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fecharEspaco: { width: 40 },
  carregando: { marginTop: 30 },
  chipsScroll: { flexGrow: 0, flexShrink: 0, marginHorizontal: -20, marginBottom: 8 },
  chips: { paddingHorizontal: 20, alignItems: 'center' },
  secaoLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 16, paddingBottom: 8 },
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
