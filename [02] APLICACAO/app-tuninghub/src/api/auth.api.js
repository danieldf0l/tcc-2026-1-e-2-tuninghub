import api from './client';

export async function login(tipo, email, senha) {
  const { data } = await api.post(`/auth/login/${tipo}`, { email, senha });
  return data; // { usuario, token }
}