import ModeloRepository from '../repositories/modelo.repository.js';
import MontadoraRepository from '../repositories/montadora.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';

class ModeloService {
  async listarModelos() {
    return await ModeloRepository.findAll();
  }

  async listarPorMontadora(idMontadora) {
    if (!idMontadora || Number.isNaN(Number(idMontadora))) {
      throw new ValidationError('O Id da montadora é obrigatório e deve ser numérico.');
    }
    return await ModeloRepository.findByMontadora(idMontadora);
  }

  async criarModelo(dados) {
    const idMontadora = dados.idMontadora;
    const nome = dados.nome?.trim();

    if (!idMontadora || !nome) {
      throw new ValidationError('O IdMontadora e o Nome do modelo são obrigatórios.');
    }

    const montadora = await MontadoraRepository.findById(idMontadora);
    if (!montadora) {
      throw new NotFoundError('Montadora não encontrada.');
    }

    const duplicado = await ModeloRepository.checkDuplicidade(idMontadora, nome);
    if (duplicado) {
      throw new ConflictError('Este modelo já está registrado para esta montadora.');
    }

    const novoId = await ModeloRepository.create(idMontadora, nome);
    return { idModelo: novoId, idMontadora, nome };
  }
}

export default new ModeloService();