import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { vincularProdutoExterno } from '../../api/planoService';

const VincularProdutoModal = ({ plano, onClose, onSalvo }) => {
  const [idProdutoExterno, setIdProdutoExterno] = useState(plano.IdProdutoExterno || '');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await vincularProdutoExterno(plano.IdPlano, idProdutoExterno.trim());
      onSalvo();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao vincular produto externo.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal title={`Vincular AbacatePay — ${plano.Nome}`} onClose={onClose}>
      <form onSubmit={handleSalvar}>
        {erro && <div className="form-erro">{erro}</div>}
        <p className="modal-texto">
          Cole aqui o ID do produto já criado no painel do AbacatePay para este plano.
        </p>
        <div className="form-field">
          <label htmlFor="idProdutoExterno">Id do Produto Externo</label>
          <input
            id="idProdutoExterno"
            type="text"
            value={idProdutoExterno}
            onChange={(e) => setIdProdutoExterno(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VincularProdutoModal;