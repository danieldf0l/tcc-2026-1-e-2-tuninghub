import api from './client';

export async function cadastrarUsuario({ nome, email, senha, confirmarSenha, termosAceitos }) {
  const { data } = await api.post('/usuario', { nome, email, senha, confirmarSenha, termosAceitos });
  return data;
}

export async function aceitarTermos() {
  const { data } = await api.patch('/usuario/aceitar-termos');
  return data;
}