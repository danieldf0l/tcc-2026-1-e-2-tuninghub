import ServicoRepository from '../repositories/servico.repository.js';
import CategoriaServicoRepository from '../repositories/categoriaServico.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';

class ServicoService {
  async listarServicos() {
    return await ServicoRepository.findAll();
  }

  async listarServicosAdmin() {
    return await ServicoRepository.findAllAdmin();
  }

  async criarServico(dados) {
    const nome = dados.nome?.trim();
    const { descricao, idCategoria } = dados;

    if (!nome) throw new ValidationError('O nome do serviço é obrigatório.');
    if (!idCategoria) throw new ValidationError('A categoria (idCategoria) é obrigatória.');

    const categoria = await CategoriaServicoRepository.findByIdAtiva(idCategoria);
    if (!categoria) throw new NotFoundError('Categoria não encontrada ou inativa.');

    const servicoExistente = await ServicoRepository.findByNome(nome);
    if (servicoExistente) throw new ConflictError('Já existe um serviço registrado com este nome no catálogo.');

    const novoId = await ServicoRepository.create(nome, descricao, idCategoria);
    return { id: novoId, nome, descricao: descricao || null, idCategoria, categoria: categoria.Nome };
  }

  async atualizarServico(idServico, dados) {
    const nome = dados.nome?.trim();
    const { descricao, idCategoria } = dados;

    if (!nome) throw new ValidationError('O nome do serviço é obrigatório.');
    if (!idCategoria) throw new ValidationError('A categoria (idCategoria) é obrigatória.');

    const servico = await ServicoRepository.findByIdAdmin(idServico);
    if (!servico) throw new NotFoundError('Serviço não encontrado.');

    const categoria = await CategoriaServicoRepository.findByIdAtiva(idCategoria);
    if (!categoria) throw new NotFoundError('Categoria não encontrada ou inativa.');

    const duplicado = await ServicoRepository.findByNome(nome);
    if (duplicado && String(duplicado.IdServico) !== String(idServico)) {
      throw new ConflictError('Já existe outro serviço com este nome no catálogo.');
    }

    await ServicoRepository.update(idServico, nome, descricao, idCategoria);
    return { idServico: Number(idServico), nome, descricao: descricao || null, idCategoria, categoria: categoria.Nome };
  }

  async atualizarStatus(idServico, ativo) {
    if (typeof ativo !== 'boolean') throw new ValidationError('O campo ativo deve ser true ou false.');

    const servico = await ServicoRepository.findByIdAdmin(idServico);
    if (!servico) throw new NotFoundError('Serviço não encontrado.');

    await ServicoRepository.atualizarStatus(idServico, ativo);
    return { idServico: Number(idServico), ativo };
  }
}

export default new ServicoService();