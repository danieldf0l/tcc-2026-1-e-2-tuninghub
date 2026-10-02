export async function buscarEnderecoPorCep(cep) {
  const cepLimpo = (cep || '').replace(/\D/g, '');
  if (cepLimpo.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await resposta.json();
    if (dados.erro) return null;

    return {
      rua: dados.logradouro || '',
      bairro: dados.bairro || '',
      cidade: dados.localidade || '',
      estado: dados.uf || '',
    };
  } catch {
    return null;
  }
}