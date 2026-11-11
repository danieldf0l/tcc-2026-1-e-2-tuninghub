import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input, Select } from './Campo';
import { Button } from './Button';
import './BarraFiltros.css';

/*
  Linha de filtros acima da tabela: busca, selects extras, "Limpar" e ações (ex.: botão Novo).
  A tecla "/" (fora de um campo) leva o foco para a busca.

  <BarraFiltros
    busca={lista.busca}
    onBusca={lista.setBusca}
    placeholder="Buscar montadora..."
    filtrosAtivos={lista.filtrosAtivos}
    onLimpar={lista.limparFiltros}
    acoes={<Button icone={Plus}>Nova montadora</Button>}
  >
    <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
  </BarraFiltros>
*/
const BarraFiltros = ({ busca, onBusca, placeholder = 'Buscar...', filtrosAtivos, onLimpar, acoes, children }) => {
  const buscaRef = useRef(null);

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      buscaRef.current?.focus();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <div className="barra-filtros">
      <div className="barra-filtros__busca">
        <Input
          ref={buscaRef}
          type="search"
          icone={Search}
          placeholder={placeholder}
          aria-label={placeholder}
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          semMargem
        />
        {!busca && (
          <kbd className="barra-filtros__atalho" title="Atalho: tecla /">/</kbd>
        )}
      </div>

      {children}

      {filtrosAtivos && (
        <Button variante="fantasma" icone={X} onClick={onLimpar}>
          Limpar
        </Button>
      )}

      {acoes && <div className="barra-filtros__acoes">{acoes}</div>}
    </div>
  );
};

// Select de status padrão (Todos / Ativos / Inativos)
export const FiltroStatus = ({ valor, onChange }) => (
  <div className="barra-filtros__select">
    <Select aria-label="Status" value={valor} onChange={(e) => onChange(e.target.value)} semMargem>
      <option value="todos">Todos os status</option>
      <option value="ativos">Ativos</option>
      <option value="inativos">Inativos</option>
    </Select>
  </div>
);

// Select genérico para filtros extras (categoria, montadora, plano...)
export const FiltroSelect = ({ rotulo, valor, onChange, children }) => (
  <div className="barra-filtros__select">
    <Select aria-label={rotulo} value={valor} onChange={(e) => onChange(e.target.value)} semMargem>
      {children}
    </Select>
  </div>
);

export default BarraFiltros;