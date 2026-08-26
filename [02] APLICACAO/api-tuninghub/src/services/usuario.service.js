import bcrypt from 'bcrypt';
import UsuarioRepository from '../repositories/usuario.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG } from '../utils/validators.js';

class UsuarioService {
  async listarUsuarios() {
    return await UsuarioRepository.findAll();
  }

  async criarUsuario(dados) {
    const { nome, email, senha, confirmarSenha, termosAceitos } = dados;

    if (!nome || !email || !senha || !confirmarSenha) {
      throw new ValidationError('Todos os campos (nome, email, senha, confirmarSenha) são obrigatórios.');
    }
    if (termosAceitos !== true) {
      throw new ValidationError('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
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
    const novoId = await UsuarioRepository.create(nome, email, senhaHasheada, new Date());

    return { id: novoId, nome, email };
  }

  async aceitarTermos(idUsuario) {
    const linhasAfetadas = await UsuarioRepository.aceitarTermos(idUsuario);
    if (linhasAfetadas === 0) throw new NotFoundError('Usuário não encontrado.');
    return { message: 'Termos aceitos com sucesso.' };
  }
}

export default new UsuarioService();