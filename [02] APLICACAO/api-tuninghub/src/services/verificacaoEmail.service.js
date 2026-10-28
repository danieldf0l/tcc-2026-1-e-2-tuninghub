import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import UsuarioRepository from '../repositories/usuario.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import TokenRecuperacaoRepository from '../repositories/tokenRecuperacao.repository.js';
import EmailService from './email.service.js';
import { ValidationError } from '../errors/AppError.js';
import { validarEmail } from '../utils/validators.js';

// Para que serve cada código (coluna Finalidade). Um código nunca vale para outra finalidade.
export const FINALIDADE = {
  RECUPERACAO_SENHA: 'RECUPERACAO_SENHA',
  VERIFICACAO_EMAIL: 'VERIFICACAO_EMAIL', // confirmar o e-mail no cadastro
  TROCA_EMAIL: 'TROCA_EMAIL', // confirmar o NOVO e-mail ao trocar (fica em NovoEmail)
};

// Contas que usam códigos por e-mail: usuário e oficina (admin fica de fora).
export const TIPOS_CONTA = {
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

export const VALIDADE_CODIGO_MINUTOS = 15;
export const MAX_TENTATIVAS_CODIGO = 5;
export const MSG_CODIGO_INVALIDO = 'Código inválido ou expirado.';

class VerificacaoEmailService {
  // Gera o código de 6 dígitos, invalida os anteriores da mesma finalidade e guarda só o hash.
  // Devolve o código em texto puro (para ir no e-mail; nunca é salvo assim).
  async gerarCodigo({ tipo, idDono, finalidade, novoEmail = null }) {
    const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const tokenHash = await bcrypt.hash(codigo, 10);

    await TokenRecuperacaoRepository.invalidarAnteriores(tipo, idDono, finalidade);
    await TokenRecuperacaoRepository.create({
      tipo, idDono, finalidade, tokenHash, novoEmail, validadeMinutos: VALIDADE_CODIGO_MINUTOS,
    });
    return codigo;
  }

  // Já houve pedido desta finalidade no último minuto? (anti-spam de e-mails)
  async pedidoRecente(tipo, idDono, finalidade) {
    return await TokenRecuperacaoRepository.criadoRecentemente(tipo, idDono, finalidade);
  }

  // Gera o código e envia o e-mail de confirmação.
  // aguardarEnvio = false: não espera o Resend (respostas públicas não podem revelar nada pelo tempo).
  // aguardarEnvio = true: se o envio falhar, o erro (503) sobe para quem chamou.
  async emitirCodigo({ tipo, idDono, finalidade, para, nome, novoEmail = null, aguardarEnvio = false }) {
    const codigo = await this.gerarCodigo({ tipo, idDono, finalidade, novoEmail });

    const envio = EmailService.enviarCodigoVerificacao({
      para,
      nome,
      codigo,
      validadeMinutos: VALIDADE_CODIGO_MINUTOS,
      trocaEmail: finalidade === FINALIDADE.TROCA_EMAIL,
    });

    if (aguardarEnvio) {
      await envio;
      return;
    }
    envio.catch((error) => console.error('[Verificação de e-mail] Falha ao enviar e-mail:', error.message));
  }

  // Código de confirmação do cadastro. NUNCA lança erro: se algo falhar, a pessoa pede outro
  // em /auth/reenviar-codigo ou simplesmente ao tentar entrar. Respeita 1 e-mail por minuto.
  async enviarCodigoCadastro(tipo, conta) {
    const config = TIPOS_CONTA[tipo];
    try {
      const idDono = config.idDaConta(conta);
      const recente = await this.pedidoRecente(tipo, idDono, FINALIDADE.VERIFICACAO_EMAIL);
      if (recente) return;

      await this.emitirCodigo({
        tipo,
        idDono,
        finalidade: FINALIDADE.VERIFICACAO_EMAIL,
        para: conta.Email,
        nome: config.nomeDaConta(conta),
      });
    } catch (error) {
      console.error('[Verificação de e-mail] Falha ao gerar código:', error.message);
    }
  }

  // Resposta SEMPRE genérica: não revela se o e-mail existe nem se já foi confirmado.
  async reenviarCodigoCadastro(email, tipo) {
    const config = TIPOS_CONTA[tipo];
    if (!email || !validarEmail(email)) throw new ValidationError('Informe um e-mail válido.');
    if (!config) throw new ValidationError('O campo tipo deve ser "usuario" ou "oficina".');

    const resposta = { message: 'Se o e-mail estiver aguardando confirmação, enviaremos um novo código.' };

    const conta = await config.repo.findByEmailQualquerStatus(email);
    if (!conta || !conta.Ativo || conta.EmailVerificado) return resposta;

    await this.enviarCodigoCadastro(tipo, conta);
    return resposta;
  }

  // Troca de e-mail em duas etapas: o código vai para o e-mail NOVO e o novo endereço fica
  // guardado em NovoEmail. A conta só passa a usá-lo depois de confirmar o código.
  // Aqui quem chama já está logado, então o erro de envio pode aparecer (503).
  async solicitarTrocaEmail({ tipo, conta, novoEmail }) {
    const config = TIPOS_CONTA[tipo];
    const idDono = config.idDaConta(conta);

    const recente = await this.pedidoRecente(tipo, idDono, FINALIDADE.TROCA_EMAIL);
    if (recente) throw new ValidationError('Aguarde um minuto antes de pedir um novo código.');

    await this.emitirCodigo({
      tipo,
      idDono,
      finalidade: FINALIDADE.TROCA_EMAIL,
      para: novoEmail,
      nome: config.nomeDaConta(conta),
      novoEmail,
      aguardarEnvio: true,
    });
  }

  // Confere o código e o consome (uso único). Toda falha dá a MESMA mensagem.
  // Devolve a linha do código (na troca de e-mail, traz o NovoEmail).
  async consumirCodigo({ tipo, idDono, finalidade, codigo }) {
    const token = await TokenRecuperacaoRepository.findAtivo(tipo, idDono, finalidade);
    if (!token || token.Tentativas >= MAX_TENTATIVAS_CODIGO) {
      throw new ValidationError(MSG_CODIGO_INVALIDO);
    }

    const codigoCorreto = await bcrypt.compare(String(codigo), token.Token);
    if (!codigoCorreto) {
      await TokenRecuperacaoRepository.incrementarTentativas(token.IdToken);
      throw new ValidationError(MSG_CODIGO_INVALIDO);
    }

    // uso único: só segue quem conseguiu consumir o código
    const consumido = await TokenRecuperacaoRepository.marcarUsado(token.IdToken);
    if (!consumido) throw new ValidationError(MSG_CODIGO_INVALIDO);

    return token;
  }
}

export default new VerificacaoEmailService();