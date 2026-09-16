import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';
import UsuarioRepository from '../repositories/usuario.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import AdminRepository from '../repositories/admin.repository.js';

const REPOSITORIO_POR_ROLE = {
  [ROLES.USUARIO]: UsuarioRepository,
  [ROLES.OFICINA]: OficinaRepository,
  [ROLES.ADMIN]: AdminRepository,
  [ROLES.ADMIN_MASTER]: AdminRepository,
};

export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token não fornecido.'));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expirado.' : 'Token inválido.';
    return next(new UnauthorizedError(message));
  }

  try {
    const repository = REPOSITORIO_POR_ROLE[decoded.role];
    if (repository) {
      const conta = await repository.findByIdAdmin(decoded.id);
      if (!conta || !conta.Ativo) {
        return next(new ForbiddenError('Conta desativada. Contate o suporte.'));
      }
    }

    req.usuarioLogado = decoded;
    return next();
  } catch (error) {
    return next(error);
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