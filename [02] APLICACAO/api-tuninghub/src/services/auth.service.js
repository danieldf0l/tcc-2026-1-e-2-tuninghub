import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import UsuarioRepository from '../repositories/usuario.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import AdminRepository from '../repositories/admin.repository.js';
import TokenRecuperacaoRepository from '../repositories/tokenRecuperacao.repository.js';
import EmailService from './email.service.js';
import { UnauthorizedError, ForbiddenError, ValidationError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG } from '../utils/validators.js';
import LogSistemaService from './logSistema.service.js';

// Recuperação de senha (RN05): usuário e oficina; admin fica de fora.
const TIPOS_RECUPERACAO = {
  usuario: {
    repo: UsuarioRepository,
    idDaConta: (conta) => conta.IdUsuario,
    nomeDaConta: (conta) => conta.Nome,
  },
  oficina: {
    repo: OficinaRepository,
    idDaConta: (conta) => conta.IdOficina,
    nomeDaConta: (conta) => conta.NomeOficina,
  },
};
const VALIDADE_CODIGO_MINUTOS = 15;
const MAX_TENTATIVAS_CODIGO = 5;
const MSG_CODIGO_INVALIDO = 'Código inválido ou expirado.';

class AuthService {
  #gerarToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  async loginUsuario(email, senha) {
    const usuario = await UsuarioRepository.findByEmailQualquerStatus(email);
    if (!usuario) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.Senha);
    if (!senhaValida) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    if (!usuario.Ativo) {
      throw new ForbiddenError('Conta desativada. Contate o suporte.');
    }

    const { Senha: _senha, ...dados } = usuario;
    const token = this.#gerarToken({ id: usuario.IdUsuario, email: usuario.Email, role: ROLES.USUARIO });

    return { usuario: dados, token };
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
    const admin = await AdminRepository.findByEmailQualquerStatus(email);
    if (!admin) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }
    const senhaValida = await bcrypt.compare(senha, admin.Senha);
    if (!senhaValida) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    if (!admin.Ativo) {
      throw new ForbiddenError('Conta desativada. Contate o suporte.');
    }

    const role = admin.NivelAcesso === 'SUPER' ? ROLES.ADMIN_MASTER : ROLES.ADMIN;
    const { Senha: _senha, ...dados } = admin;
    const token = this.#gerarToken({ id: admin.IdAdmin, email: admin.Email, role });

    // sem await de propósito: o log nunca atrasa nem derruba o login
    LogSistemaService.registrar({ idAdmin: admin.IdAdmin, acao: 'LOGIN', entidade: 'admin', idReferencia: admin.IdAdmin });

    return { usuario: dados, token };
  }

  // ---------- Recuperação de senha (RN05) ----------

  // Resposta SEMPRE genérica: não revela se o e-mail existe.
  async solicitarRecuperacaoSenha(email, tipo) {
    const config = TIPOS_RECUPERACAO[tipo];
    if (!email || !validarEmail(email)) throw new ValidationError('Informe um e-mail válido.');
    if (!config) throw new ValidationError('O campo tipo deve ser "usuario" ou "oficina".');

    const resposta = { message: 'Se o e-mail estiver cadastrado, enviaremos um código de recuperação.' };

    const conta = await config.repo.findByEmailQualquerStatus(email);
    if (!conta || !conta.Ativo) return resposta;

    const idDono = config.idDaConta(conta);

    // anti-spam: no máximo um e-mail por minuto para a mesma conta
    if (await TokenRecuperacaoRepository.criadoRecentemente(tipo, idDono)) return resposta;

    const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const tokenHash = await bcrypt.hash(codigo, 10);

    await TokenRecuperacaoRepository.invalidarAnteriores(tipo, idDono);
    await TokenRecuperacaoRepository.create({
      tipo, idDono, tokenHash, validadeMinutos: VALIDADE_CODIGO_MINUTOS,
    });

    // sem await de propósito: o tempo de resposta não revela se o e-mail existe.
    // Falhas de envio ficam registradas no log do servidor.
    EmailService.enviarCodigoRecuperacao({
      para: conta.Email,
      nome: config.nomeDaConta(conta),
      codigo,
      validadeMinutos: VALIDADE_CODIGO_MINUTOS,
    }).catch((error) => console.error('[Recuperação de senha] Falha ao enviar e-mail:', error.message));

    return resposta;
  }

  async redefinirSenha({ email, tipo, codigo, novaSenha, confirmarNovaSenha }) {
    const config = TIPOS_RECUPERACAO[tipo];

    if (!email || !codigo || !novaSenha || !confirmarNovaSenha) {
      throw new ValidationError('Os campos email, tipo, codigo, novaSenha e confirmarNovaSenha são obrigatórios.');
    }
    if (!config) throw new ValidationError('O campo tipo deve ser "usuario" ou "oficina".');

    // valida a senha ANTES de olhar o código: senha fraca não gasta tentativas
    if (novaSenha !== confirmarNovaSenha) throw new ValidationError('As senhas não coincidem.');
    if (!validarSenha(novaSenha)) throw new ValidationError(SENHA_REQUISITOS_MSG);

    // todas as falhas abaixo usam a MESMA mensagem (não revela se a conta existe)
    const conta = await config.repo.findByEmailQualquerStatus(email);
    if (!conta || !conta.Ativo) throw new ValidationError(MSG_CODIGO_INVALIDO);

    const idDono = config.idDaConta(conta);
    const token = await TokenRecuperacaoRepository.findAtivo(tipo, idDono);
    if (!token || token.Tentativas >= MAX_TENTATIVAS_CODIGO) {
      throw new ValidationError(MSG_CODIGO_INVALIDO);
    }

    const codigoCorreto = await bcrypt.compare(String(codigo), token.Token);
    if (!codigoCorreto) {
      await TokenRecuperacaoRepository.incrementarTentativas(token.IdToken);
      throw new ValidationError(MSG_CODIGO_INVALIDO);
    }

    // uso único: só segue quem conseguiu consumir o token
    const consumido = await TokenRecuperacaoRepository.marcarUsado(token.IdToken);
    if (!consumido) throw new ValidationError(MSG_CODIGO_INVALIDO);

    const senhaHasheada = await bcrypt.hash(novaSenha, 10);
    await config.repo.atualizarSenha(idDono, senhaHasheada);

    return { message: 'Senha redefinida com sucesso. Faça login com a nova senha.' };
  }
}

export default new AuthService();