import api from './client';

export async function login(tipo, email, senha) {
  const { data } = await api.post(`/auth/login/${tipo}`, { email, senha });
  return data.data; // { usuario, token }
}

export async function verificarEmail({ email, tipo, senha, codigo }) {
  const { data } = await api.post('/auth/verificar-email', { email, tipo, senha, codigo });
  return data.data; // { usuario, token } (a pessoa já entra)
}

export async function reenviarCodigo(email, tipo) {
  const { data } = await api.post('/auth/reenviar-codigo', { email, tipo });
  return data; // { message }
}

export async function esqueciSenha(email, tipo) {
  const { data } = await api.post('/auth/esqueci-senha', { email, tipo });
  return data; // { message } (sempre genérica)
}

export async function redefinirSenha({ email, tipo, codigo, novaSenha, confirmarNovaSenha }) {
  const { data } = await api.post('/auth/redefinir-senha', {
    email, tipo, codigo, novaSenha, confirmarNovaSenha,
  });
  return data; // { message }
}