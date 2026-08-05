import MontadoraRepository from '../repositories/montadora.repository.js';
import { ValidationError, ConflictError } from '../errors/AppError.js';

class MontadoraService {
  async listarMontadoras() {
    return await MontadoraRepository.findAll();
  }

  async criarMontadora(dados) {
    const nome = dados.nome?.trim();

    if (!nome) {
      throw new ValidationError('O nome da montadora é obrigatório.');
    }

    const montadoraExistente = await MontadoraRepository.findByNome(nome);
    if (montadoraExistente) {
      throw new ConflictError('Esta montadora já está cadastrada no sistema.');
    }

    const novoId = await MontadoraRepository.create(nome);
    return { idMontadora: novoId, nome };
  }
}

export default new MontadoraService();