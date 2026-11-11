import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './KpiCard.css';

/*
  Cartão de indicador (KPI) com ícone e cor.

  <KpiCard
    icone={Store}
    rotulo="Oficinas ativas"
    valor={42}
    detalhe="de 50 cadastradas"
    tom="primario"            // 'primario' | 'sucesso' | 'aviso' | 'neutro'
    para="/oficinas"          // opcional: o cartão vira link para a tela
  />
*/
const KpiCard = ({ icone: Icone, rotulo, valor, detalhe, tom = 'neutro', para }) => {
  const conteudo = (
    <>
      <div className="kpi__topo">
        <span className="kpi__icone" aria-hidden="true">
          <Icone size={18} />
        </span>
        {para && <ArrowUpRight className="kpi__seta" size={16} aria-hidden="true" />}
      </div>
      <p className="kpi__valor">{valor}</p>
      <p className="kpi__rotulo">{rotulo}</p>
      {detalhe && <p className="kpi__detalhe">{detalhe}</p>}
    </>
  );

  return para ? (
    <Link to={para} className={`kpi kpi--${tom} kpi--link`}>
      {conteudo}
    </Link>
  ) : (
    <div className={`kpi kpi--${tom}`}>{conteudo}</div>
  );
};

export default KpiCard;