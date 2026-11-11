import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

/*
  Usa o <dialog> nativo do navegador, que já resolve:
  Esc para fechar, foco preso dentro do diálogo e fundo bloqueado.
  Normalmente não é usado direto: use o hook useConfirm().
*/
const ConfirmDialog = ({
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  perigo = false,
  onResponder,
}) => {
  const dialogRef = useRef(null);
  const cancelarRef = useRef(null);
  const confirmarRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const focoAnterior = document.activeElement;
    if (!dialog.open) dialog.showModal();
    // Em ação perigosa o foco começa no Cancelar (Enter não apaga nada sem querer)
    (perigo ? cancelarRef : confirmarRef).current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      // Devolve o foco para onde estava (ex.: campo dentro de um Drawer),
      // só se o diálogo saiu mesmo da tela (o StrictMode remonta na hora)
      setTimeout(() => {
        if (!dialog.isConnected && focoAnterior?.isConnected) focoAnterior.focus();
      });
    };
  }, [perigo]);

  return (
    <dialog
      ref={dialogRef}
      className="confirmar"
      aria-labelledby="confirmar-titulo"
      aria-describedby={mensagem ? 'confirmar-mensagem' : undefined}
      onCancel={(e) => {
        // Esc
        e.preventDefault();
        onResponder(false);
      }}
      onClick={(e) => {
        // Clique no fundo escuro (fora da caixa)
        if (e.target === dialogRef.current) onResponder(false);
      }}
    >
      <div className="confirmar__cabecalho">
        {perigo && (
          <span className="confirmar__icone" aria-hidden="true">
            <AlertTriangle size={20} />
          </span>
        )}
        <div>
          <h2 id="confirmar-titulo" className="confirmar__titulo">{titulo}</h2>
          {mensagem && (
            <p id="confirmar-mensagem" className="confirmar__mensagem">{mensagem}</p>
          )}
        </div>
      </div>

      <div className="confirmar__acoes">
        <button ref={cancelarRef} type="button" className="btn-secondary" onClick={() => onResponder(false)}>
          {textoCancelar}
        </button>
        <button ref={confirmarRef} type="button" className="btn-primary" onClick={() => onResponder(true)}>
          {textoConfirmar}
        </button>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;