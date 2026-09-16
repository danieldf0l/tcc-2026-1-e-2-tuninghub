import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuario.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import AdminRepository from '../repositories/admin.repository.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';
import { ForbiddenError } from '../errors/AppError.js';

class AuthService {
  #gerarToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  async #autenticar({ email, senhaPlain, repository, campoSenha, role }) {
    const registro = await repository.findByEmail(email);
    if (!registro) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(senhaPlain, registro[campoSenha]);
    if (!senhaValida) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const { [campoSenha]: _senha, ...dados } = registro;
    const id = registro.IdUsuario ?? registro.IdOficina ?? registro.IdAdmin;

    const token = this.#gerarToken({ id, email: registro.Email, role });

    return { usuario: dados, token };
  }

  async loginUsuario(email, senha) {
    return this.#autenticar({
      email,
      senhaPlain: senha,
      repository: UsuarioRepository,
      campoSenha: 'Senha',
      role: ROLES.USUARIO,
    });
  }

  async loginOficina(email, senha) {
    const oficina = await OficinaRepository.findByEmailQualquerStatus(email);
    if (!oficina) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(senha, oficina.Senha);
    if (!senhaValida) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    if (!oficina.Ativo) {
      throw new ForbiddenError('Conta desativada. Contate o suporte.');
    }

    const { Senha: _senha, ...dados } = oficina;
    const token = this.#gerarToken({ id: oficina.IdOficina, email: oficina.Email, role: ROLES.OFICINA });

    return { usuario: dados, token };
  }

  async loginAdmin(email, senha) {
    const admin = await AdminRepository.findByEmail(email);
    if (!admin) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }
    const senhaValida = await bcrypt.compare(senha, admin.Senha);
    if (!senhaValida) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const role = admin.NivelAcesso === 'SUPER' ? ROLES.ADMIN_MASTER : ROLES.ADMIN;
    const { Senha: _senha, ...dados } = admin;
    const token = this.#gerarToken({ id: admin.IdAdmin, email: admin.Email, role });

    return { usuario: dados, token };
  }
}

export default new AuthService();