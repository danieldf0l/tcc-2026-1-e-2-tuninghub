import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuario.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import AdminRepository from '../repositories/admin.repository.js';
import EmailService from './email.service.js';
import VerificacaoEmailService, {
  FINALIDADE,
  TIPOS_CONTA,
  VALIDADE_CODIGO_MINUTOS,
  MSG_CODIGO_INVALIDO,
} from './verificacaoEmail.service.js';
import { UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from '../errors/AppError.js';
import { EmailNaoVerificadoError } from '../errors/EmailNaoVerificadoError.js';
import { ROLES } from '../constants/roles.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG } from '../utils/validators.js';
import LogSistemaService from './logSistema.service.js';

const ROLE_POR_TIPO = {
  usuario: ROLES.USUARIO,
  oficina: ROLES.OFICINA,
};

class AuthService {
  #gerarToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  // Monta a resposta de login (dados sem a senha + token) para usuário ou oficina
  #montarSessao(tipo, conta) {
    const config = TIPOS_CONTA[tipo];
    const { Senha: _senha, ...dados } = conta;
    const token = this.#gerarToken({ id: config.idDaConta(conta), email: conta.Email, role: ROLE_POR_TIPO[tipo] });
    return { usuario: dados, token };
  }

  // Conta com e-mail ainda não confirmado: reenvia o código (no máx. 1 por minuto) e bloqueia o login.
  // Só é chamado DEPOIS de a senha estar correta, então não revela nada a quem não é o dono.
  #exigirEmailVerificado(tipo, conta) {
    if (conta.EmailVerificado) return;
    // sem await de propósito: nunca lança erro e não atrasa a resposta
    VerificacaoEmailService.enviarCodigoCadastro(tipo, conta);
    throw new EmailNaoVerificadoError();
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

    this.#exigirEmailVerificado('usuario', usuario);

    return this.#montarSessao('usuario', usuario);
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

    this.#exigirEmailVerificado('oficina', oficina);

    return this.#montarSessao('oficina', oficina);
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

  // ---------- Confirmação de e-mail (cadastro) ----------

  // Exige e-mail + SENHA + código: assim ninguém gasta as tentativas do código de outra pessoa.
  // Se tudo certo, confirma o e-mail e já devolve o token (a pessoa entra direto).
  async verificarEmail({ email, tipo, senha, codigo }) {
    const config = TIPOS_CONTA[tipo];

    if (!email || !senha || !codigo) {
      throw new ValidationError('Os campos email, tipo, senha e codigo são obrigatórios.');
    }
    if (!config) throw new ValidationError('O campo tipo deve ser "usuario" ou "oficina".');

    const conta = await config.repo.findByEmailQualquerStatus(email);
    const senhaValida = conta ? await bcrypt.compare(String(senha), conta.Senha) : false;
    if (!conta || !senhaValida) throw new UnauthorizedError('E-mail ou senha inválidos.');

    if (!conta.Ativo) throw new ForbiddenError('Conta desativada. Contate o suporte.');
    if (conta.EmailVerificado) throw new ConflictError('Este e-mail já foi confirmado. Faça login normalmente.');

    const idDono = config.idDaConta(conta);
    await VerificacaoEmailService.consumirCodigo({
      tipo, idDono, finalidade: FINALIDADE.VERIFICACAO_EMAIL, codigo,
    });
    await config.repo.marcarEmailVerificado(idDono);

    return this.#montarSessao(tipo, { ...conta, EmailVerificado: 1 });
  }

  // Resposta SEMPRE genérica (não revela se o e-mail existe nem se já foi confirmado)
  async reenviarCodigoVerificacao(email, tipo) {
    return await VerificacaoEmailService.reenviarCodigoCadastro(email, tipo);
  }

  // ---------- Recuperação de senha (RN05) ----------

  // Resposta SEMPRE genérica: não revela se o e-mail existe.
  async solicitarRecuperacaoSenha(email, tipo) {
    const config = TIPOS_CONTA[tipo];
    if (!email || !validarEmail(email)) throw new ValidationError('Informe um e-mail válido.');
    if (!config) throw new ValidationError('O campo tipo deve ser "usuario" ou "oficina".');

    const resposta = { message: 'Se o e-mail estiver cadastrado, enviaremos um código de recuperação.' };

    const conta = await config.repo.findByEmailQualquerStatus(email);
    if (!conta || !conta.Ativo) return resposta;

    const idDono = config.idDaConta(conta);

    // anti-spam: no máximo um e-mail por minuto para a mesma conta
    if (await VerificacaoEmailService.pedidoRecente(tipo, idDono, FINALIDADE.RECUPERACAO_SENHA)) return resposta;

    const codigo = await VerificacaoEmailService.gerarCodigo({
      tipo, idDono, finalidade: FINALIDADE.RECUPERACAO_SENHA,
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
    const config = TIPOS_CONTA[tipo];

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
    await VerificacaoEmailService.consumirCodigo({
      tipo, idDono, finalidade: FINALIDADE.RECUPERACAO_SENHA, codigo,
    });

    const senhaHasheada = await bcrypt.hash(novaSenha, 10);
    await config.repo.atualizarSenha(idDono, senhaHasheada);
    // quem recebeu o código no e-mail provou que o e-mail é dela: já fica confirmado
    await config.repo.marcarEmailVerificado(idDono);

    return { message: 'Senha redefinida com sucesso. Faça login com a nova senha.' };
  }
}

export default new AuthService();