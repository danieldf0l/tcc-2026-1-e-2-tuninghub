import { useId, useState } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import './Campo.css';

/*
  Campos de formulário com rótulo, erro e dica.

  <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} erro={erros.nome} required />
  <Input type="search" icone={Search} placeholder="Buscar..." semMargem />
  <InputSenha label="Senha" value={senha} onChange={...} autoComplete="current-password" />
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

export const Input = ({
  label,
  erro,
  dica,
  icone: Icone,
  sufixo,
  semMargem,
  id,
  required,
  className = '',
  ...props
}) => {
  const idAuto = useId();
  const campoId = id || idAuto;
  const classes = [
    'campo__input',
    Icone && 'campo__input--com-icone',
    sufixo && 'campo__input--com-sufixo',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Campo id={campoId} label={label} erro={erro} dica={dica} obrigatorio={required} semMargem={semMargem}>
      <div className="campo__controle">
        {Icone && <Icone className="campo__icone" size={16} aria-hidden="true" />}
        <input
          id={campoId}
          required={required}
          className={classes}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDescricao(campoId, erro, dica)}
          {...props}
        />
        {sufixo && <span className="campo__sufixo">{sufixo}</span>}
      </div>
    </Campo>
  );
};

// Senha com botão de mostrar/ocultar e aviso de Caps Lock
export const InputSenha = ({ dica, onKeyUp, ...props }) => {
  const [visivel, setVisivel] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  return (
    <Input
      {...props}
      type={visivel ? 'text' : 'password'}
      dica={capsLock ? 'Caps Lock está ativado.' : dica}
      onKeyUp={(e) => {
        setCapsLock(!!e.getModifierState?.('CapsLock'));
        onKeyUp?.(e);
      }}
      sufixo={
        <button
          type="button"
          className="campo__sufixo-botao"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visivel}
        >
          {visivel ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      }
    />
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