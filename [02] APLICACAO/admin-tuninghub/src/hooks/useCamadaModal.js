import { useCallback, useEffect, useRef, useState } from 'react';

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/*
  Comportamento comum de Drawer e Modal:
  - trava a rolagem da página por trás
  - leva o foco para dentro ao abrir e devolve ao elemento de origem ao fechar
  - Esc fecha; Tab e Shift+Tab ficam presos dentro da camada
  Uso: const aoTeclar = useCamadaModal(painelRef, onFechar);  <div ref={painelRef} onKeyDown={aoTeclar}>
*/
export const useCamadaModal = (painelRef, onFechar) => {
  const onFecharRef = useRef(onFechar);
  // Guardado na primeira renderização, antes de um campo com autoFocus pegar o foco
  const [focoAnterior] = useState(() => document.activeElement);

  useEffect(() => {
    onFecharRef.current = onFechar;
  });

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Se nenhum campo com autoFocus já pegou o foco, foca o próprio painel
    const painel = painelRef.current;
    if (painel && !painel.contains(document.activeElement)) painel.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
      // Só devolve o foco se a camada saiu mesmo da tela
      // (no StrictMode do "npm run dev" o React desmonta e monta de novo na hora)
      setTimeout(() => {
        if (!painel?.isConnected && focoAnterior?.isConnected) focoAnterior.focus();
      });
    };
  }, [painelRef, focoAnterior]);

  return useCallback(
    (e) => {
      if (e.key === 'Escape') {
        // preventDefault evita que o mesmo Esc feche um diálogo aberto pelo onFechar
        e.preventDefault();
        e.stopPropagation();
        onFecharRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const painel = painelRef.current;
      const focaveis = [...painel.querySelectorAll(SELETOR_FOCAVEL)].filter(
        (el) => el.offsetParent !== null
      );
      if (focaveis.length === 0) {
        e.preventDefault();
        return;
      }

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const atual = document.activeElement;

      if (e.shiftKey && (atual === primeiro || atual === painel)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && atual === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    },
    [painelRef]
  );
};