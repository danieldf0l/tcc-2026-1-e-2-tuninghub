import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/*
  Guarda filtros na query string (?busca=golf&status=ativos&pagina=2),
  para o F5 e o "voltar" não perderem o filtro.

  const [filtros, setFiltros] = useFiltrosUrl({ busca: '', status: 'todos', pagina: '1' });
  filtros.busca                                  // sempre string
  Number(filtros.pagina)
  setFiltros({ status: 'ativos', pagina: '1' }) // junta com os atuais

  Valores iguais ao padrão saem da URL, para ela ficar limpa.
  Usa "replace": mexer no filtro não enche o histórico do navegador.
*/
export const useFiltrosUrl = (padroes) => {
  const [padroesFixos] = useState(padroes);
  const [params, setParams] = useSearchParams();

  const filtros = useMemo(() => {
    const atual = {};
    for (const [chave, padrao] of Object.entries(padroesFixos)) {
      atual[chave] = params.get(chave) ?? padrao;
    }
    return atual;
  }, [params, padroesFixos]);

  const setFiltros = useCallback(
    (novos) => {
      setParams(
        (atuais) => {
          const proximos = new URLSearchParams(atuais);
          for (const [chave, valor] of Object.entries(novos)) {
            const texto = valor == null ? '' : String(valor);
            if (texto === '' || texto === String(padroesFixos[chave] ?? '')) proximos.delete(chave);
            else proximos.set(chave, texto);
          }
          return proximos;
        },
        { replace: true }
      );
    },
    [setParams, padroesFixos]
  );

  return [filtros, setFiltros];
};