import { useEffect, useState, useRef } from 'react';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import {
  listarServicosAdmin,
  criarServico,
  atualizarServico,
  desativarServico,
  reativarServico,
} from '../../api/servicoService';
import { listarCategoriasAtivas } from '../../api/categoriaServicoService';

const ITEMS_POR_PAGINA = 10;

const ServicoTab = () => {
  const [servicos, setServicos] = useState([]);
  const [categoriasAtivas, setCategoriasAtivas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [pagina, setPagina] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const ultimoScroll = useRef(0);

  const carregar = async () => {
    setCarregando(true);
    const [dadosServicos, dadosCategorias] = await Promise.all([
      listarServicosAdmin(),
      listarCategoriasAtivas(),
    ]);
    setServicos(dadosServicos);
    setCategoriasAtivas(dadosCategorias);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro, categoriaFiltro]);

  const abrirCriar = () => {
    setEditando(null);
    setNome('');
    setDescricao('');
    setIdCategoria(categoriasAtivas[0]?.IdCategoria ?? '');
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (servico) => {
    setEditando(servico);
    setNome(servico.Nome);
    setDescricao(servico.Descricao || '');
    setIdCategoria(servico.IdCategoria);
    setErro('');
    setModalAberto(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      if (editando) {
        await atualizarServico(editando.IdServico, nome, descricao, idCategoria);
      } else {
        await criarServico(nome, descricao, idCategoria);
      }
      setModalAberto(false);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar serviço.');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleStatus = async (servico) => {
    const confirmar = window.confirm(
      servico.Ativo
        ? `Desativar o serviço "${servico.Nome}"? Ele deixa de aparecer para novos vínculos, mas vínculos existentes não são afetados.`
        : `Reativar o serviço "${servico.Nome}"?`
    );
    if (!confirmar) return;

    if (servico.Ativo) {
      await desativarServico(servico.IdServico);
    } else {
      await reativarServico(servico.IdServico);
    }
    await carregar();
  };

  const filtrados = servicos.filter((s) => {
    const passaBusca = s.Nome.toLowerCase().includes(busca.toLowerCase());
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!s.Ativo : !s.Ativo;
    const passaCategoria =
      categoriaFiltro === 'todas' ? true : String(s.IdCategoria) === String(categoriaFiltro);
    return passaBusca && passaStatus && passaCategoria;
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
        <div />
        <button className="btn-primary" onClick={abrirCriar} disabled={categoriasAtivas.length === 0}>
          + Novo Serviço
        </button>
      </div>

      {categoriasAtivas.length === 0 && (
        <p className="empty-state">Cadastre uma categoria ativa antes de criar serviços.</p>
      )}

      <div className="filtro-bar">
        <input
          type="text"
          className="filtro-busca"
          placeholder="Buscar serviço..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select
          className="filtro-status"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="todas">Todas as categorias</option>
          {categoriasAtivas.map((c) => (
            <option key={c.IdCategoria} value={c.IdCategoria}>{c.Nome}</option>
          ))}
        </select>
        <select
          className="filtro-status"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <p className="empty-state">Nenhum serviço encontrado.</p>
      ) : (
        <div className="crud-table-wrapper" onWheel={handleScrollPagina}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((s) => (
                <tr key={s.IdServico} className={!s.Ativo ? 'inativo' : ''}>
                  <td>{s.Nome}</td>
                  <td><span className="categoria-tag">{s.Categoria}</span></td>
                  <td>
                    <span className={`status-badge ${s.Ativo ? 'ativo' : 'inativo'}`}>
                      {s.Ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="crud-actions">
                      <button className="link-action" onClick={() => abrirEditar(s)}>Editar</button>
                      <button className="link-action" onClick={() => handleToggleStatus(s)}>
                        {s.Ativo ? 'Desativar' : 'Reativar'}
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
        <Modal title={editando ? 'Editar Serviço' : 'Novo Serviço'} onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar}>
            {erro && <div className="form-erro">{erro}</div>}

            <div className="form-field">
              <label htmlFor="nomeServico">Nome</label>
              <input
                id="nomeServico"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label htmlFor="categoriaServico">Categoria</label>
              <select
                id="categoriaServico"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
                required
              >
                {categoriasAtivas.map((c) => (
                  <option key={c.IdCategoria} value={c.IdCategoria}>{c.Nome}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="descricaoServico">Descrição (opcional)</label>
              <textarea
                id="descricaoServico"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
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

export default ServicoTab;