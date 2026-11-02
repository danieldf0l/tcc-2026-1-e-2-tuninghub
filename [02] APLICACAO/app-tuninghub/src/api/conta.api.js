import api from './client';

// 'usuario' -> /usuario/me | 'oficina' -> /oficina/me
const base = (tipo) => (tipo === 'oficina' ? '/oficina' : '/usuario');

// Devolve { perfil, emailPendente }. Se emailPendente vier preenchido, o e-mail
// ainda NÃO mudou: falta confirmar o código enviado ao e-mail novo.
export async function atualizarMeusDados(tipo, campos) {
  const { data } = await api.put(`${base(tipo)}/me`, campos);
  return { perfil: data.usuario || data.oficina, emailPendente: data.emailPendente || null };
}

export async function confirmarTrocaEmail(tipo, codigo) {
  const { data } = await api.post(`${base(tipo)}/me/confirmar-email`, { codigo });
  return data.usuario || data.oficina; // perfil atualizado
}

export async function alterarSenha(tipo, { senhaAtual, novaSenha, confirmarNovaSenha }) {
  const { data } = await api.patch(`${base(tipo)}/me/senha`, { senhaAtual, novaSenha, confirmarNovaSenha });
  return data; // { message }
}

// DELETE com corpo: no axios o body vai em { data }
export async function excluirMinhaConta(tipo, senha) {
  const { data } = await api.delete(`${base(tipo)}/me`, { data: { senha, confirmacao: 'EXCLUIR' } });
  return data; // { message }
}