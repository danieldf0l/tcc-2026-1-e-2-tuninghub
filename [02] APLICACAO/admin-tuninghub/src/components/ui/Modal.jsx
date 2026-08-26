import './Modal.css';

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className={`modal-content${wide ? ' modal-content-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">×</button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;