// Tradução das ações e entidades do log (logsistema) para português

// Ações que não seguem o padrão VERBO_ENTIDADE
const ACOES_ESPECIAIS = {
  LOGIN: { verbo: 'Entrou', objeto: 'no painel', tom: 'neutro' },
  ALTEROU_FAIXA_PRECO_OFICINA: { verbo: 'Alterou', objeto: 'a faixa de preço de uma oficina', tom: 'neutro' },
  EDITOU_ENDERECO_OFICINA: { verbo: 'Editou', objeto: 'o endereço de uma oficina', tom: 'neutro' },
  VINCULOU_PRODUTO_EXTERNO_PLANO: { verbo: 'Vinculou', objeto: 'o produto de pagamento de um plano', tom: 'neutro' },
  VINCULOU_SERVICO_ESTILO: { verbo: 'Adicionou', objeto: 'um serviço ao kit de um estilo', tom: 'sucesso' },
  DESVINCULOU_SERVICO_ESTILO: { verbo: 'Removeu', objeto: 'um serviço do kit de um estilo', tom: 'perigo' },
  VINCULOU_SERVICO_OFICINA: { verbo: 'Adicionou', objeto: 'um serviço a uma oficina', tom: 'sucesso' },
  DESVINCULOU_SERVICO_OFICINA: { verbo: 'Removeu', objeto: 'um serviço de uma oficina', tom: 'perigo' },
  ADICIONOU_IMAGEM: { verbo: 'Adicionou', objeto: 'uma imagem', tom: 'sucesso' },
  REMOVEU_IMAGEM: { verbo: 'Removeu', objeto: 'uma imagem', tom: 'perigo' },
};

const VERBOS = {
  CRIOU: { verbo: 'Criou', tom: 'sucesso' },
  EDITOU: { verbo: 'Editou', tom: 'neutro' },
  DESATIVOU: { verbo: 'Desativou', tom: 'perigo' },
  REATIVOU: { verbo: 'Reativou', tom: 'sucesso' },
};

// Final da ação (CRIOU_<isto>) -> "um plano", "uma oficina"...
const OBJETOS = {
  ADMIN: 'um administrador',
  MONTADORA: 'uma montadora',
  MODELO: 'um modelo',
  SERVICO: 'um serviço',
  CATEGORIA_SERVICO: 'uma categoria de serviço',
  CATEGORIASERVICO: 'uma categoria de serviço',
  ESTILO: 'um estilo',
  PLANO: 'um plano',
  USUARIO: 'um usuário',
  OFICINA: 'uma oficina',
  PROJETO: 'um projeto',
};

const humanizar = (texto) => {
  const t = String(texto || '').toLowerCase().replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const descreverAcao = (acao) => {
  if (ACOES_ESPECIAIS[acao]) return ACOES_ESPECIAIS[acao];
  const [prefixo, ...resto] = String(acao || '').split('_');
  const verbo = VERBOS[prefixo];
  const alvo = resto.join('_');
  if (verbo) return { ...verbo, objeto: OBJETOS[alvo] || humanizar(alvo).toLowerCase() };
  return { verbo: humanizar(acao), objeto: '', tom: 'neutro' };
};

// Valor do campo Entidade -> rótulo (o filtro manda o valor original para a API)
export const ENTIDADES = [
  { valor: 'admin', rotulo: 'Administradores' },
  { valor: 'montadora', rotulo: 'Montadoras' },
  { valor: 'modelo', rotulo: 'Modelos' },
  { valor: 'servico', rotulo: 'Serviços' },
  { valor: 'categoriaservico', rotulo: 'Categorias de serviço' },
  { valor: 'estilo', rotulo: 'Estilos' },
  { valor: 'estiloservicosugerido', rotulo: 'Kits de estilo' },
  { valor: 'plano', rotulo: 'Planos' },
  { valor: 'oficina', rotulo: 'Oficinas' },
  { valor: 'usuario', rotulo: 'Usuários' },
  { valor: 'projeto', rotulo: 'Projetos' },
];

const ROTULO_REFERENCIA = {
  admin: 'Admin',
  montadora: 'Montadora',
  modelo: 'Modelo',
  servico: 'Serviço',
  categoriaservico: 'Categoria',
  estilo: 'Estilo',
  estiloservicosugerido: 'Serviço',
  plano: 'Plano',
  oficina: 'Oficina',
  usuario: 'Usuário',
  projeto: 'Projeto',
};

export const rotuloReferencia = (log) =>
  log.IdReferencia == null ? null : `${ROTULO_REFERENCIA[log.Entidade] || humanizar(log.Entidade)} #${log.IdReferencia}`;