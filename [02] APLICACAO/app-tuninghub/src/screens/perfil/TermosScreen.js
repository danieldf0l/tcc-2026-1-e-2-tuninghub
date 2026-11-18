import { useAuth } from '../../context/AuthContext';
import { getDocumentosLegais, DATA_ATUALIZACAO } from '../../constants/textosLegais';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import DocumentoLegal from '../../components/DocumentoLegal';

// Logado: usa o tipo da conta. No cadastro (ainda sem conta): usa route.params.tipo.
export default function TermosScreen({ route, navigation }) {
  const { tipoConta } = useAuth();
  const tipo = tipoConta || route.params?.tipo || 'usuario';
  const { termos } = getDocumentosLegais(tipo);

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        titulo="Termos de Uso"
        subtitulo={`${tipo === 'oficina' ? 'Para oficinas' : 'Para entusiastas'} · Atualizados em ${DATA_ATUALIZACAO}`}
      />
      <DocumentoLegal introducao={termos.introducao} clausulas={termos.clausulas} />
    </ScreenContainer>
  );
}
