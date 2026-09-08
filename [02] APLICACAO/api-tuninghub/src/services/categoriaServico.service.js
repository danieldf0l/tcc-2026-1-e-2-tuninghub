import CategoriaServicoRepository from '../repositories/categoriaServico.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';

class CategoriaServicoService {
  async listarCategorias() {
    return await CategoriaServicoRepository.findAll();
  }

  async listarCategoriasAdmin() {
    return await CategoriaServicoRepository.findAllAdmin();
  }

  async criarCategoria(dados) {
    const nome = dados.nome?.trim();
    if (!nome) throw new ValidationError('O nome da categoria é obrigatório.');

    const existente = await CategoriaServicoRepository.findByNome(nome);
    if (existente) throw new ConflictError('Já existe uma categoria com este nome.');

    const novoId = await CategoriaServicoRepository.create(nome);
    return { idCategoria: novoId, nome };
  }

  async atualizarCategoria(idCategoria, dados) {
    const nome = dados.nome?.trim();
    if (!nome) throw new ValidationError('O nome da categoria é obrigatório.');

    const categoria = await CategoriaServicoRepository.findById(idCategoria);
    if (!categoria) throw new NotFoundError('Categoria não encontrada.');

    const existente = await CategoriaServicoRepository.findByNome(nome);
    if (existente && String(existente.IdCategoria) !== String(idCategoria)) {
      throw new ConflictError('Já existe outra categoria com este nome.');
    }

    await CategoriaServicoRepository.update(idCategoria, nome);
    return { idCategoria: Number(idCategoria), nome };
  }

  async atualizarStatus(idCategoria, ativo) {
    if (typeof ativo !== 'boolean') {
      throw new ValidationError('O campo ativo deve ser true ou false.');
    }

    const categoria = await CategoriaServicoRepository.findById(idCategoria);
    if (!categoria) throw new NotFoundError('Categoria não encontrada.');

    await CategoriaServicoRepository.atualizarStatus(idCategoria, ativo);
    return { idCategoria: Number(idCategoria), ativo };
  }
}

export default new CategoriaServicoService();