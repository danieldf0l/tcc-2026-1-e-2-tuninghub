import { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { listarServicos } from '../api/servico.api';
import { getCategoriaInfo } from '../constants/categoriasServico';
import { toqueSelecao } from '../utils/haptics';
import Button from './Button';

const nomeServico = (s) => s.NomeServico || s.Nome || s.nome || 'Serviço';

// IdServico -> nome da categoria. Só é buscado se a busca por projeto não mandar a categoria,
// e fica guardado enquanto o app estiver aberto.
let cacheCategorias = null;

// Bottom sheet para escolher quais serviços pendentes entram na busca por projeto.
// Só aplica ao tocar em "Aplicar" (evita uma busca a cada toque).
export default function AjustarServicosSheet({ visivel, onFechar, servicos, selecionados, onAplicar }) {
  const { colors, fonts, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [rascunho, setRascunho] = useState([]);
  const [mapaCategorias, setMapaCategorias] = useState(cacheCategorias || {});

  // Ao abrir, começa da seleção atual
  useEffect(() => {
    if (visivel) setRascunho(selecionados || []);
  }, [visivel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visivel || cacheCategorias) return;
    const faltaCategoria = servicos.some((s) => !(s.Categoria || s.NomeCategoria));
    if (!faltaCategoria) return;
    listarServicos()
      .then((lista) => {
        const mapa = {};
        (lista || []).forEach((s) => {
          mapa[s.IdServico] = s.Categoria;
        });
        cacheCategorias = mapa;
        setMapaCategorias(mapa);
      })
      .catch(() => {});
  }, [visivel, servicos]);

  const grupos = useMemo(() => {
    const g = {};
    servicos.forEach((s) => {
      const cat = s.Categoria || s.NomeCategoria || mapaCategorias[s.IdServico] || 'Outros';
      (g[cat] = g[cat] || []).push(s);
    });
    return Object.entries(g)
      .map(([cat, itens]) => ({ ...getCategoriaInfo(cat), itens }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo));
  }, [servicos, mapaCategorias]);

  const todosMarcados = rascunho.length === servicos.length;

  function alternar(id) {
    toqueSelecao();
    setRascunho((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
  }

  function marcarTodos() {
    toqueSelecao();
    setRascunho(todosMarcados ? [] : servicos.map((s) => s.IdServico));
  }

  function aplicar() {
    onAplicar(rascunho);
    onFechar();
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" statusBarTranslucent onRequestClose={onFechar}>
      <View style={styles.raiz}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onFechar}
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

          <View style={styles.cabecalho}>
            <View style={styles.flex}>
              <Text style={[typography.h3, { color: colors.text }]}>Serviços da busca</Text>
              <Text style={[typography.caption, styles.subtitulo, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {rascunho.length} de {servicos.length} selecionados
              </Text>
            </View>
            <Pressable onPress={marcarTodos} hitSlop={8} accessibilityRole="button">
              <Text style={[styles.link, { color: colors.primary, fontFamily: fonts.semibold }]}>
                {todosMarcados ? 'Limpar' : 'Marcar todos'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.lista} contentContainerStyle={styles.listaConteudo} showsVerticalScrollIndicator={false}>
            {grupos.map((grupo) => (
              <View key={grupo.rotulo} style={styles.grupo}>
                <View style={styles.grupoTopo}>
                  <grupo.Icone size={15} color={colors.textSecondary} strokeWidth={2.25} />
                  <Text style={[typography.overline, { color: colors.textSecondary }]}>{grupo.rotulo}</Text>
                </View>

                {grupo.itens.map((s) => {
                  const marcado = rascunho.includes(s.IdServico);
                  return (
                    <Pressable
                      key={s.IdServico}
                      onPress={() => alternar(s.IdServico)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: marcado }}
                      style={({ pressed }) => [
                        styles.linha,
                        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
                      ]}
                    >
                      <Text style={[typography.body, styles.flex, { color: colors.text }]}>{nomeServico(s)}</Text>
                      <View
                        style={[
                          styles.caixa,
                          {
                            borderRadius: 6,
                            borderColor: marcado ? colors.primary : colors.border,
                            backgroundColor: marcado ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {marcado ? <Check size={14} color={colors.textOnPrimary} strokeWidth={3} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <View style={styles.rodape}>
            <Button
              title={rascunho.length > 0 ? `Aplicar (${rascunho.length})` : 'Selecione ao menos um'}
              onPress={aplicar}
              disabled={rascunho.length === 0}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  raiz: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '85%' },
  alca: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 12 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 8 },
  subtitulo: { marginTop: 2 },
  link: { fontSize: 14 },
  lista: { flexShrink: 1 },
  listaConteudo: { paddingHorizontal: 20, paddingBottom: 8 },
  grupo: { marginTop: 14 },
  grupoTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  caixa: { width: 22, height: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  rodape: { paddingHorizontal: 20, paddingTop: 12 },
});
