import OficinaServicoRepository from '../repositories/oficinaServico.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import ServicoRepository from '../repositories/servico.repository.js';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';

const resolverIdOficina = (idOficinaInformado, usuarioLogado) => {
  const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
  return ehAdmin ? idOficinaInformado : usuarioLogado.id;
};

const verificarPermissao = (idOficina, usuarioLogado) => {
  const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
  const ehDono = String(usuarioLogado.id) === String(idOficina);
  if (!ehAdmin && !ehDono) {
    throw new ForbiddenError('Você não tem permissão para alterar os serviços desta oficina.');
  }
};

class OficinaServicoService {
  async listarPorOficina(idOficina) {
    if (!idOficina) throw new ValidationError('O Id da oficina é obrigatório.');
    return await OficinaServicoRepository.findByOficina(idOficina);
  }

  async vincularServico(dados, usuarioLogado) {
    const idOficina = resolverIdOficina(dados.idOficina, usuarioLogado);
    const { idServico } = dados;

    if (!idOficina || !idServico) {
      throw new ValidationError('Os campos idOficina e idServico são obrigatórios.');
    }

    verificarPermissao(idOficina, usuarioLogado);

    const oficina = await OficinaRepository.findById(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    const servico = await ServicoRepository.findById(idServico);
    if (!servico) throw new NotFoundError('Serviço não encontrado.');

    const vinculoExistente = await OficinaServicoRepository.checkVinculo(idOficina, idServico);
    if (vinculoExistente) {
      throw new ConflictError('Este serviço já está vinculado a esta oficina.');
    }

    const novoId = await OficinaServicoRepository.vincular(idOficina, idServico);
    return { idOficinaServico: novoId, idOficina, idServico };
  }

  async desvincularServico(idOficina, idServico, usuarioLogado) {
    if (!idOficina || !idServico) {
      throw new ValidationError('Os campos idOficina e idServico são obrigatórios para desvincular.');
    }

    verificarPermissao(idOficina, usuarioLogado);

    const linhasAfetadas = await OficinaServicoRepository.desvincular(idOficina, idServico);
    if (linhasAfetadas === 0) {
      throw new NotFoundError('Vínculo não encontrado.');
    }

    return { message: 'Serviço desvinculado com sucesso.' };
  }
}

export default new OficinaServicoService();