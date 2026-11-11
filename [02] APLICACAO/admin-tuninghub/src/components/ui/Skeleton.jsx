import './Skeleton.css';

/*
  <Skeleton largura="60%" altura={14} />           bloco simples
  <SkeletonTabela linhas={8} colunas={4} />        no lugar de uma tabela carregando
  <SkeletonCards quantidade={4} />                 no lugar dos cards de KPI
*/

// Larguras variadas para não parecer uma grade "perfeita"
const LARGURAS = ['70%', '45%', '85%', '55%', '35%'];

export const Skeleton = ({ largura = '100%', altura = 14, raio, className = '' }) => (
  <span
    className={`skeleton ${className}`}
    style={{ width: largura, height: altura, borderRadius: raio }}
    aria-hidden="true"
  />
);

export const SkeletonTabela = ({ linhas = 8, colunas = 4 }) => (
  <div className="skeleton-tabela" role="status" aria-label="Carregando dados">
    <div className="skeleton-tabela__linha skeleton-tabela__cabecalho" style={{ '--colunas': colunas }}>
      {Array.from({ length: colunas }, (_, c) => (
        <Skeleton key={c} largura="40%" altura={10} />
      ))}
    </div>
    {Array.from({ length: linhas }, (_, l) => (
      <div key={l} className="skeleton-tabela__linha" style={{ '--colunas': colunas }}>
        {Array.from({ length: colunas }, (_, c) => (
          <Skeleton key={c} largura={LARGURAS[(l + c) % LARGURAS.length]} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCards = ({ quantidade = 4 }) => (
  <div className="skeleton-cards" role="status" aria-label="Carregando indicadores">
    {Array.from({ length: quantidade }, (_, i) => (
      <div key={i} className="skeleton-card">
        <Skeleton largura={36} altura={36} raio="var(--radius-md)" />
        <Skeleton largura="50%" altura={26} />
        <Skeleton largura="70%" altura={12} />
      </div>
    ))}
  </div>
);

export default Skeleton;