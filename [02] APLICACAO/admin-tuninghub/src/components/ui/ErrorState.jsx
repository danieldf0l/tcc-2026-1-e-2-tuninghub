import { AlertCircle, RotateCw } from 'lucide-react';
import './EmptyState.css';

/*
  <ErrorState onTentarNovamente={carregar} />
  <ErrorState titulo="..." descricao={mensagemErro(erro)} onTentarNovamente={carregar} compacto />
*/
const ErrorState = ({
  titulo = 'Não foi possível carregar',
  descricao = 'Verifique sua conexão e tente de novo.',
  onTentarNovamente,
  compacto = false,
}) => (
  <div className={`estado-vazio estado-vazio--erro${compacto ? ' estado-vazio--compacto' : ''}`} role="alert">
    <span className="estado-vazio__icone" aria-hidden="true">
      <AlertCircle size={22} />
    </span>
    <h3 className="estado-vazio__titulo">{titulo}</h3>
    {descricao && <p className="estado-vazio__descricao">{descricao}</p>}
    {onTentarNovamente && (
      <div className="estado-vazio__acao">
        <button type="button" className="btn-secondary estado-vazio__botao" onClick={onTentarNovamente}>
          <RotateCw size={16} aria-hidden="true" />
          Tentar de novo
        </button>
      </div>
    )}
  </div>
);

export default ErrorState;