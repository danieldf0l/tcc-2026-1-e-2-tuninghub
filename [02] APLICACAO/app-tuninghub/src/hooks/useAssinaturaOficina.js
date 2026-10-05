import { useAuth } from '../context/AuthContext';

export function useAssinaturaOficina() {
  const { assinatura, verificarAssinatura } = useAuth();
  const temPlanoAtivo = assinatura?.Status === 'ATIVA';

  return { assinatura, temPlanoAtivo, verificar: verificarAssinatura };
}