import { TERMOS_DE_USO, DATA_ATUALIZACAO } from '../../constants/textosLegais';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import DocumentoLegal from '../../components/DocumentoLegal';

export default function TermosScreen({ navigation }) {
  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        titulo="Termos de Uso"
        subtitulo={`Atualizados em ${DATA_ATUALIZACAO}`}
      />
      <DocumentoLegal introducao={TERMOS_DE_USO.introducao} clausulas={TERMOS_DE_USO.clausulas} />
    </ScreenContainer>
  );
}