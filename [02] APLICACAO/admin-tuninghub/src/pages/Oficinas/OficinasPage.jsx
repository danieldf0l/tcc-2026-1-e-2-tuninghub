import { useEffect, useState, useRef } from 'react';
import Pagination from '../../components/ui/Pagination';
import FiltroBar from '../../components/ui/FiltroBar';
import OficinaDetalheModal from './OficinaDetalheModal';
import { listarOficinasAdmin, desativarOficina, reativarOficina } from '../../api/oficinaService';

const ITEMS_POR_PAGINA = 10;

const formatarCnpj = (cnpj) => {
  const digitos = String(cnpj || '').replace(/\D/g, '');
  if (digitos.length !== 14) return cnpj;
  return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const OficinasPage = () => {
  const [oficinas, setOficinas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const [oficinaSelecionada, setOficinaSelecionada] = useState(null);

  const ultimoScroll = useRef(0);

  const carregar = async () => {
    setCarregando(true);
    const dados = await listarOficinasAdmin();
    setOficinas(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro]);

  const handleToggleStatus = async (oficina) => {
    const confirmar = window.confirm(
      oficina.Ativo
        ? `Desativar a conta de "${oficina.NomeOficina}"? Ela perde acesso ao login imediatamente.`
        : `Reativar a conta de "${oficina.NomeOficina}"?`
    );
    if (!confirmar) return;

    if (oficina.Ativo) {
      await desativarOficina(oficina.IdOficina);
    } else {
      await reativarOficina(oficina.IdOficina);
    }
    await carregar();
  };

  const filtradas = oficinas.filter((o) => {
    const termo = busca.toLowerCase();
    const passaBusca =
      o.NomeOficina.toLowerCase().includes(termo) ||
      o.Email.toLowerCase().includes(termo) ||
      String(o.CNPJ).includes(busca.replace(/\D/g, ''));
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!o.Ativo : !o.Ativo;
    return passaBusca && passaStatus;
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
        <h1>Oficinas</h1>
      </div>

      <FiltroBar
        busca={busca}
        onBuscaChange={setBusca}
        status={statusFiltro}
        onStatusChange={setStatusFiltro}
        placeholder="Buscar por nome, e-mail ou CNPJ..."
      />

      {filtradas.length === 0 ? (
        <p className="empty-state">Nenhuma oficina encontrada.</p>
      ) : (
        <div className="crud-table-wrapper" onWheel={handleScrollPagina}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>E-mail</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((o) => (
                <tr key={o.IdOficina} className={!o.Ativo ? 'inativo' : ''}>
                  <td>{o.NomeOficina}</td>
                  <td>{formatarCnpj(o.CNPJ)}</td>
                  <td>{o.Email}</td>
                  <td>
                    <span className={`status-badge ${o.Ativo ? 'ativo' : 'inativo'}`}>
                      {o.Ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <div className="crud-actions">
                      <button className="link-action" onClick={() => setOficinaSelecionada(o)}>
                        Ver detalhes
                      </button>
                      <button className="link-action" onClick={() => handleToggleStatus(o)}>
                        {o.Ativo ? 'Desativar' : 'Reativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination paginaAtual={paginaSegura} totalPaginas={totalPaginas} onChange={setPagina} />
        </div>
      )}

      {oficinaSelecionada && (
        <OficinaDetalheModal
          oficina={oficinaSelecionada}
          onClose={() => setOficinaSelecionada(null)}
          onAtualizado={async () => {
            await carregar();
            setOficinaSelecionada(null);
          }}
        />
      )}
    </div>
  );
};

export default OficinasPage;