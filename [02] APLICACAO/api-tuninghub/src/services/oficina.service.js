import bcrypt from 'bcrypt';
import OficinaRepository from '../repositories/oficina.repository.js';
import { ValidationError, ConflictError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG, sanitizarCnpj, validarCnpjFormato } from '../utils/validators.js';

class OficinaService {
  async listarOficinas() {
    return await OficinaRepository.findAll();
  }

  async criarOficina(dados) {
    const { nomeOficina, nomeProprietario, telefone, email, senha } = dados;
    const cnpj = sanitizarCnpj(dados.cnpj);

    if (!nomeOficina || !cnpj || !email || !senha) {
      throw new ValidationError('Os campos NomeOficina, CNPJ, Email e Senha são obrigatórios.');
    }

    if (!validarEmail(email)) {
      throw new ValidationError('E-mail inválido.');
    }

    if (!validarSenha(senha)) {
      throw new ValidationError(SENHA_REQUISITOS_MSG);
    }

    if (!validarCnpjFormato(cnpj)) {
      throw new ValidationError('CNPJ inválido.');
    }

    const emailExistente = await OficinaRepository.existsByEmail(email);
    if (emailExistente) {
      throw new ConflictError('Já existe uma oficina cadastrada com este e-mail.');
    }

    const cnpjExistente = await OficinaRepository.findByCnpj(cnpj);
    if (cnpjExistente) {
      throw new ConflictError('Já existe uma oficina cadastrada com este CNPJ.');
    }

    const saltRounds = 10;
    const senhaHasheada = await bcrypt.hash(senha, saltRounds);

    const novoId = await OficinaRepository.create({
      nomeOficina,
      cnpj,
      nomeProprietario,
      telefone,
      email,
      senhaHasheada,
    });

    return { id: novoId, nomeOficina, cnpj, email };
  }
}

export default new OficinaService();