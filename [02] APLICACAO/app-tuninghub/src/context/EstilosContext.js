import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { listarEstilos } from '../api/estilo.api';

const EstilosContext = createContext(null);

export function EstilosProvider({ children }) {
  const [estilos, setEstilos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const lista = await listarEstilos();
      setEstilos(lista);
    } catch {
      // Mantém a última lista conhecida em caso de falha de rede
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  function getNomeEstilo(codigo) {
    const encontrado = estilos.find((e) => e.Codigo === codigo);
    return encontrado?.Nome || codigo || 'Personalizado';
  }

  return (
    <EstilosContext.Provider value={{ estilos, carregando, refetch, getNomeEstilo }}>
      {children}
    </EstilosContext.Provider>
  );
}

export function useEstilos() {
  const ctx = useContext(EstilosContext);
  if (!ctx) throw new Error('useEstilos precisa estar dentro de <EstilosProvider>');
  return ctx;
}