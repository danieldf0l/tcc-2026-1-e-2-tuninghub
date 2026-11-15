import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronsDownUp, ChevronsUpDown, ListChecks, Minus, Palette, Search, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useFiltrosUrl } from '../../hooks/useFiltrosUrl';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
import { useAlteracoesNaoSalvas } from '../../hooks/useAlteracoesNaoSalvas';
import { mensagemErro } from '../../utils/erroApi';
import { contem, normalizar } from '../../utils/texto';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Campo';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Aviso from '../../components/ui/Aviso';
import { listarEstilosAtivos } from '../../api/estiloService';
import { listarServicosAdmin } from '../../api/servicoService';
import {
  listarKitDoEstilo,
  vincularServicoAoEstilo,
  desvincularServicoDoEstilo,
} from '../../api/estiloServicoSugeridoService';
import './Estilos.css';

/*
  Kit de serviços com rascunho:
  - as marcações ficam só na tela até clicar em "Salvar kit" (ou Ctrl+S)
  - categorias recolhíveis, com "marcar a categoria inteira"
  - resumo do kit no topo (o que entra, o que sai)
  - "Adicionar do kit de outro estilo" para não montar do zero
  - trocar de estilo ou de aba com alterações pergunta antes de descartar
*/

const VISOES = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'no-kit', rotulo: 'No kit' },
  { id: 'fora', rotulo: 'Fora do kit' },
];

// Estilos ativos, serviços ativos e o kit salvo de cada estilo
const buscarDados = async () => {
  const [estilos, servicos] = await Promise.all([listarEstilosAtivos(), listarServicosAdmin()]);
  const kits = await Promise.all(estilos.map((e) => listarKitDoEstilo(e.Codigo)));
  const kitsPorEstilo = {};
  estilos.forEach((e, i) => {
    kitsPorEstilo[e.Codigo] = kits[i].map((s) => s.IdServico);
  });
  return { estilos, servicos, kitsPorEstilo };
};

// Checkbox da categoria: marcado, desmarcado ou parcial (traço)
const CheckboxCategoria = ({ estado, onChange, rotulo }) => (
  <span className="kit__marca-wrapper">
    <input
      type="checkbox"
      className="kit__checkbox"
      checked={estado === 'todos'}
      ref={(el) => {
        if (el) el.indeterminate = estado === 'parcial';
      }}
      onChange={onChange}
      aria-label={rotulo}
    />
    <span className={`kit__marca${estado !== 'nenhum' ? ' kit__marca--ligada' : ''}`} aria-hidden="true">
      {estado === 'todos' && <Check size={14} />}
      {estado === 'parcial' && <Minus size={14} />}
    </span>
  </span>
);

