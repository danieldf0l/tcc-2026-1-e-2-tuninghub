import { useRef } from 'react';
import './Tabs.css';

/*
  <Tabs
    abas={[
      { id: 'montadoras', rotulo: 'Montadoras', contador: 107 },
      { id: 'modelos', rotulo: 'Modelos', icone: Car },
    ]}
    ativa={aba}
    onChange={setAba}
  />
  Setas ← → trocam de aba pelo teclado.
*/
const Tabs = ({ abas, ativa, onChange, rotulo = 'Abas' }) => {
  const refs = useRef([]);

  const aoTeclar = (e, indice) => {
    let proximo = null;
    if (e.key === 'ArrowRight') proximo = (indice + 1) % abas.length;
    if (e.key === 'ArrowLeft') proximo = (indice - 1 + abas.length) % abas.length;
    if (proximo === null) return;
    e.preventDefault();
    onChange(abas[proximo].id);
    refs.current[proximo]?.focus();
  };

  return (
    <div className="abas" role="tablist" aria-label={rotulo}>
      {abas.map((aba, i) => {
        const Icone = aba.icone;
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selecionada}
            tabIndex={selecionada ? 0 : -1}
            className={`abas__aba${selecionada ? ' abas__aba--ativa' : ''}`}
            onClick={() => onChange(aba.id)}
            onKeyDown={(e) => aoTeclar(e, i)}
          >
            {Icone && <Icone size={16} aria-hidden="true" />}
            {aba.rotulo}
            {aba.contador != null && <span className="abas__contador">{aba.contador}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;