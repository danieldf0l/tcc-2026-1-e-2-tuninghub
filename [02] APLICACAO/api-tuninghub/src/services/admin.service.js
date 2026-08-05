import bcrypt from 'bcrypt';
import AdminRepository from '../repositories/admin.repository.js';
import { ValidationError, ConflictError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG } from '../utils/validators.js';

const NIVEIS_VALIDOS = ['SUPER', 'PADRAO'];

class AdminService {
  async listarAdmins() {
    return await AdminRepository.findAll();
  }

  async criarAdmin(dados) {
    const { nome, email, senha, nivelAcesso } = dados;

    if (!nome || !email || !senha) {
      throw new ValidationError('Nome, Email e Senha são obrigatórios para registrar um Admin.');
    }

    if (!validarEmail(email)) {
      throw new ValidationError('E-mail inválido.');
    }

    if (!validarSenha(senha)) {
      throw new ValidationError(SENHA_REQUISITOS_MSG);
    }

    if (nivelAcesso && !NIVEIS_VALIDOS.includes(nivelAcesso)) {
      throw new ValidationError(`NivelAcesso inválido. Use um dos valores: ${NIVEIS_VALIDOS.join(', ')}.`);
    }

    const jaExiste = await AdminRepository.existsByEmail(email);
    if (jaExiste) {
      throw new ConflictError('Este e-mail já está vinculado a uma conta administrativa.');
    }

    const saltRounds = 10;
    const senhaHasheada = await bcrypt.hash(senha, saltRounds);
    const novoId = await AdminRepository.create(nome, email, senhaHasheada, nivelAcesso);

    return { id: novoId, nome, email, nivelAcesso: nivelAcesso || 'PADRAO' };
  }
}

export default new AdminService();