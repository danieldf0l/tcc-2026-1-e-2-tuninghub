import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import {
  listarMontadorasAdmin,
  criarMontadora,
  atualizarMontadora,
  desativarMontadora,
  reativarMontadora,
} from '../../api/montadoraService';

const MontadoraTab = () => {
  const [montadoras, setMontadoras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    const dados = await listarMontadorasAdmin();
    setMontadoras(dados);
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

  const handleToggleStatus = async (montadora) => {
    const confirmar = window.confirm(
      montadora.Ativo
        ? `Desativar "${montadora.Nome}"? Isso também desativa todos os modelos dessa montadora.`
        : `Reativar "${montadora.Nome}"?`
    );
    if (!confirmar) return;

    if (montadora.Ativo) {
      await desativarMontadora(montadora.IdMontadora);
    } else {
      await reativarMontadora(montadora.IdMontadora);
    }
    await carregar();
  };

  if (carregando) return <p className="empty-state">Carregando...</p>;

  return (
    <div>
      <div className="crud-header">
        <div />
        <button className="btn-primary" onClick={abrirCriar}>+ Nova Montadora</button>
      </div>

      {montadoras.length === 0 ? (
        <p className="empty-state">Nenhuma montadora cadastrada.</p>
      ) : (
        <table className="crud-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {montadoras.map((m) => (
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
    </div>
  );
};

export default MontadoraTab;