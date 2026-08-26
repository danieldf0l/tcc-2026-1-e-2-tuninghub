import ServicoRepository from '../repositories/servico.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { CATEGORIAS_SERVICO } from '../constants/categoriasServico.js';

class ServicoService {
  async listarServicos() {
    return await ServicoRepository.findAll();
  }

  async listarServicosAdmin() {
    return await ServicoRepository.findAllAdmin();
  }

  async criarServico(dados) {
    const nome = dados.nome?.trim();
    const { descricao, categoria } = dados;

    if (!nome) {
      throw new ValidationError('O nome do serviço é obrigatório.');
    }
    if (!categoria || !CATEGORIAS_SERVICO.includes(categoria)) {
      throw new ValidationError(`A categoria é obrigatória e deve ser uma das: ${CATEGORIAS_SERVICO.join(', ')}.`);
    }

    const servicoExistente = await ServicoRepository.findByNome(nome);
    if (servicoExistente) {
      throw new ConflictError('Já existe um serviço registrado com este nome no catálogo.');
    }

    const novoId = await ServicoRepository.create(nome, descricao, categoria);
    return { id: novoId, nome, descricao: descricao || null, categoria };
  }

  async atualizarServico(idServico, dados) {
    const nome = dados.nome?.trim();
    const { descricao, categoria } = dados;

    if (!nome) {
      throw new ValidationError('O nome do serviço é obrigatório.');
    }
    if (!categoria || !CATEGORIAS_SERVICO.includes(categoria)) {
      throw new ValidationError(`A categoria é obrigatória e deve ser uma das: ${CATEGORIAS_SERVICO.join(', ')}.`);
    }

    const servico = await ServicoRepository.findByIdAdmin(idServico);
    if (!servico) throw new NotFoundError('Serviço não encontrado.');

    const duplicado = await ServicoRepository.findByNome(nome);
    if (duplicado && String(duplicado.IdServico) !== String(idServico)) {
      throw new ConflictError('Já existe outro serviço com este nome no catálogo.');
    }

    await ServicoRepository.update(idServico, nome, descricao, categoria);
    return { idServico: Number(idServico), nome, descricao: descricao || null, categoria };
  }

  async atualizarStatus(idServico, ativo) {
    if (typeof ativo !== 'boolean') {
      throw new ValidationError('O campo ativo deve ser true ou false.');
    }

    const servico = await ServicoRepository.findByIdAdmin(idServico);
    if (!servico) throw new NotFoundError('Serviço não encontrado.');

    await ServicoRepository.atualizarStatus(idServico, ativo);
    return { idServico: Number(idServico), ativo };
  }
}

export default new ServicoService();