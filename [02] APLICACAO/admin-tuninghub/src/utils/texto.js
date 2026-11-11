// Busca sem diferenciar maiúsculas e acentos: "suspensao" encontra "Suspensão"
export const normalizar = (texto = '') =>
  String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// termo já deve vir normalizado (o useListaCatalogo entrega assim)
export const contem = (texto, termo) => !termo || normalizar(texto).includes(termo);