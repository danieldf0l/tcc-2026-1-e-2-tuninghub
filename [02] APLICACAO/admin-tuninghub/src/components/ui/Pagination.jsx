import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './Button';
import './Pagination.css';

/*
  <Pagination
    paginaAtual={pagina}
    totalPaginas={totalPaginas}
    onChange={irParaPagina}
    totalItens={134}          // opcional: mostra "Mostrando 1–10 de 134 modelos"
    porPagina={10}
    rotuloItens="modelos"
  />
  Telas antigas que passam só as 3 primeiras props continuam funcionando.
*/
const Pagination = ({ paginaAtual, totalPaginas, onChange, totalItens, porPagina = 10, rotuloItens = 'itens' }) => {
  const mostraInfo = totalItens !== undefined && totalItens > 0;
  if (!mostraInfo && totalPaginas <= 1) return null;

  const inicio = (paginaAtual - 1) * porPagina + 1;
  const fim = Math.min(paginaAtual * porPagina, totalItens ?? 0);

  return (
    <nav className="paginacao" aria-label="Paginação">
      {mostraInfo && (
        <p className="paginacao__info">
          Mostrando <strong>{inicio}–{fim}</strong> de <strong>{totalItens.toLocaleString('pt-BR')}</strong> {rotuloItens}
        </p>
      )}

      {totalPaginas > 1 && (
        <div className="paginacao__controles">
          <IconButton
            icone={ChevronLeft}
            rotulo="Página anterior"
            variante="secundario"
            tamanho="sm"
            disabled={paginaAtual <= 1}
            onClick={() => onChange(paginaAtual - 1)}
          />
          <span className="paginacao__pagina">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <IconButton
            icone={ChevronRight}
            rotulo="Próxima página"
            variante="secundario"
            tamanho="sm"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => onChange(paginaAtual + 1)}
          />
        </div>
      )}
    </nav>
  );
};

export default Pagination;