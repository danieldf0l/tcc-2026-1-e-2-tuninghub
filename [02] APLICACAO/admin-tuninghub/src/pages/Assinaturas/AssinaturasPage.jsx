import { useEffect, useState, useRef } from 'react';
import Pagination from '../../components/ui/Pagination';
import { listarAssinaturasAdmin } from '../../api/assinaturaService';

const ITEMS_POR_PAGINA = 10;

const STATUS_BADGE = { ATIVA: 'ativo', PENDENTE: 'pendente', EXPIRADA: 'inativo', CANCELADA: 'inativo' };

const formatarData = (data) => (data ? new Date(data).toLocaleDateString('pt-BR') : '—');

const AssinaturasPage = () => {
  const [assinaturas, setAssinaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [planoFiltro, setPlanoFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const ultimoScroll = useRef(0);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const dados = await listarAssinaturasAdmin();
      setAssinaturas(dados);
      setCarregando(false);
    };
    carregar();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro, planoFiltro]);

  const planosDisponiveis = [...new Set(assinaturas.map((a) => a.NomePlano))];
  const statusDisponiveis = [...new Set(assinaturas.map((a) => a.Status))];

  const filtradas = assinaturas.filter((a) => {
    const passaBusca = a.NomeOficina.toLowerCase().includes(busca.toLowerCase());
    const passaStatus = statusFiltro === 'todos' ? true : a.Status === statusFiltro;
    const passaPlano = planoFiltro === 'todos' ? true : a.NomePlano === planoFiltro;
    return passaBusca && passaStatus && passaPlano;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITEMS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const itensPagina = filtradas.slice(
    (paginaSegura - 1) * ITEMS_POR_PAGINA,
    paginaSegura * ITEMS_POR_PAGINA
  );

  const handleScrollPagina = (e) => {
    const agora = Date.now();
    if (agora - ultimoScroll.current < 500) return;
    if (Math.abs(e.deltaY) < 20) return;

    if (e.deltaY > 0 && paginaSegura < totalPaginas) {
      ultimoScroll.current = agora;
      setPagina(paginaSegura + 1);
    } else if (e.deltaY < 0 && paginaSegura > 1) {
      ultimoScroll.current = agora;
      setPagina(paginaSegura - 1);
    }
  };

  if (carregando) return <p className="empty-state">Carregando...</p>;

  return (
    <div>
      <div className="crud-header">
        <h1>Assinaturas</h1>
      </div>

      <div className="filtro-bar-larga">
        <input
          type="text"
          className="filtro-busca"
          placeholder="Buscar por nome da oficina..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select className="filtro-status" value={planoFiltro} onChange={(e) => setPlanoFiltro(e.target.value)}>
          <option value="todos">Todos os planos</option>
          {planosDisponiveis.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className="filtro-status" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
          <option value="todos">Todos os status</option>
          {statusDisponiveis.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <p className="empty-state">Nenhuma assinatura encontrada.</p>
      ) : (
        <div className="crud-table-wrapper" onWheel={handleScrollPagina}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Oficina</th>
                <th>Plano</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((a) => (
                <tr key={a.IdAssinatura}>
                  <td>{a.NomeOficina}</td>
                  <td>{a.NomePlano}</td>
                  <td>{formatarData(a.DataInicio)}</td>
                  <td>{formatarData(a.DataFim)}</td>
                  <td>
                    <span className={`status-badge ${STATUS_BADGE[a.Status] || 'inativo'}`}>{a.Status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination paginaAtual={paginaSegura} totalPaginas={totalPaginas} onChange={setPagina} />
        </div>
      )}
    </div>
  );
};

export default AssinaturasPage;