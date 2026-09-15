import EstiloRepository from '../repositories/estilo.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';

const gerarCodigo = (nome) =>
  nome
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

class EstiloService {
  async listarEstilos() {
    return await EstiloRepository.findAll();
  }

  async listarEstilosAdmin() {
    return await EstiloRepository.findAllAdmin();
  }

  async criarEstilo(dados) {
    const nome = dados.nome?.trim();
    if (!nome) throw new ValidationError('O nome do estilo é obrigatório.');

    const existentePorNome = await EstiloRepository.findByNome(nome);
    if (existentePorNome) throw new ConflictError('Já existe um estilo com este nome.');

    const codigo = gerarCodigo(nome);
    if (!codigo) throw new ValidationError('Não foi possível gerar um código válido a partir do nome informado.');

    const existentePorCodigo = await EstiloRepository.findByCodigo(codigo);
    if (existentePorCodigo) {
      throw new ConflictError('Já existe um estilo com um código equivalente. Escolha um nome diferente.');
    }

    const novoId = await EstiloRepository.create(codigo, nome);
    return { idEstilo: novoId, codigo, nome };
  }

  async atualizarEstilo(idEstilo, dados) {
    const nome = dados.nome?.trim();
    if (!nome) throw new ValidationError('O nome do estilo é obrigatório.');

    const estilo = await EstiloRepository.findById(idEstilo);
    if (!estilo) throw new NotFoundError('Estilo não encontrado.');

    const duplicado = await EstiloRepository.findByNome(nome);
    if (duplicado && String(duplicado.IdEstilo) !== String(idEstilo)) {
      throw new ConflictError('Já existe outro estilo com este nome.');
    }

    await EstiloRepository.update(idEstilo, nome);
    return { idEstilo: Number(idEstilo), codigo: estilo.Codigo, nome };
  }

  async atualizarStatus(idEstilo, ativo) {
    if (typeof ativo !== 'boolean') throw new ValidationError('O campo ativo deve ser true ou false.');

    const estilo = await EstiloRepository.findById(idEstilo);
    if (!estilo) throw new NotFoundError('Estilo não encontrado.');

    await EstiloRepository.atualizarStatus(idEstilo, ativo);
    return { idEstilo: Number(idEstilo), ativo };
  }
}

export default new EstiloService();