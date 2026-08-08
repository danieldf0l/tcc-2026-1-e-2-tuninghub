import PlanoRepository from '../repositories/plano.repository.js';
import { ValidationError, ConflictError } from '../errors/AppError.js';

class PlanoService {
  async listarPlanos() {
    return await PlanoRepository.findAll();
  }

  async criarPlano(dados) {
    const nome = dados.nome?.trim();
    const duracaoDias = Number(dados.duracaoDias);
    const valor = dados.valor === undefined || dados.valor === null || dados.valor === ''
      ? 0
      : Number(dados.valor);

    if (!nome || !dados.duracaoDias) {
      throw new ValidationError('Os campos Nome e DuracaoDias são obrigatórios.');
    }
    if (Number.isNaN(duracaoDias) || duracaoDias <= 0) {
      throw new ValidationError('A duração do plano deve ser um número de pelo menos 1 dia.');
    }
    if (Number.isNaN(valor) || valor < 0) {
      throw new ValidationError('O valor do plano deve ser um número igual ou maior que zero.');
    }

    const planoExistente = await PlanoRepository.findByNome(nome);
    if (planoExistente) {
      throw new ConflictError('Já existe um plano cadastrado com este nome.');
    }

    const novoId = await PlanoRepository.create(nome, valor, duracaoDias);
    return { id: novoId, nome, valor, duracaoDias };
  }
}

export default new PlanoService();