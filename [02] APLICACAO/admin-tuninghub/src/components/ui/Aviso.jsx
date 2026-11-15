import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import './Aviso.css';

/*
  Aviso fixo dentro da tela (não some sozinho, ao contrário do toast).

  <Aviso tom="aviso" titulo="Plano sem produto no AbacatePay" acao={<Button ...>Vincular</Button>}>
    O checkout desse plano falha até o produto ser vinculado.
  </Aviso>

  tom: 'info' | 'aviso' | 'perigo' | 'sucesso'
*/
const ICONES = {
  info: Info,
  aviso: AlertTriangle,
  perigo: AlertCircle,
  sucesso: CheckCircle2,
};

const Aviso = ({ tom = 'info', titulo, children, acao }) => {
  const Icone = ICONES[tom] || Info;

  return (
    <div className={`aviso aviso--${tom}`} role={tom === 'perigo' ? 'alert' : 'status'}>
      <Icone className="aviso__icone" size={18} aria-hidden="true" />
      <div className="aviso__textos">
        {titulo && <p className="aviso__titulo">{titulo}</p>}
        {children && <div className="aviso__descricao">{children}</div>}
      </div>
      {acao && <div className="aviso__acao">{acao}</div>}
    </div>
  );
};

export default Aviso;