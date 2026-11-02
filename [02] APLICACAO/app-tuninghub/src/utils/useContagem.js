import { useCallback, useEffect, useState } from 'react';

// Contagem regressiva em segundos (usada no botão "Reenviar código")
export function useContagem(inicial = 60) {
  const [restante, setRestante] = useState(inicial);

  useEffect(() => {
    if (restante <= 0) return;
    const id = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [restante]);

  const reiniciar = useCallback(() => setRestante(inicial), [inicial]);

  return { restante, reiniciar };
}