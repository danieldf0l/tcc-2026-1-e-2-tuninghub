import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Button from './Button';

export default function EmptyState({ Icone, titulo, descricao, acaoTitulo, onAcao, compacto }) {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.wrapper, compacto && styles.compacto]}>
      {Icone ? (
        <View style={[styles.icone, { backgroundColor: colors.primarySoft, borderRadius: radius.pill }]}>
          <Icone size={28} color={colors.primary} strokeWidth={2} />
        </View>
      ) : null}

      <Text style={[typography.h3, styles.centro, { color: colors.text }]}>{titulo}</Text>

      {descricao ? (
        <Text style={[typography.body, styles.centro, styles.descricao, { color: colors.textSecondary }]}>
          {descricao}
        </Text>
      ) : null}

      {acaoTitulo && onAcao ? (
        <View style={styles.acao}>
          <Button title={acaoTitulo} onPress={onAcao} variant="outline" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  compacto: { paddingVertical: 24 },
  icone: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  centro: { textAlign: 'center' },
  descricao: { marginTop: 6 },
  acao: { marginTop: 20, minWidth: 220 },
});