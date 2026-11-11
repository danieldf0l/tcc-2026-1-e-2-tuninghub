import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import './Campo.css';

/*
  Campos de formulário com rótulo, erro e dica.

  <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} erro={erros.nome} required />
  <Input type="search" icone={Search} placeholder="Buscar..." semMargem />
  <Textarea label="Descrição" rows={3} dica="Opcional" />
  <Select label="Montadora" value={id} onChange={(e) => setId(e.target.value)}>
    <option value="">Selecione</option>
    ...
  </Select>

  Aceitam qualquer prop nativa (value, onChange, disabled, autoFocus, ref...).
*/

const Campo = ({ id, label, erro, dica, obrigatorio, semMargem, children }) => (
  <div className={`campo${erro ? ' campo--erro' : ''}${semMargem ? ' campo--sem-margem' : ''}`}>
    {label && (
      <label htmlFor={id} className="campo__label">
        {label}
        {obrigatorio && <span className="campo__obrigatorio" aria-hidden="true"> *</span>}
      </label>
    )}
    {children}
    {erro ? (
      <p id={`${id}-erro`} className="campo__erro">{erro}</p>
    ) : (
      dica && <p id={`${id}-dica`} className="campo__dica">{dica}</p>
    )}
  </div>
);

const idDescricao = (id, erro, dica) => (erro ? `${id}-erro` : dica ? `${id}-dica` : undefined);

export const Input = ({ label, erro, dica, icone: Icone, semMargem, id, required, className = '', ...props }) => {
  const idAuto = useId();
  const campoId = id || idAuto;

  return (
    <Campo id={campoId} label={label} erro={erro} dica={dica} obrigatorio={required} semMargem={semMargem}>
      <div className="campo__controle">
        {Icone && <Icone className="campo__icone" size={16} aria-hidden="true" />}
        <input
          id={campoId}
          required={required}
          className={`campo__input${Icone ? ' campo__input--com-icone' : ''} ${className}`}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDescricao(campoId, erro, dica)}
          {...props}
        />
      </div>
    </Campo>
  );
};

export const Textarea = ({ label, erro, dica, semMargem, id, required, className = '', rows = 3, ...props }) => {
  const idAuto = useId();
  const campoId = id || idAuto;

  return (
    <Campo id={campoId} label={label} erro={erro} dica={dica} obrigatorio={required} semMargem={semMargem}>
      <textarea
        id={campoId}
        rows={rows}
        required={required}
        className={`campo__input campo__input--texto ${className}`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={idDescricao(campoId, erro, dica)}
        {...props}
      />
    </Campo>
  );
};

export const Select = ({ label, erro, dica, semMargem, id, required, className = '', children, ...props }) => {
  const idAuto = useId();
  const campoId = id || idAuto;

  return (
    <Campo id={campoId} label={label} erro={erro} dica={dica} obrigatorio={required} semMargem={semMargem}>
      <div className="campo__controle">
        <select
          id={campoId}
          required={required}
          className={`campo__input campo__input--select ${className}`}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDescricao(campoId, erro, dica)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="campo__seta" size={16} aria-hidden="true" />
      </div>
    </Campo>
  );
};