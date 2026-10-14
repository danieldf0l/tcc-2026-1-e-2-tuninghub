import rateLimit from 'express-rate-limit';

// Limita TENTATIVAS FALHAS em rotas sensíveis da conta (troca de senha / e-mail).
// - Conta por usuário logado (não por IP): protege mesmo que o atacante troque de rede.
// - skipSuccessfulRequests: só respostas com erro (status >= 400) consomem o limite,
//   então o uso normal nunca é bloqueado.
// Use SEMPRE depois de verificarToken (precisa de req.usuarioLogado).
export const contaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `conta-${req.usuarioLogado.id}`,
  message: {
    status: 'error',
    message: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.',
  },
}); 