import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

/*
  Reativar uma montadora: por padrão só ela volta. Opcionalmente,
  escolhe quais modelos desativados voltam junto.
  (O backend não reativa os modelos automaticamente.)
*/
const ReativarMontadoraModal = ({ montadora, modelosInativos, onConfirm, onClose, salvando }) => {
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
      {modelosInativos.length > 0 ? (
        <>
          <p className="modal-texto">
            A montadora volta a aparecer no app. Escolha também quais modelos desativados devem voltar junto,
            ou reative só a montadora.
          </p>

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
        </>
      ) : (
        <p className="modal-texto">
          A montadora volta a aparecer no app. Ela não tem modelos desativados.
        </p>
      )}

      <div className="form-actions">
        <Button variante="secundario" onClick={onClose} disabled={salvando}>
          Cancelar
        </Button>
        {modelosInativos.length > 0 && (
          <Button variante="secundario" onClick={() => onConfirm([])} disabled={salvando}>
            Só a montadora
          </Button>
        )}
        <Button
          carregando={salvando}
          disabled={modelosInativos.length > 0 && selecionados.length === 0}
          onClick={() => onConfirm(modelosInativos.length > 0 ? selecionados : [])}
        >
          {modelosInativos.length === 0
            ? 'Reativar'
            : `Reativar com ${selecionados.length} ${selecionados.length === 1 ? 'modelo' : 'modelos'}`}
        </Button>
      </div>
    </Modal>
  );
};

export default ReativarMontadoraModal;