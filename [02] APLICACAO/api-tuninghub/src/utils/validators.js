export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mínimo 8 caracteres, ao menos 1 maiúscula, 1 número e 1 caractere especial
export const SENHA_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=]).{8,}$/;

export const SENHA_REQUISITOS_MSG =
  'A senha deve ter no mínimo 8 caracteres, incluindo ao menos 1 letra maiúscula, 1 número e 1 caractere especial.';

export const validarEmail = (email) => EMAIL_REGEX.test(email);
export const validarSenha = (senha) => SENHA_REGEX.test(senha);

export const sanitizarCnpj = (cnpj = '') => cnpj.replace(/\D/g, '');

export const validarCnpjFormato = (cnpjBruto) => {
  const cnpj = sanitizarCnpj(cnpjBruto);

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false; // todos os dígitos iguais

  const calcularDigitoVerificador = (base) => {
    let soma = 0;
    let peso = base.length - 7;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * peso;
      peso -= 1;
      if (peso < 2) peso = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeirosDigitos = cnpj.slice(0, 12);
  const dv1 = calcularDigitoVerificador(primeirosDigitos);
  const dv2 = calcularDigitoVerificador(primeirosDigitos + dv1);

  return cnpj === primeirosDigitos + String(dv1) + String(dv2);
};