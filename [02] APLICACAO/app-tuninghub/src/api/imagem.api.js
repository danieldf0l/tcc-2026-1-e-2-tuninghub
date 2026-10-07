import api from './client';

export async function listarImagensDaOficina(idOficina) {
  const { data } = await api.get(`/imagem/oficina/${idOficina}`);
  return data;
}

export async function enviarImagem({ uri, type, name }, tipoImagem) {
  const form = new FormData();
  form.append('tipoImagem', tipoImagem);
  form.append('imagem', { uri, type, name });

  const { data } = await api.post('/imagem', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // upload de até 5MB pode passar dos 10s padrão
  });
  return data.imagem; // { message, imagem }
}

export async function removerImagem(idImagem) {
  const { data } = await api.delete(`/imagem/${idImagem}`);
  return data;
}