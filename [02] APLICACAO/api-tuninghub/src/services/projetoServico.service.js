import ProjetoServicoRepository from '../repositories/projetoServico.repository.js';
import ProjetoRepository from '../repositories/projeto.repository.js';
import ServicoRepository from '../repositories/servico.repository.js';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';

const verificarPropriedade = async (idProjeto, usuarioLogado) => {
  const projeto = await ProjetoRepository.findById(idProjeto);
  if (!projeto) throw new NotFoundError('Projeto não encontrado.');

  const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
  const ehDono = String(projeto.IdUsuario) === String(usuarioLogado.id);

  if (!ehAdmin && !ehDono) {
    throw new ForbiddenError('Você não tem permissão para alterar os serviços deste projeto.');
  }
  return projeto;
};

class ProjetoServicoService {
  async listarPorProjeto(idProjeto, usuarioLogado) {
    if (!idProjeto) throw new ValidationError('O Id do projeto é obrigatório.');
    await verificarPropriedade(idProjeto, usuarioLogado);
    return await ProjetoServicoRepository.findByProjeto(idProjeto);
  }

  async adicionarServico(dados, usuarioLogado) {
    const { idProjeto, idServico } = dados;
    if (!idProjeto || !idServico) {
      throw new ValidationError('Os campos idProjeto e idServico são obrigatórios.');
    }

    await verificarPropriedade(idProjeto, usuarioLogado);

    const servico = await ServicoRepository.findById(idServico);
    if (!servico) throw new NotFoundError('Serviço não encontrado.');

    const vinculoExistente = await ProjetoServicoRepository.checkVinculo(idProjeto, idServico);
    if (vinculoExistente) {
      throw new ConflictError('Este serviço já foi adicionado a este projeto.');
    }

    const novoId = await ProjetoServicoRepository.vincular(idProjeto, idServico);
    return { idProjetoServico: novoId, idProjeto, idServico };
  }

  async removerServico(idProjeto, idServico, usuarioLogado) {
    if (!idProjeto || !idServico) {
      throw new ValidationError('Os campos idProjeto e idServico são obrigatórios para a remoção.');
    }

    await verificarPropriedade(idProjeto, usuarioLogado);

    const linhasAfetadas = await ProjetoServicoRepository.desvincular(idProjeto, idServico);
    if (linhasAfetadas === 0) {
      throw new NotFoundError('O serviço selecionado não foi encontrado neste projeto.');
    }
    return { message: 'Serviço removido do projeto com sucesso.' };
  }

  async marcarConcluido(idProjeto, idServico, concluido, usuarioLogado) {
    if (typeof concluido !== 'boolean') {
      throw new ValidationError('O campo concluido deve ser true ou false.');
    }

    await verificarPropriedade(idProjeto, usuarioLogado);

    const linhasAfetadas = await ProjetoServicoRepository.marcarConcluido(idProjeto, idServico, concluido);
    if (linhasAfetadas === 0) {
      throw new NotFoundError('O serviço selecionado não foi encontrado neste projeto.');
    }
    return { message: `Item marcado como ${concluido ? 'concluído' : 'pendente'}.` };
  }
}

export default new ProjetoServicoService();