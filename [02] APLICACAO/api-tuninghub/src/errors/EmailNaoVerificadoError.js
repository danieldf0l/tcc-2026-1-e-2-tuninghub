import { ForbiddenError } from './AppError.js';

// 403 com um "code" que o app usa para abrir a tela "Confirmar e-mail"
export class EmailNaoVerificadoError extends ForbiddenError {
  constructor() {
    super('Confirme seu e-mail para entrar. Enviamos um código para a sua caixa de entrada.');
    this.code = 'EMAIL_NAO_VERIFICADO';
  }
}