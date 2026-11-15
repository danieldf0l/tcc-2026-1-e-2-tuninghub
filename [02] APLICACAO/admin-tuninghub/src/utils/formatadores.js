// Formatação de documentos, telefone, CEP e datas (só para exibição)

export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export const formatarCnpj = (cnpj) => {
  const d = somenteDigitos(cnpj);
  if (d.length !== 14) return cnpj || '—';
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatarTelefone = (telefone) => {
  const d = somenteDigitos(telefone);
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return telefone || '—';
};

// Máscara enquanto digita: 01234567 -> 01234-567
export const mascaraCep = (valor) => {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

export const formatarData = (data) => (data ? new Date(data).toLocaleDateString('pt-BR') : '—');