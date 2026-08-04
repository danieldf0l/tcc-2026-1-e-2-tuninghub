import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token não fornecido.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.usuarioLogado = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expirado.' : 'Token inválido.';
    return next(new UnauthorizedError(message));
  }
};

// Uso: router.delete('/:id', verificarToken, checkRole('ADMIN_MASTER'), controller.remover)
export const checkRole = (...papeisPermitidos) => (req, res, next) => {
  const { role } = req.usuarioLogado || {};
  if (!role || !papeisPermitidos.includes(role)) {
    return next(new ForbiddenError('Você não tem permissão para acessar este recurso.'));
  }
  return next();
};