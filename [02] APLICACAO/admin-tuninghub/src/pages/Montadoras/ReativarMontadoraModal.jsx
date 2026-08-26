import { useState } from 'react';
import Modal from '../../components/ui/Modal';

const ReativarMontadoraModal = ({ montadora, modelosInativos, carregandoModelos, onConfirm, onClose, salvando }) => {
  const [selecionados, setSelecionados] = useState([]);

  const todosSelecionados = modelosInativos.length > 0 && selecionados.length === modelosInativos.length;

  const toggleTodos = () => {
    setSelecionados(todosSelecionados ? [] : modelosInativos.map((m) => m.IdModelo));
  };

  const toggleUm = (id) => {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
        <Modal title={`Reativar "${montadora.Nome}"`} onClose={onClose} wide>
      <p className="modal-texto">
        Por padrão, só a montadora é reativada. Se quiser, selecione abaixo quais modelos desativados
        também devem voltar a ficar ativos.
      </p>

      {carregandoModelos ? (
        <p className="empty-state">Carregando modelos...</p>
      ) : modelosInativos.length > 0 ? (
        <div className="lista-selecao">
          <label className="lista-selecao-item lista-selecao-todos">
            <input type="checkbox" checked={todosSelecionados} onChange={toggleTodos} />
            Selecionar todos ({modelosInativos.length})
          </label>
          {modelosInativos.map((m) => (
            <label key={m.IdModelo} className="lista-selecao-item">
              <input
                type="checkbox"
                checked={selecionados.includes(m.IdModelo)}
                onChange={() => toggleUm(m.IdModelo)}
              />
              {m.Modelo}
            </label>
          ))}
        </div>
      ) : (
        <p className="empty-state">Esta montadora não tem modelos desativados.</p>
      )}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={salvando}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onConfirm([])}
          disabled={salvando || carregandoModelos}
        >
          Só a montadora
        </button>
        {modelosInativos.length > 0 && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onConfirm(selecionados)}
            disabled={salvando || carregandoModelos || selecionados.length === 0}
          >
            {salvando ? 'Reativando...' : `Reativar selecionados (${selecionados.length})`}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default ReativarMontadoraModal;