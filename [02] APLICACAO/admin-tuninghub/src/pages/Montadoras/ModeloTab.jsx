import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import { listarMontadorasAtivas } from '../../api/montadoraService';
import {
  listarModelosAdmin,
  criarModelo,
  atualizarModelo,
  desativarModelo,
  reativarModelo,
} from '../../api/modeloService';

const ModeloTab = () => {
  const [modelos, setModelos] = useState([]);
  const [montadorasAtivas, setMontadorasAtivas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [idMontadora, setIdMontadora] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

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
        // Backend só permite alterar o nome do modelo, a montadora vinculada é fixa
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

      {modelos.length === 0 ? (
        <p className="empty-state">Nenhum modelo cadastrado.</p>
      ) : (
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
            {modelos.map((m) => (
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