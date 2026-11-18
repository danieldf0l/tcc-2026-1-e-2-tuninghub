import AssinaturaRepository from '../repositories/assinatura.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import PlanoRepository from '../repositories/plano.repository.js';
import AbacatePayService from './abacatePay.service.js';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';
import { DIAS_RENOVACAO_ANTECIPADA, CONFIRMACAO_CANCELAMENTO } from '../constants/assinatura.js';
import { calcularReembolsoTotal, formatarReais } from '../utils/reembolso.js';

const STATUS_PAGO = ['PAID', 'COMPLETED'];

const somarDias = (data, dias) => {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado.toISOString().slice(0, 10);
};

const resolverIdOficina = (dados, usuarioLogado) => {
  const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
  return ehAdmin ? dados.idOficina : usuarioLogado.id;
};

// Campos calculados no banco só para as regras; não vão no JSON da assinatura principal.
const CAMPOS_INTERNOS = ['DiasParaVencer', 'DiasDesdePagamento', 'InicioBR', 'RenovacaoLiberadaEm', 'RenovacaoLiberadaEmBR'];
const semCamposInternos = (linha) => {
  const copia = { ...linha };
  CAMPOS_INTERNOS.forEach((campo) => delete copia[campo]);
  return copia;
};

const resumirAssinatura = (linha) => ({
  IdAssinatura: linha.IdAssinatura,
  IdPlano: linha.IdPlano,
  NomePlano: linha.NomePlano,
  ValorPlano: linha.ValorPlano,
  DataInicio: linha.DataInicio,
  DataFim: linha.DataFim,
  Status: linha.Status,
});

class AssinaturaService {
  async listarAssinaturas() {
    return await AssinaturaRepository.findAll();
  }

  // GET /assinatura/minha: a fonte do plano no app.
  // Prioridade da principal: Pro vigente > cobrança PIX pendente > plano gratuito > último Pro vencido (EXPIRADA).
  async buscarPorOficina(idOficina) {
    await AssinaturaRepository.expirarVencidas(idOficina);

    const [pros, pendentes, gratuita] = await Promise.all([
      AssinaturaRepository.findProVigentesDetalhadas(idOficina, DIAS_RENOVACAO_ANTECIPADA),
      AssinaturaRepository.findPendentesDetalhadas(idOficina),
      AssinaturaRepository.findGratuitaVigenteDetalhada(idOficina),
    ]);

    const pro = pros[0] || null;
    const renovacaoPaga = pros[1] || null; // renovação já paga que ainda vai começar
    const pendente = pendentes[0] || null;

    const principal = pro || pendente || gratuita || (await AssinaturaRepository.findUltimaExpiradaPagaDetalhada(idOficina));
    if (!principal) return null;

    const ehPro = Boolean(pro);
    const dentroDaJanela = ehPro && Number(pro.DiasParaVencer) <= DIAS_RENOVACAO_ANTECIPADA;

    return {
      ...semCamposInternos(principal),
      diasParaVencer: ehPro ? Number(pro.DiasParaVencer) : null,
      podeRenovar: ehPro ? dentroDaJanela && !renovacaoPaga : principal.Status === 'EXPIRADA',
      podeCancelar: ehPro || principal === pendente,
      renovacaoLiberadaEm: ehPro && !dentroDaJanela ? pro.RenovacaoLiberadaEm : null,
      renovacaoPendente: ehPro && pendente ? resumirAssinatura(pendente) : null,
      renovacaoPaga: renovacaoPaga ? resumirAssinatura(renovacaoPaga) : null,
      reembolsoEstimado: ehPro ? calcularReembolsoTotal(pros) : null,
    };
  }

