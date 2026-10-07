import { useAuth } from '../context/AuthContext';

export function useAssinaturaOficina() {
  const { assinatura, verificarAssinatura } = useAuth();

  const temPlanoAtivo = assinatura?.Status === 'ATIVA';
  // Mesmo critério do backend (findAtivaPaga): ativa e com valor > 0
  const temPlanoPro = temPlanoAtivo && Number(assinatura?.ValorPlano) > 0;

  return { assinatura, temPlanoAtivo, temPlanoPro, verificar: verificarAssinatura };
}