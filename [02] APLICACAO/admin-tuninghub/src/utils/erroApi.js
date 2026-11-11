// Extrai a mensagem de erro que o backend manda (error.response.data.message).
// Uso: toast.erro(mensagemErro(error, 'Erro ao salvar modelo.'))
export const mensagemErro = (error, padrao = 'Algo deu errado. Tente de novo.') => {
  const msgApi = error?.response?.data?.message;
  if (msgApi) return msgApi;

  // Requisição saiu mas não houve resposta: API fora do ar ou sem internet
  if (error?.request && !error?.response) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';
  }

  return padrao;
};