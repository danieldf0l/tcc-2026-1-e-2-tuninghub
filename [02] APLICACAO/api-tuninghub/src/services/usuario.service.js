import bcrypt from 'bcrypt';
import UsuarioRepository from '../repositories/usuario.repository.js';
import { ValidationError, ConflictError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG } from '../utils/validators.js';

class UsuarioService {
  async listarUsuarios() {
    return await UsuarioRepository.findAll();
  }

  async criarUsuario(dados) {
    const { nome, email, senha, confirmarSenha } = dados;

    if (!nome || !email || !senha || !confirmarSenha) {
      throw new ValidationError('Todos os campos (nome, email, senha, confirmarSenha) são obrigatórios.');
    }

    if (!validarEmail(email)) {
      throw new ValidationError('E-mail inválido.');
    }

    if (senha !== confirmarSenha) {
      throw new ValidationError('As senhas não coincidem.');
    }

    if (!validarSenha(senha)) {
      throw new ValidationError(SENHA_REQUISITOS_MSG);
    }

    const jaExiste = await UsuarioRepository.existsByEmail(email);
    if (jaExiste) {
      throw new ConflictError('Este e-mail já está em uso.');
    }

    const saltRounds = 10;
    const senhaHasheada = await bcrypt.hash(senha, saltRounds);
    const novoId = await UsuarioRepository.create(nome, email, senhaHasheada);

    return { id: novoId, nome, email };
  }
}

export default new UsuarioService();