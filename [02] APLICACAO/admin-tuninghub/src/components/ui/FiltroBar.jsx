const FiltroBar = ({ busca, onBuscaChange, status, onStatusChange, placeholder }) => (
  <div className="filtro-bar">
    <input
      type="text"
      className="filtro-busca"
      placeholder={placeholder}
      value={busca}
      onChange={(e) => onBuscaChange(e.target.value)}
    />
    <select className="filtro-status" value={status} onChange={(e) => onStatusChange(e.target.value)}>
      <option value="todos">Todos</option>
      <option value="ativos">Ativos</option>
      <option value="inativos">Inativos</option>
    </select>
  </div>
);

export default FiltroBar;