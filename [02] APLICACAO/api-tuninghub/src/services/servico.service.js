import ServicoRepository from '../repositories/servico.repository.js';
import { ValidationError, ConflictError } from '../errors/AppError.js';
import { CATEGORIAS_SERVICO } from '../constants/categoriasServico.js';

class ServicoService {
  async listarServicos() {
    return await ServicoRepository.findAll();
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
}

export default new ServicoService();