  async criarAssinaturaGratuita(dados, usuarioLogado) {
    const idOficina = resolverIdOficina(dados, usuarioLogado);
    const { idPlano, dataInicio } = dados;

    if (!idOficina || !idPlano || !dataInicio) {
      throw new ValidationError('Os campos IdOficina, IdPlano e DataInicio são obrigatórios.');
    }

    const oficina = await OficinaRepository.findById(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    const plano = await PlanoRepository.findById(idPlano);
    if (!plano) throw new NotFoundError('Plano não encontrado.');
    if (Number(plano.Valor) > 0) {
      throw new ValidationError('Este plano é pago. Use o endpoint de checkout para assiná-lo.');
    }

    await AssinaturaRepository.expirarVencidas(idOficina);

    const existente = await AssinaturaRepository.findAtivaOuPendentePorOficina(idOficina);
    if (existente.length > 0) {
      throw new ConflictError('Esta oficina já possui uma assinatura ativa ou pendente.');
    }

    const dataFim = somarDias(dataInicio, plano.DuracaoDias);
    const novoId = await AssinaturaRepository.create({
      idOficina, idPlano, dataInicio, dataFim, status: 'ATIVA',
    });

    return { id: novoId, idOficina, idPlano, dataInicio, dataFim, status: 'ATIVA' };
  }

  async iniciarCheckout(dados, usuarioLogado) {
    const idOficina = resolverIdOficina(dados, usuarioLogado);
    const { idPlano } = dados;

    if (!idOficina || !idPlano) {
      throw new ValidationError('Os campos IdOficina e IdPlano são obrigatórios.');
    }

    const oficina = await OficinaRepository.findById(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    const plano = await PlanoRepository.findById(idPlano);
    if (!plano) throw new NotFoundError('Plano não encontrado.');
    if (Number(plano.Valor) <= 0) {
      throw new ValidationError('Este plano é gratuito e não precisa de checkout.');
    }

    await AssinaturaRepository.expirarVencidas(idOficina);

    // Renovação antecipada: com Pro vigente, só nos últimos DIAS_RENOVACAO_ANTECIPADA dias, e uma de cada vez.
    const pros = await AssinaturaRepository.findProVigentesDetalhadas(idOficina, DIAS_RENOVACAO_ANTECIPADA);
    if (pros.length > 1) {
      throw new ConflictError(`Sua renovação já está paga e começa em ${pros[1].InicioBR}.`);
    }
    if (pros.length === 1 && Number(pros[0].DiasParaVencer) > DIAS_RENOVACAO_ANTECIPADA) {
      throw new ConflictError(`Você poderá renovar a partir de ${pros[0].RenovacaoLiberadaEmBR}.`);
    }

    const bloqueios = await AssinaturaRepository.findBloqueiaCheckoutPorOficina(idOficina);
    const pendente = bloqueios.find((a) => a.Status === 'PENDENTE');
    if (pendente) {
      const reaproveitado = await this.tratarPendente(pendente, idPlano);
      if (reaproveitado) return reaproveitado;
      // se chegou aqui, a pendente foi cancelada e um novo checkout pode ser gerado
    }

    return await this.gerarNovoCheckout(idOficina, plano);
  }

  // Resolve uma assinatura PENDENTE antiga antes de gerar novo checkout:
  // - já paga: ativa e avisa (não cancela de jeito nenhum um pagamento feito);
  // - ainda aguardando pagamento no mesmo plano: devolve a mesma URL;
  // - expirada/cancelada/plano diferente: cancela para liberar novo checkout.
  async tratarPendente(pendente, idPlano) {
    // Se o AbacatePay estiver fora do ar, o erro 503 propaga (não cancela às cegas).
    const checkout = await AbacatePayService.obterCheckout(pendente.IdCobrancaExterna);

    if (STATUS_PAGO.includes(checkout.status)) {
      await this.ativarAssinatura(pendente);
      throw new ConflictError('O pagamento anterior já foi confirmado e a assinatura foi ativada.');
    }

    if (checkout.status === 'PENDING' && checkout.url && String(pendente.IdPlano) === String(idPlano)) {
      return { idAssinatura: pendente.IdAssinatura, checkoutUrl: checkout.url, reaproveitado: true };
    }

    await AssinaturaRepository.atualizarStatus(pendente.IdAssinatura, 'CANCELADA');
    return null;
  }

  async gerarNovoCheckout(idOficina, plano) {
    const checkout = await AbacatePayService.criarCheckout({
      idProdutoExterno: plano.IdProdutoExterno,
      metadata: { idOficina, idPlano: plano.IdPlano },
    });

    const dataInicio = new Date().toISOString().slice(0, 10);
    const idAssinatura = await AssinaturaRepository.create({
      idOficina,
      idPlano: plano.IdPlano,
      dataInicio,
      dataFim: null,
      status: 'PENDENTE',
      idCobrancaExterna: checkout.id,
    });

    return { idAssinatura, checkoutUrl: checkout.url };
  }

  // Pagamento confirmado: ativa. Com Pro vigente, o novo período SOMA ao DataFim atual (renovação antecipada).
  // Devolve { dataInicio, dataFim, renovacao } ou null se já tinha sido ativada por outra chamada.
  async ativarAssinatura(assinatura) {
    const plano = await PlanoRepository.findById(assinatura.IdPlano);
    return await AssinaturaRepository.ativarPagamentoConfirmado({
      idAssinatura: assinatura.IdAssinatura,
      idOficina: assinatura.IdOficina,
      duracaoDias: plano.DuracaoDias,
    });
  }

  async confirmarPagamento(idAssinatura, usuarioLogado) {
    const assinatura = await AssinaturaRepository.findById(idAssinatura);
    if (!assinatura) throw new NotFoundError('Assinatura não encontrada.');

    const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
    if (!ehAdmin && String(assinatura.IdOficina) !== String(usuarioLogado.id)) {
      throw new ForbiddenError('Você não tem permissão para confirmar esta assinatura.');
    }

    // CANCELADA que nunca foi paga ainda pode ser confirmada: se o PIX foi pago depois do cancelamento,
    // o cliente pagou, então a assinatura é ativada normalmente.
    const cobrancaNuncaPaga = assinatura.Status === 'CANCELADA' && !assinatura.DataPagamento && assinatura.IdCobrancaExterna;
    if (assinatura.Status !== 'PENDENTE' && !cobrancaNuncaPaga) {
      throw new ValidationError(`Esta assinatura já está com status ${assinatura.Status}.`);
    }

    const checkout = await AbacatePayService.obterCheckout(assinatura.IdCobrancaExterna);

    if (!STATUS_PAGO.includes(checkout.status)) {
      return { status: checkout.status, message: 'Pagamento ainda não confirmado.' };
    }

    const ativada = await this.ativarAssinatura(assinatura);
    if (!ativada) return { status: 'ATIVA', message: 'Esta assinatura já foi ativada.' };
    return { status: 'ATIVA', ...ativada };
  }

  // Cancelamento pela própria oficina (POST /assinatura/minha/cancelar). O id vem sempre do token.
  // - Pro vigente: cancela o período atual e qualquer renovação paga ou pendente, calcula o reembolso (CDC)
  //   e coloca a oficina no plano gratuito. A API só CALCULA o valor; não estorna nada.
  // - Só cobrança PIX pendente: cancela a cobrança (e volta ao gratuito se não restar plano nenhum).
  // - apenasRenovacaoPendente: cancela só o PIX de renovação, mantendo o Pro.
  async cancelarMinhaAssinatura(dados, usuarioLogado) {
    const idOficina = usuarioLogado.id;
    const { confirmacao, apenasRenovacaoPendente = false } = dados || {};

    if (confirmacao !== CONFIRMACAO_CANCELAMENTO) {
      throw new ValidationError(`Para cancelar, envie confirmacao: "${CONFIRMACAO_CANCELAMENTO}".`);
    }

    await AssinaturaRepository.expirarVencidas(idOficina);

    const [pros, pendentes, gratuita] = await Promise.all([
      AssinaturaRepository.findProVigentesDetalhadas(idOficina, DIAS_RENOVACAO_ANTECIPADA),
      AssinaturaRepository.findPendentesDetalhadas(idOficina),
      AssinaturaRepository.findGratuitaVigenteDetalhada(idOficina),
    ]);

    const prosParaCancelar = apenasRenovacaoPendente === true ? [] : pros;

    if (prosParaCancelar.length === 0 && pendentes.length === 0) {
      if (apenasRenovacaoPendente === true) throw new ConflictError('Você não tem renovação pendente para cancelar.');
      if (gratuita) throw new ConflictError('O plano gratuito não pode ser cancelado.');
      throw new ConflictError('Você não tem assinatura ativa ou pendente para cancelar.');
    }

    // PIX que na verdade já foi pago não é cancelado: ativa (o cliente pagou) e avisa.
    // Se o AbacatePay estiver fora do ar, o 503 propaga e nada é cancelado às cegas.
    for (const pendente of pendentes) {
      if (!pendente.IdCobrancaExterna) continue;
      const checkout = await AbacatePayService.obterCheckout(pendente.IdCobrancaExterna);
      if (STATUS_PAGO.includes(checkout.status)) {
        await this.ativarAssinatura(pendente);
        throw new ConflictError(
          'O pagamento desta assinatura já foi confirmado e ela foi ativada. Se quiser encerrá-la, cancele novamente.'
        );
      }
    }

    const reembolso = prosParaCancelar.length > 0 ? calcularReembolsoTotal(prosParaCancelar) : null;
    const cancelamentos = [
      ...(reembolso ? reembolso.periodos.map((p) => ({ idAssinatura: p.IdAssinatura, valorReembolso: p.valorReembolso })) : []),
      ...pendentes.map((p) => ({ idAssinatura: p.IdAssinatura, valorReembolso: null })),
    ];

    // Sobrou algum plano vigente? Se não, a oficina vai para o gratuito (o app bloqueia oficina sem assinatura).
    const restaPlano = (apenasRenovacaoPendente === true && pros.length > 0) || Boolean(gratuita);
    let gratuito = null;
    if (!restaPlano) {
      const planoGratuito = await AssinaturaRepository.findPlanoGratuitoAtivo();
      if (!planoGratuito) {
        throw new ConflictError('Não há plano gratuito disponível para receber a sua oficina. Contate o suporte.');
      }
      gratuito = { idPlano: planoGratuito.IdPlano, duracaoDias: planoGratuito.DuracaoDias };
    }

    const cancelou = await AssinaturaRepository.cancelarAssinaturas({ idOficina, cancelamentos, gratuito });
    if (!cancelou) {
      throw new ConflictError('Sua assinatura mudou durante o cancelamento. Confira o plano e tente novamente.');
    }

    let message;
    if (reembolso) {
      message = reembolso.valor > 0
        ? `Assinatura Pro cancelada. Valor a ser devolvido: ${formatarReais(reembolso.valor)}. O estorno é tratado pelo suporte.`
        : 'Assinatura Pro cancelada. Não há valor a devolver.';
    } else {
      message = 'Cobrança pendente cancelada.';
    }
    if (gratuito) message += ' Sua oficina voltou para o plano gratuito.';

    return { message, reembolso, assinatura: await this.buscarPorOficina(idOficina) };
  }
}

export default new AssinaturaService();