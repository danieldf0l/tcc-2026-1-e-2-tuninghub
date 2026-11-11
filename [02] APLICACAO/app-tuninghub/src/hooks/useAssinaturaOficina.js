import { useAuth } from '../context/AuthContext';

// Data "AAAA-MM-DD" → Date local (sem fuso), para comparar só o dia
function paraDataLocal(valor) {
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

// Mesma regra do backend (CONDICAO_PLANO_PAGO): ATIVA, Valor > 0 e DataFim nula ou não vencida
export function analisarAssinatura(assinatura) {
  const ativa = assinatura?.Status === 'ATIVA';
  const paga = Number(assinatura?.ValorPlano) > 0;

  // 0 = vence hoje, negativo = venceu, null = sem data de fim
  let diasRestantes = null;
  if (assinatura?.DataFim) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    diasRestantes = Math.round((paraDataLocal(assinatura.DataFim) - hoje) / 86400000);
  }

  const dentroDaValidade = diasRestantes === null || diasRestantes >= 0;
  const temPlanoAtivo = ativa && dentroDaValidade;
  const temPlanoPro = temPlanoAtivo && paga;

  return {
    temPlanoAtivo,
    temPlanoPro,
    gratuitoAtivo: temPlanoAtivo && !paga,
    pendente: assinatura?.Status === 'PENDENTE',
    planoVencido: paga && (assinatura?.Status === 'EXPIRADA' || (ativa && !dentroDaValidade)),
    diasRestantes,
    venceEmBreve: temPlanoPro && diasRestantes !== null && diasRestantes <= 7,
  };
}

export function useAssinaturaOficina() {
  const { assinatura, verificarAssinatura } = useAuth();
  return { assinatura, ...analisarAssinatura(assinatura), verificar: verificarAssinatura };
}