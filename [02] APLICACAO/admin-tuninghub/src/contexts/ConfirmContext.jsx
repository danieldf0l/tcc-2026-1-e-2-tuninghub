import { createContext, useCallback, useContext, useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

/*
  Substitui o window.confirm. Devolve uma Promise<boolean>.

  Uso:
    const confirmar = useConfirm();
    const ok = await confirmar({
      titulo: 'Desativar montadora?',
      mensagem: 'Todos os modelos dela também serão desativados.',
      textoConfirmar: 'Desativar',
      perigo: true,
    });
    if (!ok) return;
*/

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [pedido, setPedido] = useState(null);

  const confirmar = useCallback(
    (opcoes) => new Promise((resolve) => setPedido({ ...opcoes, resolve })),
    []
  );

  const responder = (resultado) => {
    pedido?.resolve(resultado);
    setPedido(null);
  };

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {pedido && (
        <ConfirmDialog
          titulo={pedido.titulo}
          mensagem={pedido.mensagem}
          textoConfirmar={pedido.textoConfirmar}
          textoCancelar={pedido.textoCancelar}
          perigo={pedido.perigo}
          onResponder={responder}
        />
      )}
    </ConfirmContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm precisa estar dentro de <ConfirmProvider>.');
  return ctx;
};