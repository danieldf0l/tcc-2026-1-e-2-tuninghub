import MontadoraRepository from '../repositories/montadora.repository.js';
import ModeloRepository from '../repositories/modelo.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';

class MontadoraService {
  async listarMontadoras() {
    return await MontadoraRepository.findAll();
  }

  async listarMontadorasAdmin() {
    return await MontadoraRepository.findAllAdmin();
  }

  async criarMontadora(dados) {
    const nome = dados.nome?.trim();
    if (!nome) throw new ValidationError('O nome da montadora é obrigatório.');

    const existente = await MontadoraRepository.findByNome(nome);
    if (existente) throw new ConflictError('Esta montadora já está cadastrada no sistema.');

    const novoId = await MontadoraRepository.create(nome);
    return { idMontadora: novoId, nome };
  }

  async atualizarMontadora(idMontadora, dados) {
    const nome = dados.nome?.trim();
    if (!nome) throw new ValidationError('O nome da montadora é obrigatório.');

    const montadora = await MontadoraRepository.findById(idMontadora);
    if (!montadora) throw new NotFoundError('Montadora não encontrada.');

    const existente = await MontadoraRepository.findByNome(nome);
    if (existente && String(existente.IdMontadora) !== String(idMontadora)) {
      throw new ConflictError('Já existe outra montadora com este nome.');
    }

    await MontadoraRepository.update(idMontadora, nome);
    return { idMontadora: Number(idMontadora), nome };
  }

  async atualizarStatus(idMontadora, ativo) {
    if (typeof ativo !== 'boolean') {
      throw new ValidationError('O campo ativo deve ser true ou false.');
    }

    const montadora = await MontadoraRepository.findById(idMontadora);
    if (!montadora) throw new NotFoundError('Montadora não encontrada.');

    await MontadoraRepository.atualizarStatus(idMontadora, ativo);

    // Desativar a montadora esconde também todos os modelos dela (evita
    // modelo "ativo" pendurado numa montadora "inativa" no catálogo).
    // Reativar a montadora NÃO reativa os modelos automaticamente.
    if (!ativo) {
      await ModeloRepository.desativarTodosDaMontadora(idMontadora);
    }

    return { idMontadora: Number(idMontadora), ativo };
  }
}

export default new MontadoraService();