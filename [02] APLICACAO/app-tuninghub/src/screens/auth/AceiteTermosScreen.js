import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileText } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { aceitarTermos as aceitarTermosUsuario } from '../../api/usuario.api';
import { aceitarTermosOficina } from '../../api/oficina.api';
import { getErrorMessage } from '../../utils/errorHandler';
import { TERMOS_DE_USO, DATA_ATUALIZACAO } from '../../constants/textosLegais';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import AvisoInline from '../../components/AvisoInline';
import DocumentoLegal from '../../components/DocumentoLegal';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';

export default function AceiteTermosScreen() {
  const { colors, fonts, typography } = useTheme();
  const { tipoConta, atualizarAceiteTermos, sair } = useAuth();
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
      if (tipoConta === 'oficina') {
        await aceitarTermosOficina();
      } else {
        await aceitarTermosUsuario();
      }
      atualizarAceiteTermos();
    } catch (e) {
      setErro(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const rodape = (
    <>
      <Checkbox marcado={marcado} onToggle={() => setMarcado((v) => !v)}>
        <Text style={[typography.caption, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          Li e concordo com os Termos de Uso e a Política de Privacidade
        </Text>
      </Checkbox>

      <View style={styles.espaco} />
      <AvisoInline mensagem={erro} />

      <Button title="Aceitar e continuar" onPress={confirmar} loading={loading} disabled={!marcado || loading} />
      <View style={styles.espacoPequeno} />
      <Button title="Sair da conta" variant="ghost" onPress={sair} />
    </>
  );

  return (
    <ScreenContainer rodape={rodape}>
      <ScreenHeader
        Icone={FileText}
        titulo="Atualizamos nossos termos"
        subtitulo="Para continuar usando o TuningHub, leia e aceite os Termos de Uso abaixo."
      />

      <Text style={[typography.caption, styles.atualizado, { color: colors.textSecondary }]}>
        Atualizado em: {DATA_ATUALIZACAO}
      </Text>

      <DocumentoLegal introducao={TERMOS_DE_USO.introducao} clausulas={TERMOS_DE_USO.clausulas} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  atualizado: { marginTop: -12, marginBottom: 20 },
  espaco: { height: 8 },
  espacoPequeno: { height: 4 },
});