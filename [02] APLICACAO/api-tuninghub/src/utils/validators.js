export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mínimo 8 caracteres, ao menos 1 maiúscula, 1 número e 1 caractere especial
export const SENHA_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=]).{8,}$/;

export const SENHA_REQUISITOS_MSG =
  'A senha deve ter no mínimo 8 caracteres, incluindo ao menos 1 letra maiúscula, 1 número e 1 caractere especial.';

export const validarEmail = (email) => EMAIL_REGEX.test(email);
export const validarSenha = (senha) => SENHA_REGEX.test(senha);