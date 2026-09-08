import PlanoRepository from '../repositories/plano.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';

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

  async vincularProdutoExterno(idPlano, idProdutoExterno) {
    if (!idProdutoExterno) throw new ValidationError('idProdutoExterno é obrigatório.');
    const plano = await PlanoRepository.findById(idPlano);
    if (!plano) throw new NotFoundError('Plano não encontrado.');
    await PlanoRepository.atualizarProdutoExterno(idPlano, idProdutoExterno);
    return { idPlano, idProdutoExterno };
  }

  async atualizarPlano(idPlano, dados) {
    const nome = dados.nome?.trim();
    const duracaoDias = Number(dados.duracaoDias);

    if ('valor' in dados) {
      throw new ValidationError('O valor de um plano não pode ser editado. Crie um novo plano caso o preço precise mudar.');
    }
    if (!nome || !dados.duracaoDias) {
      throw new ValidationError('Os campos Nome e DuracaoDias são obrigatórios.');
    }
    if (Number.isNaN(duracaoDias) || duracaoDias <= 0) {
      throw new ValidationError('A duração do plano deve ser um número de pelo menos 1 dia.');
    }

    const plano = await PlanoRepository.findByIdAdmin(idPlano);
    if (!plano) throw new NotFoundError('Plano não encontrado.');

    const duplicado = await PlanoRepository.findByNome(nome);
    if (duplicado && String(duplicado.IdPlano) !== String(idPlano)) {
      throw new ConflictError('Já existe outro plano com este nome.');
    }

    await PlanoRepository.update(idPlano, nome, duracaoDias);
    return { idPlano: Number(idPlano), nome, duracaoDias };
  }

  async atualizarStatus(idPlano, ativo) {
    if (typeof ativo !== 'boolean') {
      throw new ValidationError('O campo ativo deve ser true ou false.');
    }

    const plano = await PlanoRepository.findByIdAdmin(idPlano);
    if (!plano) throw new NotFoundError('Plano não encontrado.');

    await PlanoRepository.atualizarStatus(idPlano, ativo);
    return { idPlano: Number(idPlano), ativo };
  }

  async listarPlanosAdmin() {
    return await PlanoRepository.findAllAdmin();
  }
}

export default new PlanoService();