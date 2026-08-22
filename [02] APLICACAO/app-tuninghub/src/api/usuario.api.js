import api from './client';

export async function cadastrarUsuario({ nome, email, senha, confirmarSenha }) {
  const { data } = await api.post('/usuario', { nome, email, senha, confirmarSenha });
  return data;
}