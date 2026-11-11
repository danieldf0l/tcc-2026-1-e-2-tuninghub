import './Badge.css';

/*
  <Badge tom="sucesso">Pro</Badge>
  <StatusBadge status={m.Ativo ? 'ativo' : 'inativo'} />
  <StatusBadge status={assinatura.Status} />        // 'ATIVA', 'PENDENTE', 'EXPIRADA'...

  tom: 'neutro' | 'sucesso' | 'aviso' | 'perigo' | 'primario'
  Um mapa só de status, para todas as telas mostrarem o mesmo badge.
*/

const STATUS = {
  ativo: { tom: 'sucesso', rotulo: 'Ativo' },
  ativa: { tom: 'sucesso', rotulo: 'Ativa' },
  inativo: { tom: 'neutro', rotulo: 'Inativo' },
  inativa: { tom: 'neutro', rotulo: 'Inativa' },
  pendente: { tom: 'aviso', rotulo: 'Pendente' },
  expirada: { tom: 'neutro', rotulo: 'Expirada' },
  cancelada: { tom: 'perigo', rotulo: 'Cancelada' },
  vinculado: { tom: 'sucesso', rotulo: 'Vinculado' },
  nao_vinculado: { tom: 'aviso', rotulo: 'Não vinculado' },
};

export const Badge = ({ tom = 'neutro', ponto = false, children }) => (
  <span className={`badge badge--${tom}`}>
    {ponto && <span className="badge__ponto" aria-hidden="true" />}
    {children}
  </span>
);

export const StatusBadge = ({ status, rotulo }) => {
  const config = STATUS[String(status).toLowerCase()] || { tom: 'neutro', rotulo: status };
  return (
    <Badge tom={config.tom} ponto>
      {rotulo || config.rotulo}
    </Badge>
  );
};

export default Badge;