import { Inbox } from 'lucide-react';
import './EmptyState.css';

/*
  <EmptyState
    icone={Car}                         // componente lucide (padrão: Inbox)
    titulo="Nenhum modelo cadastrado"
    descricao="Crie o primeiro modelo para ele aparecer no app."
    acao={<button className="btn-primary" onClick={abrirCriar}>Novo modelo</button>}
    compacto                             // sem moldura, para dentro de abas/drawers
  />
*/
const EmptyState = ({ icone: Icone = Inbox, titulo, descricao, acao, compacto = false }) => (
  <div className={`estado-vazio${compacto ? ' estado-vazio--compacto' : ''}`}>
    <span className="estado-vazio__icone" aria-hidden="true">
      <Icone size={22} />
    </span>
    <h3 className="estado-vazio__titulo">{titulo}</h3>
    {descricao && <p className="estado-vazio__descricao">{descricao}</p>}
    {acao && <div className="estado-vazio__acao">{acao}</div>}
  </div>
);

export default EmptyState;