import { POLITICA_DE_PRIVACIDADE, DATA_ATUALIZACAO } from '../../constants/textosLegais';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import DocumentoLegal from '../../components/DocumentoLegal';

export default function PrivacidadeScreen({ navigation }) {
  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        titulo="Política de Privacidade"
        subtitulo={`Atualizada em ${DATA_ATUALIZACAO}`}
      />
      <DocumentoLegal introducao={POLITICA_DE_PRIVACIDADE.introducao} clausulas={POLITICA_DE_PRIVACIDADE.clausulas} />
    </ScreenContainer>
  );
}