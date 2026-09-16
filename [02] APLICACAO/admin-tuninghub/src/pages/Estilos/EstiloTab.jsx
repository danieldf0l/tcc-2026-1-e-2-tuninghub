import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import FiltroBar from '../../components/ui/FiltroBar';
import {
  listarEstilosAdmin,
  criarEstilo,
  atualizarEstilo,
  desativarEstilo,
  reativarEstilo,
} from '../../api/estiloService';

const EstiloTab = () => {
  const [estilos, setEstilos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    const dados = await listarEstilosAdmin();
    setEstilos(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirCriar = () => {
    setEditando(null);
    setNome('');
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (estilo) => {
    setEditando(estilo);
    setNome(estilo.Nome);
    setErro('');
    setModalAberto(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      if (editando) {
        await atualizarEstilo(editando.IdEstilo, nome);
      } else {
        await criarEstilo(nome);
      }
      setModalAberto(false);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar estilo.');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleStatus = async (estilo) => {
    const confirmar = window.confirm(
      estilo.Ativo
        ? `Desativar o estilo "${estilo.Nome}"? Ele deixa de aparecer para novos projetos, mas projetos existentes não são afetados.`
        : `Reativar o estilo "${estilo.Nome}"?`
    );
    if (!confirmar) return;

    if (estilo.Ativo) {
      await desativarEstilo(estilo.IdEstilo);
    } else {
      await reativarEstilo(estilo.IdEstilo);
    }
    await carregar();
  };

  if (carregando) return <p className="empty-state">Carregando...</p>;

  const filtrados = estilos.filter((e) => {
    const passaBusca = e.Nome.toLowerCase().includes(busca.toLowerCase());
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!e.Ativo : !e.Ativo;
    return passaBusca && passaStatus;
  });

  return (
    <div>
      <div className="crud-header">
        <div />
        <button className="btn-primary" onClick={abrirCriar}>+ Novo Estilo</button>
      </div>

      <FiltroBar
        busca={busca}
        onBuscaChange={setBusca}
        status={statusFiltro}
        onStatusChange={setStatusFiltro}
        placeholder="Buscar estilo..."
      />

      {filtrados.length === 0 ? (
        <p className="empty-state">Nenhum estilo encontrado.</p>
      ) : (
        <table className="crud-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Código</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((e) => (
              <tr key={e.IdEstilo} className={!e.Ativo ? 'inativo' : ''}>
                <td>{e.Nome}</td>
                <td><span className="categoria-tag">{e.Codigo}</span></td>
                <td>
                  <span className={`status-badge ${e.Ativo ? 'ativo' : 'inativo'}`}>
                    {e.Ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div className="crud-actions">
                    <button className="link-action" onClick={() => abrirEditar(e)}>Editar</button>
                    <button className="link-action" onClick={() => handleToggleStatus(e)}>
                      {e.Ativo ? 'Desativar' : 'Reativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalAberto && (
        <Modal title={editando ? 'Editar Estilo' : 'Novo Estilo'} onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar}>
            {erro && <div className="form-erro">{erro}</div>}

            <div className="form-field">
              <label htmlFor="nomeEstilo">Nome</label>
              <input
                id="nomeEstilo"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </div>

            {editando && (
              <div className="form-field">
                <label>Código</label>
                <div className="form-field-readonly">{editando.Codigo}</div>
              </div>
            )}
            {!editando && (
              <p className="form-hint">
                O código (usado internamente, ex: STANCE) é gerado automaticamente a partir do nome e nunca muda depois de criado.
              </p>
            )}

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

export default EstiloTab;