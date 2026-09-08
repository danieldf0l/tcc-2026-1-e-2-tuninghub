import { useEffect, useState, useRef } from 'react';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import FiltroBar from '../../components/ui/FiltroBar';
import {
  listarCategoriasAdmin,
  criarCategoria,
  atualizarCategoria,
  desativarCategoria,
  reativarCategoria,
} from '../../api/categoriaServicoService';

const ITEMS_POR_PAGINA = 10;

const CategoriaTab = () => {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const ultimoScroll = useRef(0);

  const carregar = async () => {
    setCarregando(true);
    const dados = await listarCategoriasAdmin();
    setCategorias(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro]);

  const abrirCriar = () => {
    setEditando(null);
    setNome('');
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (categoria) => {
    setEditando(categoria);
    setNome(categoria.Nome);
    setErro('');
    setModalAberto(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      if (editando) {
        await atualizarCategoria(editando.IdCategoria, nome);
      } else {
        await criarCategoria(nome);
      }
      setModalAberto(false);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar categoria.');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleStatus = async (categoria) => {
    const confirmar = window.confirm(
      categoria.Ativo
        ? `Desativar a categoria "${categoria.Nome}"? Ela deixa de aparecer para novos serviços, mas serviços já cadastrados com ela não são afetados.`
        : `Reativar a categoria "${categoria.Nome}"?`
    );
    if (!confirmar) return;

    if (categoria.Ativo) {
      await desativarCategoria(categoria.IdCategoria);
    } else {
      await reativarCategoria(categoria.IdCategoria);
    }
    await carregar();
  };

  const filtradas = categorias.filter((c) => {
    const passaBusca = c.Nome.toLowerCase().includes(busca.toLowerCase());
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!c.Ativo : !c.Ativo;
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
        <div />
        <button className="btn-primary" onClick={abrirCriar}>+ Nova Categoria</button>
      </div>

      <FiltroBar
        busca={busca}
        onBuscaChange={setBusca}
        status={statusFiltro}
        onStatusChange={setStatusFiltro}
        placeholder="Buscar categoria..."
      />

      {filtradas.length === 0 ? (
        <p className="empty-state">Nenhuma categoria encontrada.</p>
      ) : (
        <div className="crud-table-wrapper" onWheel={handleScrollPagina}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((c) => (
                <tr key={c.IdCategoria} className={!c.Ativo ? 'inativo' : ''}>
                  <td>{c.Nome}</td>
                  <td>
                    <span className={`status-badge ${c.Ativo ? 'ativo' : 'inativo'}`}>
                      {c.Ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <div className="crud-actions">
                      <button className="link-action" onClick={() => abrirEditar(c)}>Editar</button>
                      <button className="link-action" onClick={() => handleToggleStatus(c)}>
                        {c.Ativo ? 'Desativar' : 'Reativar'}
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

      {modalAberto && (
        <Modal title={editando ? 'Editar Categoria' : 'Nova Categoria'} onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar}>
            {erro && <div className="form-erro">{erro}</div>}
            <div className="form-field">
              <label htmlFor="nomeCategoria">Nome</label>
              <input
                id="nomeCategoria"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoriaTab;