/*
  Ordena uma lista conforme a coluna escolhida na DataTable.
  Ordene ANTES de paginar:
    const ordenados = ordenarDados(filtrados, colunas, ordenacao);
    const pagina = ordenados.slice(inicio, fim);

  ordenacao: { chave: 'Nome', direcao: 'asc' | 'desc' }
  A coluna pode ter valorOrdenacao(item) quando o valor exibido não é o campo direto.
*/
export const ordenarDados = (dados, colunas, ordenacao) => {
  if (!ordenacao?.chave) return dados;
  const coluna = colunas.find((c) => c.chave === ordenacao.chave);
  if (!coluna) return dados;

  const valorDe = coluna.valorOrdenacao || ((item) => item[coluna.chave]);
  const fator = ordenacao.direcao === 'desc' ? -1 : 1;

  return [...dados].sort((a, b) => {
    const va = valorDe(a);
    const vb = valorDe(b);

    // Vazios sempre no fim
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;

    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * fator;
    return String(va).localeCompare(String(vb), 'pt-BR', { numeric: true, sensitivity: 'base' }) * fator;
  });
};