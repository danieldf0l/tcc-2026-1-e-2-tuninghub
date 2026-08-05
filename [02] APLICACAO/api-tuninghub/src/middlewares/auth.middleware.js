import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';

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

export const checkRole = (...papeisPermitidos) => (req, res, next) => {
  const { role } = req.usuarioLogado || {};
  if (!role || !papeisPermitidos.includes(role)) {
    return next(new ForbiddenError('Você não tem permissão para acessar este recurso.'));
  }
  return next();
};

export const verificarPropriedadeOuAdmin = (paramName) => (req, res, next) => {
  const { id, role } = req.usuarioLogado || {};
  const idDoRecurso = req.params[paramName];

  const ehAdmin = role === ROLES.ADMIN_MASTER || role === ROLES.ADMIN;
  const ehDono = String(id) === String(idDoRecurso);

  if (!ehAdmin && !ehDono) {
    return next(new ForbiddenError('Você não tem permissão para alterar este recurso.'));
  }
  return next();
};