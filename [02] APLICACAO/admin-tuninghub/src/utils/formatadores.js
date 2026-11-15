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

// "Ana Paula Souza" -> "AS"
export const iniciais = (nome) => {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
};

// Dias inteiros entre hoje e a data (negativo = já passou)
export const diasAte = (data) => {
  const alvo = new Date(data);
  const hoje = new Date();
  alvo.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / 86400000);
};


// 15/11/2026 18:32
export const formatarDataHora = (data) =>
  data
    ? new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

// "agora", "há 5 min", "há 3 h", "ontem", "há 4 dias"
export const tempoRelativo = (data) => {
  const minutos = Math.floor((Date.now() - new Date(data).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = -diasAte(data);
  if (dias <= 1) return 'ontem';
  return `há ${dias} dias`;
};

// Data local no formato da API (AAAA-MM-DD), sem passar por UTC
export const dataIso = (data = new Date()) => {
  const d = new Date(data);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};