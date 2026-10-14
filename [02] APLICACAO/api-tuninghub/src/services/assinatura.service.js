import AssinaturaRepository from '../repositories/assinatura.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import PlanoRepository from '../repositories/plano.repository.js';
import AbacatePayService from './abacatePay.service.js';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';

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

class AssinaturaService {
  async listarAssinaturas() {
    return await AssinaturaRepository.findAll();
  }

  async buscarPorOficina(idOficina) {
    await AssinaturaRepository.expirarVencidas(idOficina);
    const [assinatura] = await AssinaturaRepository.findAtivaOuPendentePorOficinaDetalhada(idOficina);
    return assinatura || null;
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

    const bloqueios = await AssinaturaRepository.findBloqueiaCheckoutPorOficina(idOficina);

    if (bloqueios.some((a) => a.Status === 'ATIVA')) {
      throw new ConflictError('Esta oficina já possui um plano pago ativo.');
    }

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

  async ativarAssinatura(assinatura) {
    const plano = await PlanoRepository.findById(assinatura.IdPlano);
    // validade conta a partir da data do pagamento confirmado, não da criação do checkout
    const hoje = new Date().toISOString().slice(0, 10);
    const dataFim = somarDias(hoje, plano.DuracaoDias);
    await AssinaturaRepository.ativarCancelandoAnteriores(assinatura.IdAssinatura, assinatura.IdOficina, dataFim);
    return dataFim;
  }

  async confirmarPagamento(idAssinatura, usuarioLogado) {
    const assinatura = await AssinaturaRepository.findById(idAssinatura);
    if (!assinatura) throw new NotFoundError('Assinatura não encontrada.');

    const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
    if (!ehAdmin && String(assinatura.IdOficina) !== String(usuarioLogado.id)) {
      throw new ForbiddenError('Você não tem permissão para confirmar esta assinatura.');
    }

    if (assinatura.Status !== 'PENDENTE') {
      throw new ValidationError(`Esta assinatura já está com status ${assinatura.Status}.`);
    }

    const checkout = await AbacatePayService.obterCheckout(assinatura.IdCobrancaExterna);

    if (!STATUS_PAGO.includes(checkout.status)) {
      return { status: checkout.status, message: 'Pagamento ainda não confirmado.' };
    }

    const dataFim = await this.ativarAssinatura(assinatura);
    return { status: 'ATIVA', dataFim };
  }
}

export default new AssinaturaService();