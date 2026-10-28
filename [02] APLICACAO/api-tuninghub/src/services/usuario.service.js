import bcrypt from 'bcrypt';
import UsuarioRepository from '../repositories/usuario.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG } from '../utils/validators.js';
import VerificacaoEmailService, { FINALIDADE } from './verificacaoEmail.service.js';

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

    // A conta nasce com e-mail NÃO confirmado: enviamos o código (sem await; nunca lança erro).
    // Se o e-mail não chegar, a pessoa pede outro em /api/auth/reenviar-codigo ou ao tentar entrar.
    VerificacaoEmailService.enviarCodigoCadastro('usuario', { IdUsuario: novoId, Nome: nome, Email: email });

    return { id: novoId, nome, email, emailVerificado: false };
  }

  async aceitarTermos(idUsuario) {
    const linhasAfetadas = await UsuarioRepository.aceitarTermos(idUsuario);
    if (linhasAfetadas === 0) throw new NotFoundError('Usuário não encontrado.');
    return { message: 'Termos aceitos com sucesso.' };
  }

  async listarUsuariosAdmin() {
    return await UsuarioRepository.findAllAdmin();
  }

  async atualizarStatus(idUsuario, ativo) {
    if (typeof ativo !== 'boolean') throw new ValidationError('O campo ativo deve ser true ou false.');

    const usuario = await UsuarioRepository.findByIdAdmin(idUsuario);
    if (!usuario) throw new NotFoundError('Usuário não encontrado.');

    await UsuarioRepository.atualizarStatus(idUsuario, ativo);
    return { idUsuario: Number(idUsuario), ativo };
  }

  // ---------- Meus Dados ----------

  async buscarMeusDados(idUsuario) {
    const perfil = await UsuarioRepository.findPerfil(idUsuario);
    if (!perfil) throw new NotFoundError('Usuário não encontrado.');
    return perfil;
  }

  // Nome é salvo na hora. E-mail novo NÃO é trocado direto: o código vai para o endereço novo e a
  // troca só vale em POST /me/confirmar-email. Até lá, a conta continua com o e-mail antigo.
  // Devolve { perfil, emailPendente } (emailPendente = e-mail aguardando confirmação, ou null).
  async atualizarMeusDados(idUsuario, dados) {
    if (dados.nome === undefined && dados.email === undefined) {
      throw new ValidationError('Informe ao menos um campo para atualizar (nome ou email).');
    }

    const perfilAtual = await this.buscarMeusDados(idUsuario);

    const nome = dados.nome !== undefined ? String(dados.nome).trim() : perfilAtual.Nome;
    const email = dados.email !== undefined ? String(dados.email).trim() : perfilAtual.Email;

    if (!nome) throw new ValidationError('O nome não pode ficar vazio.');
    if (!validarEmail(email)) throw new ValidationError('E-mail inválido.');

    let emailPendente = null;

    if (email !== perfilAtual.Email) {
      // Trocar e-mail exige confirmar a senha atual (evita sequestro de conta com token roubado)
      if (!dados.senhaAtual) {
        throw new ValidationError('Para alterar o e-mail, informe a senhaAtual.');
      }
      const usuario = await UsuarioRepository.findByIdAdmin(idUsuario);
      const senhaCorreta = await bcrypt.compare(dados.senhaAtual, usuario.Senha);
      if (!senhaCorreta) throw new ValidationError('Senha atual incorreta.');

      const emUso = await UsuarioRepository.existsByEmailExcetoId(email, idUsuario);
      if (emUso) throw new ConflictError('Este e-mail já está em uso.');

      // envia o código ANTES de salvar o nome: se o e-mail falhar (503), nada é alterado
      await VerificacaoEmailService.solicitarTrocaEmail({
        tipo: 'usuario',
        conta: { IdUsuario: idUsuario, Nome: nome },
        novoEmail: email,
      });
      emailPendente = email;
    }

    // o e-mail continua o ATUAL até a confirmação
    await UsuarioRepository.atualizarPerfil(idUsuario, nome, perfilAtual.Email);
    return { perfil: await this.buscarMeusDados(idUsuario), emailPendente };
  }

  // Segunda etapa da troca de e-mail: confere o código enviado ao e-mail NOVO e efetiva a troca.
  async confirmarTrocaEmail(idUsuario, dados) {
    const { codigo } = dados;
    if (!codigo) throw new ValidationError('Informe o código recebido no novo e-mail.');

    const token = await VerificacaoEmailService.consumirCodigo({
      tipo: 'usuario', idDono: idUsuario, finalidade: FINALIDADE.TROCA_EMAIL, codigo,
    });
    const novoEmail = token.NovoEmail;

    // alguém pode ter ocupado o e-mail nesse meio tempo
    if (await UsuarioRepository.existsByEmailExcetoId(novoEmail, idUsuario)) {
      throw new ConflictError('Este e-mail já está em uso.');
    }

    try {
      await UsuarioRepository.trocarEmail(idUsuario, novoEmail);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ConflictError('Este e-mail já está em uso.');
      throw error;
    }
    return await this.buscarMeusDados(idUsuario);
  }

  // Exclusão física da própria conta (LGPD). Irreversível — diferente do soft delete (Ativo).
  async excluirMinhaConta(idUsuario, dados) {
    const { senha, confirmacao } = dados;

    if (!senha || confirmacao !== 'EXCLUIR') {
      throw new ValidationError('Informe a senha e confirmacao: "EXCLUIR" para excluir a conta definitivamente.');
    }

    const usuario = await UsuarioRepository.findByIdAdmin(idUsuario);
    if (!usuario) throw new NotFoundError('Usuário não encontrado.');

    const senhaCorreta = await bcrypt.compare(senha, usuario.Senha);
    if (!senhaCorreta) throw new ValidationError('Senha incorreta.');

    await UsuarioRepository.excluirDefinitivamente(idUsuario);
    return { message: 'Conta excluída definitivamente. Todos os seus dados foram removidos.' };
  }

  async alterarSenha(idUsuario, dados) {
    const { senhaAtual, novaSenha, confirmarNovaSenha } = dados;

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      throw new ValidationError('Os campos senhaAtual, novaSenha e confirmarNovaSenha são obrigatórios.');
    }

    const usuario = await UsuarioRepository.findByIdAdmin(idUsuario);
    if (!usuario) throw new NotFoundError('Usuário não encontrado.');

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.Senha);
    if (!senhaCorreta) throw new ValidationError('Senha atual incorreta.');

    if (novaSenha !== confirmarNovaSenha) throw new ValidationError('As senhas não coincidem.');
    if (!validarSenha(novaSenha)) throw new ValidationError(SENHA_REQUISITOS_MSG);

    const igualAAtual = await bcrypt.compare(novaSenha, usuario.Senha);
    if (igualAAtual) throw new ValidationError('A nova senha deve ser diferente da senha atual.');

    const senhaHasheada = await bcrypt.hash(novaSenha, 10);
    await UsuarioRepository.atualizarSenha(idUsuario, senhaHasheada);

    return { message: 'Senha alterada com sucesso. Faça login novamente.' };
  }
}

export default new UsuarioService();