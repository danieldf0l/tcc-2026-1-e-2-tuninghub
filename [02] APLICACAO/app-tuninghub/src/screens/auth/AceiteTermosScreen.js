import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { aceitarTermos } from '../../api/usuario.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { TERMOS_DE_USO, DATA_ATUALIZACAO } from '../../constants/textosLegais';
import DocumentoLegal from '../../components/DocumentoLegal';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';

export default function AceiteTermosScreen() {
  const { colors } = useTheme();
  const { atualizarAceiteTermos, sair } = useAuth();
  const [marcado, setMarcado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function confirmar() {
    if (!marcado) {
      setErro('É necessário marcar a caixa para continuar.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await aceitarTermos();
      atualizarAceiteTermos();
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>Atualizamos nossos termos</Text>
        <Text style={[styles.subtitulo, { color: colors.textSecondary }]}>
          Para continuar usando o TuningHub, leia e aceite os Termos de Uso abaixo.
        </Text>
        <Text style={[styles.atualizado, { color: colors.textSecondary }]}>
          Atualizado em: {DATA_ATUALIZACAO}
        </Text>
        <DocumentoLegal introducao={TERMOS_DE_USO.introducao} clausulas={TERMOS_DE_USO.clausulas} />
      </ScrollView>

      <View style={[styles.rodape, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Checkbox marcado={marcado} onToggle={() => setMarcado((v) => !v)}>
          <Text style={{ color: colors.textSecondary, fontSize: 12.5 }}>
            Li e concordo com os Termos de Uso e a Política de Privacidade
          </Text>
        </Checkbox>

        {erro ? <Text style={{ color: colors.danger, fontSize: 13, marginBottom: 8 }}>{erro}</Text> : null}

        <Button title="Aceitar e continuar" onPress={confirmar} loading={loading} disabled={!marcado || loading} />
        <View style={{ height: 8 }} />
        <Button title="Sair da conta" variant="outline" onPress={sair} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  subtitulo: { fontSize: 13.5, marginBottom: 4, lineHeight: 19 },
  atualizado: { fontSize: 12, marginBottom: 20 },
  rodape: { padding: 20, borderTopWidth: 1 },
});