import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Input from './Input';
import Button from './Button';

export default function DialogoTexto({
  visivel,
  titulo,
  descricao,
  valorInicial = '',
  placeholder,
  rotuloConfirmar = 'Salvar',
  onConfirmar,
  onCancelar,
  carregando,
  maxLength = 60,
}) {
  const { colors, typography, fonts, radius } = useTheme();
  const [valor, setValor] = useState(valorInicial);

  useEffect(() => {
    if (visivel) setValor(valorInicial || '');
  }, [visivel, valorInicial]);

  return (
    <Modal visible={visivel} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancelar}>
      <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onCancelar}
          accessibilityLabel="Fechar"
        />

        <View
          style={[
            styles.caixa,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radius.xl },
          ]}
        >
          <Text style={[typography.h3, { color: colors.text }]}>{titulo}</Text>
          {descricao ? (
            <Text style={[typography.caption, styles.descricao, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {descricao}
            </Text>
          ) : (
            <View style={styles.espaco} />
          )}

          <Input
            value={valor}
            onChangeText={setValor}
            placeholder={placeholder}
            autoFocus
            autoCapitalize="sentences"
            maxLength={maxLength}
            returnKeyType="done"
            onSubmitEditing={() => onConfirmar(valor)}
          />

          <View style={styles.botoes}>
            <View style={styles.botao}>
              <Button title="Cancelar" variant="ghost" onPress={onCancelar} />
            </View>
            <View style={styles.botao}>
              <Button title={rotuloConfirmar} onPress={() => onConfirmar(valor)} loading={carregando} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, justifyContent: 'center', padding: 24 },
  caixa: { borderWidth: 1, padding: 20 },
  descricao: { marginTop: 4, marginBottom: 16 },
  espaco: { height: 16 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 4 },
  botao: { flex: 1 },
});