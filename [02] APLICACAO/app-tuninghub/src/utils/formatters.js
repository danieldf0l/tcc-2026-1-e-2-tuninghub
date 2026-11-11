export function formatarMoeda(valor) {
  const numero = Number(valor);
  if (!numero || numero <= 0) return 'Grátis';
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function somenteDigitos(valor) {
  return (valor || '').replace(/\D/g, '');
}

// 12.345.678/0001-95
export function mascaraCnpj(valor) {
  return somenteDigitos(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// (11) 1234-5678  ou  (11) 91234-5678
export function mascaraTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// 04578-000
export function mascaraCep(valor) {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

// 0.45 → "450 m" · 2.3 → "2,3 km"
export function formatarDistancia(km) {
  if (km === null || km === undefined || km === '') return null;
  const n = Number(km);
  if (Number.isNaN(n)) return `${km} km`;
  if (n < 1) return `${Math.round(n * 1000)} m`;
  return `${n.toFixed(1).replace('.', ',')} km`;
}