const KitServicosTab = ({ onSujoChange }) => {
  const toast = useToast();
  const podeDescartar = useConfirmarDescarte();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtros, setFiltros] = useFiltrosUrl({ estilo: '', ver: 'todos', categoria: '' });

  // Rascunho do estilo em edição: { codigo, ids }. Enquanto for null, vale o que está salvo.
  const [rascunho, setRascunho] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [abertas, setAbertas] = useState([]); // categorias expandidas

  const aplicar = useCallback((promessa) => {
    promessa
      .then((novos) => {
        setDados(novos);
        setErro('');
      })
      .catch((error) => setErro(mensagemErro(error, 'Não foi possível carregar os kits.')));
  }, []);

  useEffect(() => {
    aplicar(buscarDados());
  }, [aplicar]);

  // ---------- Estilo atual, kit salvo e rascunho ----------
  const estiloAtual = useMemo(() => {
    if (!dados) return null;
    return dados.estilos.find((e) => e.Codigo === filtros.estilo) || dados.estilos[0] || null;
  }, [dados, filtros.estilo]);

  const salvos = useMemo(
    () => (estiloAtual ? dados.kitsPorEstilo[estiloAtual.Codigo] || [] : []),
    [dados, estiloAtual]
  );
  const selecionados = useMemo(
    () => (rascunho && estiloAtual && rascunho.codigo === estiloAtual.Codigo ? rascunho.ids : salvos),
    [rascunho, estiloAtual, salvos]
  );

  const adicionados = selecionados.filter((id) => !salvos.includes(id));
  const removidos = salvos.filter((id) => !selecionados.includes(id));
  const sujo = adicionados.length > 0 || removidos.length > 0;

  useAlteracoesNaoSalvas(sujo);

  // Avisa a página (para perguntar antes de trocar de aba)
  useEffect(() => {
    onSujoChange?.(sujo);
  }, [sujo, onSujoChange]);
  useEffect(() => () => onSujoChange?.(false), [onSujoChange]);

  const definirSelecao = (ids) => setRascunho({ codigo: estiloAtual.Codigo, ids });

  const alternar = (idServico) =>
    definirSelecao(
      selecionados.includes(idServico)
        ? selecionados.filter((id) => id !== idServico)
        : [...selecionados, idServico]
    );

  // ---------- Serviços ativos, filtros e grupos ----------
  const servicosAtivos = useMemo(() => (dados ? dados.servicos.filter((s) => s.Ativo) : []), [dados]);
  const servicoPorId = useMemo(() => new Map((dados?.servicos || []).map((s) => [s.IdServico, s])), [dados]);

  const categorias = useMemo(
    () => [...new Set(servicosAtivos.map((s) => s.Categoria))].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR')),
    [servicosAtivos]
  );

  const termo = normalizar(busca);
  const grupos = useMemo(() => {
    const mapa = new Map();
    servicosAtivos
      .filter((s) => contem(s.Nome, termo) || contem(s.Descricao, termo) || contem(s.Categoria, termo))
      .filter((s) => !filtros.categoria || s.Categoria === filtros.categoria)
      .filter((s) => {
        if (filtros.ver === 'no-kit') return selecionados.includes(s.IdServico);
        if (filtros.ver === 'fora') return !selecionados.includes(s.IdServico);
        return true;
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome, 'pt-BR'))
      .forEach((s) => {
        if (!mapa.has(s.Categoria)) mapa.set(s.Categoria, []);
        mapa.get(s.Categoria).push(s);
      });
    return [...mapa.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'pt-BR'));
  }, [servicosAtivos, termo, filtros.categoria, filtros.ver, selecionados]);

  // Com busca ou filtro, tudo aparece aberto; sem filtro, abre só o que o admin escolheu
  const filtrando = termo !== '' || filtros.ver !== 'todos' || filtros.categoria !== '';
  const estaAberta = (categoria) => filtrando || abertas.includes(categoria);
  const alternarCategoria = (categoria) =>
    setAbertas((atual) => (atual.includes(categoria) ? atual.filter((c) => c !== categoria) : [...atual, categoria]));

  const marcarCategoria = (servicos) => {
    const ids = servicos.map((s) => s.IdServico);
    const todos = ids.every((id) => selecionados.includes(id));
    definirSelecao(todos ? selecionados.filter((id) => !ids.includes(id)) : [...new Set([...selecionados, ...ids])]);
  };

  // Serviços inativos no kit: não aparecem na lista nem entram em projetos novos
  const inativosNoKit = selecionados.filter((id) => !servicosAtivos.some((s) => s.IdServico === id)).length;

  // ---------- Trocar de estilo / importar / salvar ----------
  const trocarEstilo = async (codigo) => {
    if (codigo === estiloAtual.Codigo) return;
    if (!(await podeDescartar(sujo))) return;
    setRascunho(null);
    setFiltros({ estilo: codigo });
  };

  const importarDe = (codigo) => {
    if (!codigo) return;
    const origem = dados.estilos.find((e) => e.Codigo === codigo);
    const ids = dados.kitsPorEstilo[codigo] || [];
    const novos = ids.filter((id) => !selecionados.includes(id));
    definirSelecao([...selecionados, ...novos]);
    if (novos.length === 0) toast.info(`Todos os serviços do kit "${origem.Nome}" já estão aqui.`);
    else toast.info(`${novos.length} ${novos.length === 1 ? 'serviço adicionado' : 'serviços adicionados'} do kit "${origem.Nome}". Revise e salve.`);
  };

  const descartar = () => setRascunho(null);

  const salvar = useCallback(async () => {
    if (!sujo || salvando) return;
    const codigo = estiloAtual.Codigo;
    setSalvando(true);

    const operacoes = [
      ...adicionados.map((id) => ({ id, incluir: true, chamada: () => vincularServicoAoEstilo(codigo, id) })),
      ...removidos.map((id) => ({ id, incluir: false, chamada: () => desvincularServicoDoEstilo(codigo, id) })),
    ];
    const resultados = await Promise.allSettled(operacoes.map((op) => op.chamada()));

    // O que deu certo passa a ser o kit salvo; o que falhou continua pendente no rascunho
    let novoSalvo = [...salvos];
    const falhas = [];
    resultados.forEach((r, i) => {
      const op = operacoes[i];
      if (r.status === 'fulfilled') {
        novoSalvo = op.incluir ? [...novoSalvo, op.id] : novoSalvo.filter((id) => id !== op.id);
      } else {
        falhas.push(r.reason);
      }
    });

    setDados((atual) => ({ ...atual, kitsPorEstilo: { ...atual.kitsPorEstilo, [codigo]: novoSalvo } }));
    setSalvando(false);

    if (falhas.length === 0) {
      setRascunho(null);
      toast.sucesso(`Kit do estilo "${estiloAtual.Nome}" salvo.`);
    } else {
      toast.erro(
        `${falhas.length} de ${operacoes.length} alterações não foram salvas: ${mensagemErro(falhas[0], 'tente de novo.')}`
      );
    }
  }, [sujo, salvando, estiloAtual, adicionados, removidos, salvos, toast]);

  // Ctrl+S (ou Cmd+S) salva o kit
  useEffect(() => {
    const aoTeclar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        salvar();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [salvar]);

  // ---------- Estados da tela ----------
  if (erro && !dados) {
    return (
      <ErrorState
        descricao={erro}
        onTentarNovamente={() => {
          setErro('');
          aplicar(buscarDados());
        }}
      />
    );
  }

  if (!dados) {
    return (
      <div className="kit">
        <div className="kit__estilos">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} altura={44} raio="var(--radius-md)" />
          ))}
        </div>
        <div className="kit__painel">
          <Skeleton largura="40%" altura={18} />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} altura={44} raio="var(--radius-md)" />
          ))}
        </div>
      </div>
    );
  }

  if (dados.estilos.length === 0) {
    return (
      <EmptyState
        icone={Palette}
        titulo="Nenhum estilo ativo"
        descricao="Cadastre ou reative um estilo na aba Estilos para montar o kit de serviços dele."
      />
    );
  }

  const outrosEstilos = dados.estilos.filter(
    (e) => e.Codigo !== estiloAtual.Codigo && (dados.kitsPorEstilo[e.Codigo] || []).length > 0
  );

  // Resumo: o que está no kit (novos marcados) + o que vai sair
  const resumo = [
    ...selecionados
      .map((id) => servicoPorId.get(id))
      .filter(Boolean)
      .sort((a, b) => a.Nome.localeCompare(b.Nome, 'pt-BR')),
  ];
  const saindo = removidos.map((id) => servicoPorId.get(id)).filter(Boolean);

  return (
    <div className="kit">
      {/* ---------- Estilos ---------- */}
      <nav className="kit__estilos" aria-label="Estilos">
        {dados.estilos.map((e) => {
          const ativo = e.Codigo === estiloAtual.Codigo;
          const total = ativo ? selecionados.length : (dados.kitsPorEstilo[e.Codigo] || []).length;
          return (
            <button
              key={e.Codigo}
              type="button"
              className={`kit__estilo${ativo ? ' kit__estilo--ativo' : ''}`}
              aria-current={ativo ? 'true' : undefined}
              onClick={() => trocarEstilo(e.Codigo)}
            >
              <span className="kit__estilo-nome">
                {e.Nome}
                {ativo && sujo && <span className="kit__ponto-alteracao" title="Alterações não salvas" />}
              </span>
              <span className="kit__estilo-total">{total}</span>
            </button>
          );
        })}
      </nav>

      {/* ---------- Painel do estilo ---------- */}
      <section className="kit__painel" aria-label={`Kit do estilo ${estiloAtual.Nome}`}>
        <div className="kit__cabecalho">
          <div>
            <h2 className="kit__titulo">{estiloAtual.Nome}</h2>
            <p className="kit__subtitulo">
              Serviços que entram automaticamente na To-do List de quem escolher este estilo.
            </p>
          </div>
          {outrosEstilos.length > 0 && (
            <div className="kit__importar">
              <Select
                aria-label="Adicionar serviços do kit de outro estilo"
                value=""
                onChange={(e) => importarDe(e.target.value)}
                semMargem
              >
                <option value="">Adicionar do kit de...</option>
                {outrosEstilos.map((e) => (
                  <option key={e.Codigo} value={e.Codigo}>
                    {e.Nome} ({(dados.kitsPorEstilo[e.Codigo] || []).length})
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* ---------- Resumo ---------- */}
        <div className="kit__resumo">
          <p className="kit__resumo-titulo">
            No kit: <strong>{selecionados.length}</strong> {selecionados.length === 1 ? 'serviço' : 'serviços'}
            {sujo && (
              <span className="kit__resumo-diff">
                {adicionados.length > 0 && <span className="kit__diff kit__diff--mais">+{adicionados.length}</span>}
                {removidos.length > 0 && <span className="kit__diff kit__diff--menos">−{removidos.length}</span>}
              </span>
            )}
          </p>
          {resumo.length === 0 && saindo.length === 0 ? (
            <p className="kit__resumo-vazio">Nenhum serviço ainda. Marque abaixo ou adicione do kit de outro estilo.</p>
          ) : (
            <ul className="kit__chips">
              {resumo.map((s) => {
                const novo = adicionados.includes(s.IdServico);
                return (
                  <li key={s.IdServico} className={`kit__chip${novo ? ' kit__chip--novo' : ''}${s.Ativo ? '' : ' kit__chip--inativo'}`}>
                    <span>{s.Nome}</span>
                    {!s.Ativo && <span className="kit__chip-extra">inativo</span>}
                    <button type="button" onClick={() => alternar(s.IdServico)} aria-label={`Tirar ${s.Nome} do kit`}>
                      <X size={12} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
              {saindo.map((s) => (
                <li key={s.IdServico} className="kit__chip kit__chip--saindo">
                  <span>{s.Nome}</span>
                  <button type="button" onClick={() => alternar(s.IdServico)} aria-label={`Manter ${s.Nome} no kit`} title="Manter no kit">
                    <Check size={12} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {inativosNoKit > 0 && (
          <Aviso tom="info">
            {inativosNoKit === 1
              ? '1 serviço inativo está neste kit. Ele não entra em projetos novos enquanto estiver inativo.'
              : `${inativosNoKit} serviços inativos estão neste kit. Eles não entram em projetos novos enquanto estiverem inativos.`}
          </Aviso>
        )}

        {/* ---------- Filtros ---------- */}
        <div className="kit__filtros">
          <div className="kit__busca">
            <Input
              type="search"
              icone={Search}
              placeholder="Buscar serviço..."
              aria-label="Buscar serviço"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              semMargem
            />
          </div>
          <div className="kit__categoria-filtro">
            <Select
              aria-label="Categoria"
              value={filtros.categoria}
              onChange={(e) => setFiltros({ categoria: e.target.value })}
              semMargem
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="seletor-visao" role="group" aria-label="Mostrar">
            {VISOES.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`seletor-visao__opcao${filtros.ver === v.id ? ' seletor-visao__opcao--ativa' : ''}`}
                aria-pressed={filtros.ver === v.id}
                onClick={() => setFiltros({ ver: v.id })}
              >
                {v.rotulo}
              </button>
            ))}
          </div>
          {!filtrando && (
            <Button
              variante="fantasma"
              tamanho="sm"
              icone={abertas.length === categorias.length ? ChevronsDownUp : ChevronsUpDown}
              onClick={() => setAbertas(abertas.length === categorias.length ? [] : categorias)}
            >
              {abertas.length === categorias.length ? 'Recolher todas' : 'Expandir todas'}
            </Button>
          )}
        </div>

        {/* ---------- Categorias ---------- */}
        {servicosAtivos.length === 0 ? (
          <EmptyState
            compacto
            icone={ListChecks}
            titulo="Nenhum serviço ativo"
            descricao="Cadastre serviços na tela Serviços para montar os kits."
          />
        ) : grupos.length === 0 ? (
          <EmptyState compacto icone={Search} titulo="Nenhum serviço encontrado" descricao="Tente outra busca ou filtro." />
        ) : (
          <div className="kit__categorias">
            {grupos.map(([categoria, servicos]) => {
              const marcados = servicos.filter((s) => selecionados.includes(s.IdServico)).length;
              const estado = marcados === 0 ? 'nenhum' : marcados === servicos.length ? 'todos' : 'parcial';
              const aberta = estaAberta(categoria);
              return (
                <div key={categoria} className={`kit__grupo${aberta ? ' kit__grupo--aberto' : ''}`}>
                  <div className="kit__grupo-cabecalho">
                    <CheckboxCategoria
                      estado={estado}
                      onChange={() => marcarCategoria(servicos)}
                      rotulo={`${estado === 'todos' ? 'Desmarcar' : 'Marcar'} todos de ${categoria}`}
                    />
                    <button
                      type="button"
                      className="kit__grupo-botao"
                      aria-expanded={aberta}
                      onClick={() => alternarCategoria(categoria)}
                      disabled={filtrando}
                    >
                      <span className="kit__grupo-nome">{categoria}</span>
                      <span className="kit__grupo-total">
                        {marcados}/{servicos.length}
                      </span>
                      {!filtrando && <ChevronDown className="kit__grupo-seta" size={16} aria-hidden="true" />}
                    </button>
                  </div>

                  {aberta && (
                    <div className="kit__grupo-itens">
                      {servicos.map((s) => {
                        const marcado = selecionados.includes(s.IdServico);
                        const mudou = adicionados.includes(s.IdServico) || removidos.includes(s.IdServico);
                        return (
                          <label
                            key={s.IdServico}
                            className={`kit__servico${marcado ? ' kit__servico--marcado' : ''}${mudou ? ' kit__servico--alterado' : ''}`}
                          >
                            <span className="kit__marca-wrapper">
                              <input
                                type="checkbox"
                                className="kit__checkbox"
                                checked={marcado}
                                onChange={() => alternar(s.IdServico)}
                              />
                              <span className={`kit__marca${marcado ? ' kit__marca--ligada' : ''}`} aria-hidden="true">
                                {marcado && <Check size={14} />}
                              </span>
                            </span>
                            <span className="kit__servico-textos">
                              <span className="kit__servico-nome">{s.Nome}</span>
                              {s.Descricao && <span className="kit__servico-descricao">{s.Descricao}</span>}
                            </span>
                            {mudou && <span className="kit__servico-mudou">{marcado ? 'entra' : 'sai'}</span>}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ---------- Barra de salvar (fixa no rodapé enquanto houver alterações) ---------- */}
        {sujo && (
          <div className="kit__barra" role="region" aria-label="Alterações não salvas">
            <p className="kit__barra-texto">
              <strong>
                {adicionados.length + removidos.length}{' '}
                {adicionados.length + removidos.length === 1 ? 'alteração não salva' : 'alterações não salvas'}
              </strong>
              <span>
                {adicionados.length > 0 && ` · ${adicionados.length} ${adicionados.length === 1 ? 'entra' : 'entram'}`}
                {removidos.length > 0 && ` · ${removidos.length} ${removidos.length === 1 ? 'sai' : 'saem'}`}
              </span>
            </p>
            <div className="kit__barra-acoes">
              <Button variante="secundario" onClick={descartar} disabled={salvando}>
                Descartar
              </Button>
              <Button onClick={salvar} carregando={salvando} title="Atalho: Ctrl+S">
                Salvar kit
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default KitServicosTab;