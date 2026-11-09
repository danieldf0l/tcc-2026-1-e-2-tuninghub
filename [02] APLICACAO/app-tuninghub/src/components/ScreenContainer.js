import { KeyboardAvoidingView, ScrollView, View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export default function ScreenContainer({ children, rodape, scroll = true, contentStyle }) {
  const { colors, layout } = useTheme();
  const insets = useSafeAreaInsets();

  const espacamento = {
    paddingTop: insets.top + 12,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: rodape ? 24 : insets.bottom + 24,
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.crescer, espacamento, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, espacamento, contentStyle]}>{children}</View>
      )}

      {rodape ? (
        <View
          style={[
            styles.rodape,
            {
              paddingHorizontal: layout.screenPadding,
              paddingBottom: insets.bottom + 12,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          {rodape}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  crescer: { flexGrow: 1 },
  rodape: { paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
});