export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // erro "esperado", pode mostrar a mensagem pro cliente
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') { super(message, 404); }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado.') { super(message, 401); }
}
export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado.') { super(message, 403); }
}
export class ValidationError extends AppError {
  constructor(message = 'Dados inválidos.') { super(message, 422); }
}
export class ConflictError extends AppError {
  constructor(message = 'Registro já existe.') { super(message, 409); }
}