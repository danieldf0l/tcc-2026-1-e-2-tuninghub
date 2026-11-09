// Validações de formato no front — o backend continua validando tudo

// Espelha a regra de senha do backend
export const REGRAS_SENHA = [
  { rotulo: '8 caracteres', testa: (s) => s.length >= 8 },
  { rotulo: 'letra maiúscula', testa: (s) => /[A-Z]/.test(s) },
  { rotulo: 'número', testa: (s) => /\d/.test(s) },
  { rotulo: 'símbolo', testa: (s) => /[^A-Za-z0-9]/.test(s) },
];

export function senhaValida(senha = '') {
  return REGRAS_SENHA.every((r) => r.testa(senha));
}

export function emailValido(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Dígitos verificadores do CNPJ (formato numérico)
export function cnpjValido(valor = '') {
  const cnpj = valor.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcularDigito = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split('').reduce((acc, n, i) => acc + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(cnpj.slice(0, 12));
  const d2 = calcularDigito(cnpj.slice(0, 12) + d1);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}