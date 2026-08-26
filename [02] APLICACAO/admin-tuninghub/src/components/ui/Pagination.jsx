const Pagination = ({ paginaAtual, totalPaginas, onChange }) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={paginaAtual === 1} onClick={() => onChange(paginaAtual - 1)}>‹ Anterior</button>
      <span>Página {paginaAtual} de {totalPaginas}</span>
      <button disabled={paginaAtual === totalPaginas} onClick={() => onChange(paginaAtual + 1)}>Próxima ›</button>
    </div>
  );
};

export default Pagination;