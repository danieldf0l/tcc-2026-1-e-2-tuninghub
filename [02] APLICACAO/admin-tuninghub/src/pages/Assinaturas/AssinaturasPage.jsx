import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Store } from 'lucide-react';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { contem, normalizar } from '../../utils/texto';
import { diasAte, formatarData } from '../../utils/formatadores';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import BarraFiltros, { FiltroSelect } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { listarAssinaturasAdmin } from '../../api/assinaturaService';
import './Assinaturas.css';

const DIAS_ALERTA = 7;

// Assinatura ativa que vence nos próximos 7 dias (inclui hoje)
const vencendo = (a) => {
  if (a.Status !== 'ATIVA' || !a.DataFim) return false;
  const dias = diasAte(a.DataFim);
  return dias >= 0 && dias <= DIAS_ALERTA;
};

const SITUACOES = [
  { valor: '', rotulo: 'Todas' },
  { valor: 'ATIVA', rotulo: 'Ativas' },
  { valor: 'vencendo', rotulo: `Vencendo em ${DIAS_ALERTA} dias` },
  { valor: 'PENDENTE', rotulo: 'Pendentes' },
  { valor: 'EXPIRADA', rotulo: 'Expiradas' },
  { valor: 'CANCELADA', rotulo: 'Canceladas' },
];

const passaSituacao = (a, situacao) => {
  if (!situacao) return true;
  if (situacao === 'vencendo') return vencendo(a);
  return a.Status === situacao;
};

const tempo = (data) => (data ? new Date(data).getTime() : null);

const notaVencimento = (a) => {
  if (a.Status === 'PENDENTE') return { texto: 'Aguardando pagamento' };
  if (a.Status !== 'ATIVA') return null;
  if (!a.DataFim) return { texto: 'Sem vencimento' };
  const dias = diasAte(a.DataFim);
  if (dias < 0) return null;
  if (dias === 0) return { texto: 'Vence hoje', aviso: true };
  return { texto: `em ${dias} ${dias === 1 ? 'dia' : 'dias'}`, aviso: dias <= DIAS_ALERTA };
};

const COLUNAS = [
  {
    chave: 'NomeOficina',
    titulo: 'Oficina',
    render: (a) => <span className="celula-dupla__principal">{a.NomeOficina}</span>,
  },
  { chave: 'NomePlano', titulo: 'Plano' },
  {
    chave: 'DataInicio',
    titulo: 'Início',
    largura: '130px',
    valorOrdenacao: (a) => tempo(a.DataInicio),
    render: (a) => formatarData(a.DataInicio),
  },
  {
    chave: 'DataFim',
    titulo: 'Vencimento',
    largura: '170px',
    valorOrdenacao: (a) => tempo(a.DataFim),
    render: (a) => {
      const nota = notaVencimento(a);
      return (
        <>
          {formatarData(a.DataFim)}
          {nota && <span className={`celula-nota${nota.aviso ? ' celula-nota--aviso' : ''}`}>{nota.texto}</span>}
        </>
      );
    },
  },
  {
    chave: 'Status',
    titulo: 'Status',
    largura: '130px',
    render: (a) => <StatusBadge status={a.Status} />,
  },
];

// Busca pelo nome da oficina + filtros de plano e situação
const filtrar = (a, { termo, plano, situacao }) =>
  contem(a.NomeOficina, termo) && (!plano || a.NomePlano === plano) && passaSituacao(a, situacao);

// Assinaturas são somente leitura: o ciclo de pagamento é da oficina (checkout)
const AssinaturasPage = () => {
  const navigate = useNavigate();

  const lista = useListaCatalogo({
    carregar: listarAssinaturasAdmin,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'DataInicio', direcao: 'desc' },
    porPagina: 20,
    filtrosExtras: { plano: '', situacao: '' },
  });

  const { busca, plano } = lista.filtros;

  // Planos que aparecem nas assinaturas (para o select)
  const planos = useMemo(
    () => [...new Set(lista.itens.map((a) => a.NomePlano).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [lista.itens]
  );

  // Contadores das situações, respeitando a busca e o plano escolhidos
  const contagens = useMemo(() => {
    const termo = normalizar(busca);
    const base = lista.itens.filter((a) => filtrar(a, { termo, plano, situacao: '' }));
    return Object.fromEntries(SITUACOES.map((s) => [s.valor, base.filter((a) => passaSituacao(a, s.valor)).length]));
  }, [lista.itens, busca, plano]);

  const abrirOficina = (a) => {
    if (a.IdOficina) navigate(`/oficinas?oficina=${a.IdOficina}`);
  };

  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={10} colunas={5} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    if (lista.itens.length === 0) {
      return (
        <EmptyState
          icone={Receipt}
          titulo="Nenhuma assinatura ainda"
          descricao="As assinaturas aparecem aqui quando uma oficina escolhe um plano no app."
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Assinaturas"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdAssinatura"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={abrirOficina}
          linhaInativa={(a) => a.Status === 'EXPIRADA' || a.Status === 'CANCELADA'}
          acoes={(a) => [{ rotulo: 'Ver oficina', icone: Store, onClick: () => abrirOficina(a), oculto: !a.IdOficina }]}
          vazio={
            <EmptyState
              icone={Receipt}
              titulo="Nenhuma assinatura encontrada"
              descricao="Tente outra busca ou mude os filtros."
              acao={
                <Button variante="secundario" onClick={lista.limparFiltros}>
                  Limpar filtros
                </Button>
              }
            />
          }
        />
        <Pagination
          paginaAtual={lista.pagina}
          totalPaginas={lista.totalPaginas}
          onChange={lista.irParaPagina}
          totalItens={lista.totalFiltrados}
          porPagina={lista.porPagina}
          rotuloItens="assinaturas"
        />
      </>
    );
  };

  return (
    <div>
      <PageHeader
        titulo="Assinaturas"
        subtitulo="Planos contratados pelas oficinas. Clique numa linha para abrir a oficina."
      />

      {!lista.carregando && lista.itens.length > 0 && (
        <div className="filtro-situacao" role="group" aria-label="Filtrar por situação">
          {SITUACOES.map((s) => {
            const ativo = lista.filtros.situacao === s.valor;
            return (
              <button
                key={s.valor || 'todas'}
                type="button"
                className={`filtro-situacao__chip${ativo ? ' filtro-situacao__chip--ativo' : ''}${
                  s.valor === 'vencendo' && contagens.vencendo > 0 ? ' filtro-situacao__chip--alerta' : ''
                }`}
                aria-pressed={ativo}
                onClick={() => lista.mudarFiltro('situacao', s.valor)}
              >
                {s.rotulo}
                <span className="filtro-situacao__contador">{contagens[s.valor]}</span>
              </button>
            );
          })}
        </div>
      )}

      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar por oficina..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
      >
        <FiltroSelect rotulo="Plano" valor={lista.filtros.plano} onChange={(v) => lista.mudarFiltro('plano', v)}>
          <option value="">Todos os planos</option>
          {planos.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </FiltroSelect>
      </BarraFiltros>

      {renderConteudo()}
    </div>
  );
};

export default AssinaturasPage;