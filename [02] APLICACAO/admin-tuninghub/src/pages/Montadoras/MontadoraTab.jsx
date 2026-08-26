import { useEffect, useState, useRef } from 'react';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import FiltroBar from '../../components/ui/FiltroBar';
import ReativarMontadoraModal from './ReativarMontadoraModal';
import {
  listarMontadorasAdmin,
  criarMontadora,
  atualizarMontadora,
  desativarMontadora,
  reativarMontadora,
} from '../../api/montadoraService';
import { listarModelosAdmin, reativarModelo } from '../../api/modeloService';

const ITEMS_POR_PAGINA = 10;

const MontadoraTab = () => {
  const [montadoras, setMontadoras] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [montadoraReativando, setMontadoraReativando] = useState(null);
  const [modelosInativosDaMontadora, setModelosInativosDaMontadora] = useState([]);
  const [carregandoModelos, setCarregandoModelos] = useState(false);

  const ultimoScroll = useRef(0);

  const carregar = async () => {
    setCarregando(true);
    const dados = await listarMontadorasAdmin();
    setMontadoras(dados);
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

  const abrirEditar = (montadora) => {
    setEditando(montadora);
    setNome(montadora.Nome);
    setErro('');
    setModalAberto(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      if (editando) {
        await atualizarMontadora(editando.IdMontadora, nome);
      } else {
        await criarMontadora(nome);
      }
      setModalAberto(false);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar montadora.');
    } finally {
      setSalvando(false);
    }
  };

  const handleDesativar = async (montadora) => {
    const confirmar = window.confirm(
      `Desativar "${montadora.Nome}"? Isso também desativa todos os modelos dessa montadora.`
    );
    if (!confirmar) return;
    await desativarMontadora(montadora.IdMontadora);
    await carregar();
  };

  const abrirReativar = async (montadora) => {
    setMontadoraReativando(montadora);
    setCarregandoModelos(true);
    const todosModelos = await listarModelosAdmin();
    setModelosInativosDaMontadora(
      todosModelos.filter((m) => m.IdMontadora === montadora.IdMontadora && !m.Ativo)
    );
    setCarregandoModelos(false);
  };

  const handleConfirmarReativar = async (idsModelosSelecionados) => {
    setSalvando(true);
    try {
      await reativarMontadora(montadoraReativando.IdMontadora);
      if (idsModelosSelecionados.length > 0) {
        await Promise.all(idsModelosSelecionados.map((id) => reativarModelo(id)));
      }
      setMontadoraReativando(null);
      await carregar();
    } finally {
      setSalvando(false);
    }
  };

  const filtradas = montadoras.filter((m) => {
    const passaBusca = m.Nome.toLowerCase().includes(busca.toLowerCase());
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!m.Ativo : !m.Ativo;
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
        <button className="btn-primary" onClick={abrirCriar}>+ Nova Montadora</button>
      </div>

      <FiltroBar
        busca={busca}
        onBuscaChange={setBusca}
        status={statusFiltro}
        onStatusChange={setStatusFiltro}
        placeholder="Buscar montadora..."
      />

      {filtradas.length === 0 ? (
        <p className="empty-state">Nenhuma montadora encontrada.</p>
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
              {itensPagina.map((m) => (
                <tr key={m.IdMontadora} className={!m.Ativo ? 'inativo' : ''}>
                  <td>{m.Nome}</td>
                  <td>
                    <span className={`status-badge ${m.Ativo ? 'ativo' : 'inativo'}`}>
                      {m.Ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <div className="crud-actions">
                      <button className="link-action" onClick={() => abrirEditar(m)}>Editar</button>
                      {m.Ativo ? (
                        <button className="link-action" onClick={() => handleDesativar(m)}>Desativar</button>
                      ) : (
                        <button className="link-action" onClick={() => abrirReativar(m)}>Reativar</button>
                      )}
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
        <Modal title={editando ? 'Editar Montadora' : 'Nova Montadora'} onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar}>
            {erro && <div className="form-erro">{erro}</div>}
            <div className="form-field">
              <label htmlFor="nomeMontadora">Nome</label>
              <input
                id="nomeMontadora"
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

      {montadoraReativando && (
        <ReativarMontadoraModal
          montadora={montadoraReativando}
          modelosInativos={modelosInativosDaMontadora}
          carregandoModelos={carregandoModelos}
          onConfirm={handleConfirmarReativar}
          onClose={() => setMontadoraReativando(null)}
          salvando={salvando}
        />
      )}
    </div>
  );
};

export default MontadoraTab;