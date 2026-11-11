import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFiltrosUrl } from './useFiltrosUrl';
import { useDebounce } from './useDebounce';
import { ordenarDados } from '../utils/ordenarDados';
import { mensagemErro } from '../utils/erroApi';
import { normalizar } from '../utils/texto';

/*
  Tudo que uma tela de catálogo repete: carregar, buscar (com debounce),
  filtrar por status, ordenar e paginar, com os filtros guardados na URL.

  const lista = useListaCatalogo({
    carregar,                          // () => Promise<array>  (use useCallback ou função fora do componente)
    filtrar: (item, { termo }) => contem(item.Nome, termo),   // função fora do componente
    colunas: COLUNAS,                  // as mesmas da DataTable (para ordenar)
    ordenacaoPadrao: { chave: 'Nome', direcao: 'asc' },
    porPagina: 10,
    filtrosExtras: { montadora: '' },  // outros filtros que também vão para a URL
  });
*/
export const useListaCatalogo = ({
  carregar,
  filtrar,
  colunas,
  ordenacaoPadrao,
  porPagina = 10,
  filtrosExtras = {},
}) => {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [padroes] = useState(() => ({
    busca: '',
    status: 'todos',
    pagina: '1',
    ordem: `${ordenacaoPadrao.chave}:${ordenacaoPadrao.direcao}`,
    ...filtrosExtras,
  }));
  const [filtros, setFiltros] = useFiltrosUrl(padroes);

  // ---------- Busca com debounce ----------
  const [busca, setBusca] = useState(filtros.busca);
  const buscaAdiada = useDebounce(busca, 300);
  const ultimaBuscaRef = useRef(buscaAdiada);

  useEffect(() => {
    if (buscaAdiada === ultimaBuscaRef.current) return;
    ultimaBuscaRef.current = buscaAdiada;
    setFiltros({ busca: buscaAdiada, pagina: '1' });
  }, [buscaAdiada, setFiltros]);

  // ---------- Carregamento ----------
  // Recarrega sem apagar a lista da tela (usado depois de salvar/desativar)
  const recarregar = useCallback(
    () =>
      carregar()
        .then((dados) => {
          setItens(dados);
          setErro('');
        })
        .catch((error) => setErro(mensagemErro(error, 'Não foi possível carregar a lista.')))
        .finally(() => setCarregando(false)),
    [carregar]
  );

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const tentarNovamente = () => {
    setCarregando(true);
    setErro('');
    recarregar();
  };

  // ---------- Filtro, ordenação e paginação ----------
  const [chaveOrdem, direcaoOrdem] = filtros.ordem.split(':');
  const ordenacao = { chave: chaveOrdem, direcao: direcaoOrdem === 'desc' ? 'desc' : 'asc' };
  const setOrdenacao = (nova) => setFiltros({ ordem: `${nova.chave}:${nova.direcao}`, pagina: '1' });

  const filtrados = useMemo(() => {
    const termo = normalizar(filtros.busca);
    return itens.filter((item) => {
      const passaStatus =
        filtros.status === 'todos' ? true : filtros.status === 'ativos' ? !!item.Ativo : !item.Ativo;
      return passaStatus && filtrar(item, { ...filtros, termo });
    });
  }, [itens, filtros, filtrar]);

  const ordenados = ordenarDados(filtrados, colunas, ordenacao);
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / porPagina));
  const pagina = Math.min(Math.max(Number(filtros.pagina) || 1, 1), totalPaginas);
  const itensPagina = ordenados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const filtrosAtivos =
    filtros.busca !== '' ||
    filtros.status !== 'todos' ||
    Object.keys(filtrosExtras).some((chave) => filtros[chave] !== padroes[chave]);

  const mudarFiltro = (chave, valor) => setFiltros({ [chave]: valor, pagina: '1' });

  const limparFiltros = () => {
    setBusca('');
    setFiltros({ busca: '', status: 'todos', pagina: '1', ...filtrosExtras });
  };

  return {
    itens,
    carregando,
    erro,
    recarregar,
    tentarNovamente,
    filtros,
    mudarFiltro,
    busca,
    setBusca,
    ordenacao,
    setOrdenacao,
    itensPagina,
    totalFiltrados: filtrados.length,
    pagina,
    totalPaginas,
    porPagina,
    irParaPagina: (p) => setFiltros({ pagina: p }),
    filtrosAtivos,
    limparFiltros,
  };
};