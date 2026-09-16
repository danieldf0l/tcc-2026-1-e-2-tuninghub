import { useEffect, useState, useRef } from 'react';
import Pagination from '../../components/ui/Pagination';
import FiltroBar from '../../components/ui/FiltroBar';
import { listarUsuariosAdmin, desativarUsuario, reativarUsuario } from '../../api/usuarioService';

const ITEMS_POR_PAGINA = 10;

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const ultimoScroll = useRef(0);

  const carregar = async () => {
    setCarregando(true);
    const dados = await listarUsuariosAdmin();
    setUsuarios(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro]);

  const handleToggleStatus = async (usuario) => {
    const confirmar = window.confirm(
      usuario.Ativo
        ? `Desativar a conta de "${usuario.Nome}"? Ele perde acesso ao login imediatamente.`
        : `Reativar a conta de "${usuario.Nome}"?`
    );
    if (!confirmar) return;

    if (usuario.Ativo) {
      await desativarUsuario(usuario.IdUsuario);
    } else {
      await reativarUsuario(usuario.IdUsuario);
    }
    await carregar();
  };

  const filtrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    const passaBusca = u.Nome.toLowerCase().includes(termo) || u.Email.toLowerCase().includes(termo);
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!u.Ativo : !u.Ativo;
    return passaBusca && passaStatus;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const itensPagina = filtrados.slice(
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
        <h1>Usuários</h1>
      </div>

      <FiltroBar
        busca={busca}
        onBuscaChange={setBusca}
        status={statusFiltro}
        onStatusChange={setStatusFiltro}
        placeholder="Buscar por nome ou e-mail..."
      />

      {filtrados.length === 0 ? (
        <p className="empty-state">Nenhum usuário encontrado.</p>
      ) : (
        <div className="crud-table-wrapper" onWheel={handleScrollPagina}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cadastrado em</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((u) => (
                <tr key={u.IdUsuario} className={!u.Ativo ? 'inativo' : ''}>
                  <td>{u.Nome}</td>
                  <td>{u.Email}</td>
                  <td>{new Date(u.DataCriacao).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`status-badge ${u.Ativo ? 'ativo' : 'inativo'}`}>
                      {u.Ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="crud-actions">
                      <button className="link-action" onClick={() => handleToggleStatus(u)}>
                        {u.Ativo ? 'Desativar' : 'Reativar'}
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
    </div>
  );
};

export default UsuariosPage;