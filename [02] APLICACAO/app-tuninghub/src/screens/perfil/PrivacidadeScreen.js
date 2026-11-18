import { useAuth } from '../../context/AuthContext';
import { getDocumentosLegais, DATA_ATUALIZACAO } from '../../constants/textosLegais';
import ScreenContainer from '../../components/ScreenContainer';
import ScreenHeader from '../../components/ScreenHeader';
import DocumentoLegal from '../../components/DocumentoLegal';

// Logado: usa o tipo da conta. No cadastro (ainda sem conta): usa route.params.tipo.
export default function PrivacidadeScreen({ route, navigation }) {
  const { tipoConta } = useAuth();
  const tipo = tipoConta || route.params?.tipo || 'usuario';
  const { privacidade } = getDocumentosLegais(tipo);

  return (
    <ScreenContainer>
      <ScreenHeader
        onVoltar={() => navigation.goBack()}
        titulo="Política de Privacidade"
        subtitulo={`${tipo === 'oficina' ? 'Para oficinas' : 'Para entusiastas'} · Atualizada em ${DATA_ATUALIZACAO}`}
      />
      <DocumentoLegal introducao={privacidade.introducao} clausulas={privacidade.clausulas} />
    </ScreenContainer>
  );
}
