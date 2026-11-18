import { DIAS_ARREPENDIMENTO, PERCENTUAL_MULTA_RESCISORIA } from '../constants/assinatura.js';

// Trabalha em CENTAVOS (inteiros) para não ter erro de arredondamento com dinheiro.
const emCentavos = (valor) => Math.round(Number(valor) * 100);
const emReais = (centavos) => centavos / 100;

export const formatarReais = (valor) => `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;

// Reembolso de UM período pago. Espera os campos que o repository calcula no banco:
// ValorPlano, DuracaoDias, DiasParaVencer, DiasDesdePagamento.
export const calcularReembolsoPeriodo = (periodo) => {
  const valorPago = emCentavos(periodo.ValorPlano);
  const diasTotais = Number(periodo.DuracaoDias);
  const diasRestantes = Math.max(0, Math.min(diasTotais, Number(periodo.DiasParaVencer)));

  const desdePagamento = periodo.DiasDesdePagamento;
  const direitoArrependimento =
    desdePagamento !== null && desdePagamento !== undefined && Number(desdePagamento) <= DIAS_ARREPENDIMENTO;

  let multa = 0;
  let reembolso;
  if (direitoArrependimento) {
    reembolso = valorPago;
  } else {
    const proporcional = Math.round((valorPago * diasRestantes) / diasTotais);
    multa = Math.round((proporcional * PERCENTUAL_MULTA_RESCISORIA) / 100);
    reembolso = proporcional - multa;
  }

  return {
    IdAssinatura: periodo.IdAssinatura,
    NomePlano: periodo.NomePlano,
    valorPago: emReais(valorPago),
    diasTotais,
    diasRestantes,
    direitoArrependimento,
    multa: emReais(multa),
    valorReembolso: emReais(reembolso),
  };
};

export const calcularReembolsoTotal = (periodos) => {
  const detalhes = periodos.map(calcularReembolsoPeriodo);
  const totalCentavos = detalhes.reduce((soma, d) => soma + emCentavos(d.valorReembolso), 0);
  return { valor: emReais(totalCentavos), estornoAutomatico: false, periodos: detalhes };
};