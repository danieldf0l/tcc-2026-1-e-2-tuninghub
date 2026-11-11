import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { useCamadaModal } from '../../hooks/useCamadaModal';
import './Modal.css';

/*
  Mesmo uso de antes (as telas atuais não mudam):
    {modalAberto && (
      <Modal title="Novo modelo" onClose={() => setModalAberto(false)} wide>
        <form onSubmit={salvar}>...</form>
      </Modal>
    )}

  Agora também:
  - Esc fecha; Tab fica preso dentro; o foco volta ao botão que abriu
  - Enter envia o formulário (comportamento nativo do <form>)
  - a página por trás não rola
  - clicar fora fecha (só se o clique começar fora: arrastar uma seleção
    de texto de dentro para fora não fecha)
*/
const Modal = ({ title, onClose, children, wide = false }) => {
  const painelRef = useRef(null);
  const aoTeclar = useCamadaModal(painelRef, onClose);
  const idTitulo = useId();

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={painelRef}
        className={`modal-content${wide ? ' modal-content-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onKeyDown={aoTeclar}
      >
        <div className="modal-header">
          <h2 id={idTitulo}>{title}</h2>
          <IconButton icone={X} rotulo="Fechar" tamanho="sm" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;