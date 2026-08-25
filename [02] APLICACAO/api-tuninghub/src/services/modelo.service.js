import ModeloRepository from '../repositories/modelo.repository.js';
import MontadoraRepository from '../repositories/montadora.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';

class ModeloService {
  async listarModelos() {
    return await ModeloRepository.findAll();
  }

  async listarModelosAdmin() {
    return await ModeloRepository.findAllAdmin();
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
    if (!montadora) throw new NotFoundError('Montadora não encontrada.');
    if (!montadora.Ativo) {
      throw new ValidationError('Não é possível criar modelo para uma montadora inativa.');
    }

    const duplicado = await ModeloRepository.checkDuplicidade(idMontadora, nome);
    if (duplicado) throw new ConflictError('Este modelo já está registrado para esta montadora.');

    const novoId = await ModeloRepository.create(idMontadora, nome);
    return { idModelo: novoId, idMontadora, nome };
  }

  async atualizarModelo(idModelo, dados) {
    const nome = dados.nome?.trim();
    if (!nome) throw new ValidationError('O nome do modelo é obrigatório.');

    const modelo = await ModeloRepository.findById(idModelo);
    if (!modelo) throw new NotFoundError('Modelo não encontrado.');

    const duplicado = await ModeloRepository.checkDuplicidade(modelo.IdMontadora, nome);
    if (duplicado && String(duplicado.IdModelo) !== String(idModelo)) {
      throw new ConflictError('Já existe outro modelo com este nome para esta montadora.');
    }

    await ModeloRepository.update(idModelo, nome);
    return { idModelo: Number(idModelo), nome };
  }

  async atualizarStatus(idModelo, ativo) {
    if (typeof ativo !== 'boolean') {
      throw new ValidationError('O campo ativo deve ser true ou false.');
    }

    const modelo = await ModeloRepository.findById(idModelo);
    if (!modelo) throw new NotFoundError('Modelo não encontrado.');

    await ModeloRepository.atualizarStatus(idModelo, ativo);
    return { idModelo: Number(idModelo), ativo };
  }
}

export default new ModeloService();