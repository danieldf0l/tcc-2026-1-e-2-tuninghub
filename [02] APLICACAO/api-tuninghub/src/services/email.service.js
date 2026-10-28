import { ServiceUnavailableError } from '../errors/AppError.js';

const RESEND_URL = 'https://api.resend.com/emails';

const escaparHtml = (texto) =>
  String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

class EmailService {
  // Envio genérico via Resend (sem biblioteca extra, só fetch — mesmo padrão do AbacatePay).
  async enviar({ para, assunto, html, texto }) {
    // lê o .env na hora do envio (evita depender da ordem de carregamento do dotenv)
    const apiKey = process.env.RESEND_API_KEY;
    const remetente = process.env.EMAIL_REMETENTE;

    if (!apiKey || !remetente) {
      console.error('[Email] RESEND_API_KEY ou EMAIL_REMETENTE não configurados no .env.');
      throw new ServiceUnavailableError('Serviço de e-mail indisponível no momento.');
    }

    const resposta = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: remetente, to: [para], subject: assunto, html, text: texto }),
    });

    if (!resposta.ok) {
      const corpo = await resposta.text().catch(() => '');
      console.error(`[Email] Falha no Resend (status ${resposta.status}): ${corpo}`);
      throw new ServiceUnavailableError('Não foi possível enviar o e-mail no momento.');
    }
  }

  async enviarCodigoRecuperacao({ para, nome, codigo, validadeMinutos }) {
    const nomeSeguro = escaparHtml(nome);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
        <h2 style="margin-bottom: 8px;">Recuperação de senha</h2>
        <p>Olá, ${nomeSeguro}!</p>
        <p>Use o código abaixo no app do TuningHub para criar uma nova senha:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${codigo}</p>
        <p>Este código vale por <strong>${validadeMinutos} minutos</strong> e só pode ser usado uma vez.</p>
        <p style="color: #666; font-size: 13px;">
          Se você não pediu a recuperação de senha, ignore este e-mail. Sua senha continua a mesma.
        </p>
      </div>
    `;

    const texto =
      `Olá, ${nome}!\n\n` +
      `Seu código de recuperação de senha do TuningHub é: ${codigo}\n` +
      `Ele vale por ${validadeMinutos} minutos e só pode ser usado uma vez.\n\n` +
      'Se você não pediu a recuperação, ignore este e-mail.';

    await this.enviar({
      para,
      assunto: `${codigo} é o seu código de recuperação — TuningHub`,
      html,
      texto,
    });
  }

  // Código de confirmação: cadastro (confirmar o e-mail da conta) ou troca de e-mail (trocaEmail = true)
  async enviarCodigoVerificacao({ para, nome, codigo, validadeMinutos, trocaEmail = false }) {
    const nomeSeguro = escaparHtml(nome);

    const titulo = trocaEmail ? 'Confirme seu novo e-mail' : 'Confirme seu e-mail';
    const intro = trocaEmail
      ? 'Recebemos um pedido para trocar o e-mail da sua conta do TuningHub para este endereço. Use o código abaixo no app para confirmar:'
      : 'Use o código abaixo no app do TuningHub para confirmar o seu e-mail e ativar a sua conta:';
    const rodape = trocaEmail
      ? 'Se não foi você, ignore este e-mail. O e-mail da sua conta não será alterado.'
      : 'Se você não criou uma conta no TuningHub, ignore este e-mail.';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
        <h2 style="margin-bottom: 8px;">${titulo}</h2>
        <p>Olá, ${nomeSeguro}!</p>
        <p>${intro}</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${codigo}</p>
        <p>Este código vale por <strong>${validadeMinutos} minutos</strong> e só pode ser usado uma vez.</p>
        <p style="color: #666; font-size: 13px;">${rodape}</p>
      </div>
    `;

    const texto =
      `Olá, ${nome}!\n\n` +
      `${intro}\n\n` +
      `Código: ${codigo}\n` +
      `Ele vale por ${validadeMinutos} minutos e só pode ser usado uma vez.\n\n` +
      rodape;

    await this.enviar({
      para,
      assunto: `${codigo} é o seu código de confirmação — TuningHub`,
      html,
      texto,
    });
  }
}

export default new EmailService();