import { useEffect, useState } from 'react';

// Devolve o valor só depois que ele parar de mudar por "atraso" ms.
// Uso: const buscaAdiada = useDebounce(busca, 300);
export const useDebounce = (valor, atraso = 300) => {
  const [adiado, setAdiado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setAdiado(valor), atraso);
    return () => clearTimeout(timer);
  }, [valor, atraso]);

  return adiado;
};