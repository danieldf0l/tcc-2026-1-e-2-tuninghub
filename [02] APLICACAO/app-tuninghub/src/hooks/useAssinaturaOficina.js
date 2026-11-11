import { useAuth } from '../context/AuthContext';

// Data "AAAA-MM-DD" → Date local (sem fuso), para comparar só o dia
function paraDataLocal(valor) {
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function useAssinaturaOficina() {
  const { assinatura, verificarAssinatura } = useAuth();

  const ativa = assinatura?.Status === 'ATIVA';
  const paga = Number(assinatura?.ValorPlano) > 0;

  // Dias até a DataFim (0 = vence hoje, negativo = venceu). null = sem data de fim.
  let diasRestantes = null;
  if (assinatura?.DataFim) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    diasRestantes = Math.round((paraDataLocal(assinatura.DataFim) - hoje) / 86400000);
  }

  // Mesmo critério do backend (CONDICAO_PLANO_PAGO): ATIVA, Valor > 0 e DataFim nula ou não vencida
  const dentroDaValidade = diasRestantes === null || diasRestantes >= 0;
  const temPlanoAtivo = ativa && dentroDaValidade;
  const temPlanoPro = temPlanoAtivo && paga;
  const planoVencido = paga && (assinatura?.Status === 'EXPIRADA' || (ativa && !dentroDaValidade));
  const venceEmBreve = temPlanoPro && diasRestantes !== null && diasRestantes <= 7;

  return {
    assinatura,
    temPlanoAtivo,
    temPlanoPro,
    planoVencido,
    diasRestantes,
    venceEmBreve,
    verificar: verificarAssinatura,
  };
}