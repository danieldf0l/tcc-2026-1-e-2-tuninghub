import bcrypt from 'bcrypt';
import AdminRepository from '../repositories/admin.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
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

  // Edição feita por ADMIN_MASTER. idLogado = quem está editando.
  async atualizarAdmin(idAdmin, dados, idLogado) {
    const { nome, email, nivelAcesso } = dados;

    if (nome === undefined && email === undefined && nivelAcesso === undefined) {
      throw new ValidationError('Informe ao menos um campo para atualizar (nome, email ou nivelAcesso).');
    }

    const atual = await AdminRepository.findByIdAdmin(idAdmin);
    if (!atual) throw new NotFoundError('Administrador não encontrado.');

    const novoNome = nome !== undefined ? String(nome).trim() : atual.Nome;
    const novoEmail = email !== undefined ? String(email).trim() : atual.Email;
    const novoNivel = nivelAcesso !== undefined ? nivelAcesso : atual.NivelAcesso;

    if (!novoNome) throw new ValidationError('O nome não pode ficar vazio.');
    if (!validarEmail(novoEmail)) throw new ValidationError('E-mail inválido.');
    if (!NIVEIS_VALIDOS.includes(novoNivel)) {
      throw new ValidationError(`NivelAcesso inválido. Use um dos valores: ${NIVEIS_VALIDOS.join(', ')}.`);
    }

    // impede o sistema ficar sem nenhum ADMIN_MASTER por rebaixamento acidental
    if (Number(idAdmin) === Number(idLogado) && novoNivel !== atual.NivelAcesso) {
      throw new ValidationError('Você não pode alterar o seu próprio nível de acesso.');
    }

    if (novoEmail !== atual.Email) {
      const emUso = await AdminRepository.existsByEmailExcetoId(novoEmail, idAdmin);
      if (emUso) throw new ConflictError('Este e-mail já está vinculado a uma conta administrativa.');
    }

    await AdminRepository.atualizar(idAdmin, { nome: novoNome, email: novoEmail, nivelAcesso: novoNivel });

    const { Senha: _senha, ...atualizado } = await AdminRepository.findByIdAdmin(idAdmin);
    return atualizado;
  }

  async atualizarStatus(idAdmin, ativo, idLogado) {
    if (typeof ativo !== 'boolean') throw new ValidationError('O campo ativo deve ser true ou false.');

    const admin = await AdminRepository.findByIdAdmin(idAdmin);
    if (!admin) throw new NotFoundError('Administrador não encontrado.');

    if (!ativo && Number(idAdmin) === Number(idLogado)) {
      throw new ValidationError('Você não pode desativar a sua própria conta.');
    }

    await AdminRepository.atualizarStatus(idAdmin, ativo);
    return { idAdmin: Number(idAdmin), ativo };
  }
}

export default new AdminService();