import AssinaturaRepository from '../repositories/assinatura.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import PlanoRepository from '../repositories/plano.repository.js';
import AbacatePayService from './abacatePay.service.js';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';

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

  // Fluxo do Plano Gratuito -- ativa na hora, sem pagamento
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

  // Fluxo do Plano Pro -- gera checkout no AbacatePay
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

    const existente = await AssinaturaRepository.findAtivaOuPendentePorOficina(idOficina);
    if (existente.length > 0) {
      throw new ConflictError('Esta oficina já possui uma assinatura ativa ou pendente.');
    }

    const checkout = await AbacatePayService.criarCheckout({
      idProdutoExterno: plano.IdProdutoExterno,
      metadata: { idOficina, idPlano },
    });

    const dataInicio = new Date().toISOString().slice(0, 10);
    const idAssinatura = await AssinaturaRepository.create({
      idOficina, idPlano, dataInicio, dataFim: null, status: 'PENDENTE', idCobrancaExterna: checkout.id,
    });

    return { idAssinatura, checkoutUrl: checkout.url };
  }

  // Confirma o pagamento consultando o status real no AbacatePay
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

    // NOTA: confirmar o valor exato de "status pago" no primeiro teste real (ver comentário no abacatePay.service.js)
    if (checkout.status !== 'PAID' && checkout.status !== 'COMPLETED') {
      return { status: checkout.status, message: 'Pagamento ainda não confirmado.' };
    }

    const plano = await PlanoRepository.findById(assinatura.IdPlano);
    const dataFim = somarDias(assinatura.DataInicio, plano.DuracaoDias);
    await AssinaturaRepository.ativar(idAssinatura, dataFim);

    return { status: 'ATIVA', dataFim };
  }
}

export default new AssinaturaService();