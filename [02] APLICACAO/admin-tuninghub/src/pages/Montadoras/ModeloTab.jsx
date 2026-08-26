import { useEffect, useState, useRef } from 'react';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import FiltroBar from '../../components/ui/FiltroBar';
import { listarMontadorasAtivas } from '../../api/montadoraService';
import {
  listarModelosAdmin,
  criarModelo,
  atualizarModelo,
  desativarModelo,
  reativarModelo,
} from '../../api/modeloService';

const ITEMS_POR_PAGINA = 10;

const ModeloTab = () => {
  const [modelos, setModelos] = useState([]);
  const [montadorasAtivas, setMontadorasAtivas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [idMontadora, setIdMontadora] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const ultimoScroll = useRef(0);

  const carregar = async () => {
    setCarregando(true);
    const [dadosModelos, dadosMontadoras] = await Promise.all([
      listarModelosAdmin(),
      listarMontadorasAtivas(),
    ]);
    setModelos(dadosModelos);
    setMontadorasAtivas(dadosMontadoras);
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
    setIdMontadora(montadorasAtivas[0]?.IdMontadora ?? '');
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (modelo) => {
    setEditando(modelo);
    setNome(modelo.Modelo);
    setIdMontadora(modelo.IdMontadora);
    setErro('');
    setModalAberto(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      if (editando) {
        await atualizarModelo(editando.IdModelo, nome);
      } else {
        await criarModelo(idMontadora, nome);
      }
      setModalAberto(false);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar modelo.');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleStatus = async (modelo) => {
    const confirmar = window.confirm(
      modelo.Ativo ? `Desativar o modelo "${modelo.Modelo}"?` : `Reativar o modelo "${modelo.Modelo}"?`
    );
    if (!confirmar) return;

    if (modelo.Ativo) {
      await desativarModelo(modelo.IdModelo);
    } else {
      await reativarModelo(modelo.IdModelo);
    }
    await carregar();
  };

  const filtrados = modelos.filter((m) => {
    const termo = busca.toLowerCase();
    const passaBusca = m.Modelo.toLowerCase().includes(termo) || m.Montadora.toLowerCase().includes(termo);
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!m.Ativo : !m.Ativo;
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
        <div />
        <button className="btn-primary" onClick={abrirCriar} disabled={montadorasAtivas.length === 0}>
          + Novo Modelo
        </button>
      </div>

      {montadorasAtivas.length === 0 && (
        <p className="empty-state">Cadastre uma montadora ativa antes de criar modelos.</p>
      )}

      <FiltroBar
        busca={busca}
        onBuscaChange={setBusca}
        status={statusFiltro}
        onStatusChange={setStatusFiltro}
        placeholder="Buscar modelo ou montadora..."
      />

      {filtrados.length === 0 ? (
        <p className="empty-state">Nenhum modelo encontrado.</p>
      ) : (
        <div className="crud-table-wrapper" onWheel={handleScrollPagina}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Montadora</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((m) => (
                <tr key={m.IdModelo} className={!m.Ativo ? 'inativo' : ''}>
                  <td>{m.Modelo}</td>
                  <td>{m.Montadora}</td>
                  <td>
                    <span className={`status-badge ${m.Ativo ? 'ativo' : 'inativo'}`}>
                      {m.Ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="crud-actions">
                      <button className="link-action" onClick={() => abrirEditar(m)}>Editar</button>
                      <button className="link-action" onClick={() => handleToggleStatus(m)}>
                        {m.Ativo ? 'Desativar' : 'Reativar'}
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
        <Modal title={editando ? 'Editar Modelo' : 'Novo Modelo'} onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar}>
            {erro && <div className="form-erro">{erro}</div>}

            <div className="form-field">
              <label htmlFor="montadoraModelo">Montadora</label>
              <select
                id="montadoraModelo"
                value={idMontadora}
                onChange={(e) => setIdMontadora(e.target.value)}
                required
                disabled={!!editando}
              >
                {montadorasAtivas.map((mo) => (
                  <option key={mo.IdMontadora} value={mo.IdMontadora}>{mo.Nome}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="nomeModelo">Nome</label>
              <input
                id="nomeModelo"
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

export default ModeloTab;