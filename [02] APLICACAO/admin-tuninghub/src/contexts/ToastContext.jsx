import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import '../components/ui/Toast.css';

/*
  Uso:
    const toast = useToast();
    toast.sucesso('Modelo salvo.');
    toast.erro(mensagemErro(error));
    toast.sucesso('Modelo desativado.', {
      acao: { rotulo: 'Desfazer', onClick: () => reativarModelo(id) },
    });
  Opções: { acao, duracao } (duração em ms; padrão 4s, ou 6s quando tem ação)
*/

const ToastContext = createContext(null);

const DURACAO_PADRAO = 4000;
const DURACAO_COM_ACAO = 6000;
const MAX_TOASTS = 3;

const ICONES = {
  sucesso: CheckCircle2,
  erro: AlertCircle,
  aviso: AlertTriangle,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const proximoId = useRef(0);

  const fechar = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((lista) => lista.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (mensagem, tipo = 'info', { acao, duracao } = {}) => {
      proximoId.current += 1;
      const id = proximoId.current;

      // Mantém no máximo 3 na tela (os mais antigos saem)
      setToasts((lista) => [...lista, { id, mensagem, tipo, acao }].slice(-MAX_TOASTS));

      const tempo = duracao ?? (acao ? DURACAO_COM_ACAO : DURACAO_PADRAO);
      timers.current.set(id, setTimeout(() => fechar(id), tempo));
      return id;
    },
    [fechar]
  );

  const valor = useMemo(
    () => ({
      mostrar,
      fechar,
      sucesso: (msg, opcoes) => mostrar(msg, 'sucesso', opcoes),
      erro: (msg, opcoes) => mostrar(msg, 'erro', opcoes),
      aviso: (msg, opcoes) => mostrar(msg, 'aviso', opcoes),
      info: (msg, opcoes) => mostrar(msg, 'info', opcoes),
    }),
    [mostrar, fechar]
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}

      <div className="toast-regiao" aria-live="polite">
        {toasts.map((t) => {
          const Icone = ICONES[t.tipo] || Info;
          return (
            <div key={t.id} className={`toast toast--${t.tipo}`} role={t.tipo === 'erro' ? 'alert' : 'status'}>
              <Icone className="toast__icone" size={18} aria-hidden="true" />
              <span className="toast__mensagem">{t.mensagem}</span>

              {t.acao && (
                <button
                  type="button"
                  className="toast__acao"
                  onClick={() => {
                    t.acao.onClick();
                    fechar(t.id);
                  }}
                >
                  {t.acao.rotulo}
                </button>
              )}

              <button
                type="button"
                className="toast__fechar"
                onClick={() => fechar(t.id)}
                aria-label="Fechar aviso"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  return ctx;
};