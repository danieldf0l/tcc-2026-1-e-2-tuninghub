import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Power, RotateCcw, Store } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { mensagemErro } from '../../utils/erroApi';
import { contem } from '../../utils/texto';
import { formatarCnpj, formatarData, somenteDigitos } from '../../utils/formatadores';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import BarraFiltros, { FiltroSelect, FiltroStatus } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import OficinaDetalheDrawer from './OficinaDetalheDrawer';
import { listarOficinasAdmin, desativarOficina, reativarOficina } from '../../api/oficinaService';
import './Oficinas.css';

const COLUNAS = [
  {
    chave: 'NomeOficina',
    titulo: 'Oficina',
    render: (o) => (
      <div className="celula-dupla">
        <span className="celula-dupla__principal">{o.NomeOficina}</span>
        <span className="celula-dupla__secundario">{o.Email}</span>
      </div>
    ),
  },
  {
    chave: 'CNPJ',
    titulo: 'CNPJ',
    render: (o) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatarCnpj(o.CNPJ)}</span>,
  },
  {
    chave: 'FaixaPreco',
    titulo: 'Faixa',
    valorOrdenacao: (o) => (o.FaixaPreco ? o.FaixaPreco.length : null),
    render: (o) => (o.FaixaPreco ? <Badge>{o.FaixaPreco}</Badge> : <span style={{ color: 'var(--text-secondary)' }}>—</span>),
  },
  {
    chave: 'DataCriacao',
    titulo: 'Cadastro',
    valorOrdenacao: (o) => (o.DataCriacao ? new Date(o.DataCriacao).getTime() : null),
    render: (o) => formatarData(o.DataCriacao),
  },
  {
    chave: 'Ativo',
    titulo: 'Status',
    valorOrdenacao: (o) => (o.Ativo ? 1 : 0),
    render: (o) => <StatusBadge status={o.Ativo ? 'ativa' : 'inativa'} />,
  },
];

// Busca por nome, e-mail, proprietário ou CNPJ (com ou sem pontuação)
const filtrar = (o, { termo, busca, faixa }) => {
  const digitos = somenteDigitos(busca);
  const passaBusca =
    contem(o.NomeOficina, termo) ||
    contem(o.Email, termo) ||
    contem(o.NomeProprietario, termo) ||
    (digitos.length >= 3 && somenteDigitos(o.CNPJ).includes(digitos));
  const passaFaixa = !faixa || (faixa === 'sem' ? !o.FaixaPreco : o.FaixaPreco === faixa);
  return passaBusca && passaFaixa;
};

const OficinasPage = () => {
  const toast = useToast();
  const confirmar = useConfirm();
  const [params, setParams] = useSearchParams();

  const lista = useListaCatalogo({
    carregar: listarOficinasAdmin,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'NomeOficina', direcao: 'asc' },
    porPagina: 15,
    filtrosExtras: { faixa: '' },
  });

  // ---------- Drawer de detalhe (fica na URL: ?oficina=12) ----------
  const idAberta = params.get('oficina');
  const oficinaAberta = useMemo(
    () => (idAberta ? lista.itens.find((o) => String(o.IdOficina) === idAberta) : null),
    [idAberta, lista.itens]
  );

  // Abrir entra no histórico (o "voltar" do navegador fecha o drawer)
  const abrirDetalhe = (oficina) =>
    setParams((atuais) => {
      const novos = new URLSearchParams(atuais);
      novos.set('oficina', String(oficina.IdOficina));
      return novos;
    });

  const fecharDetalhe = useCallback(
    () =>
      setParams(
        (atuais) => {
          const novos = new URLSearchParams(atuais);
          novos.delete('oficina');
          return novos;
        },
        { replace: true }
      ),
    [setParams]
  );

  // ---------- Desativar / reativar conta ----------
  const alternarStatus = async (oficina) => {
    if (oficina.Ativo) {
      const ok = await confirmar({
        titulo: `Desativar "${oficina.NomeOficina}"?`,
        mensagem: 'A oficina perde o acesso ao app na hora e some das buscas dos entusiastas. Dá para reativar depois.',
        textoConfirmar: 'Desativar conta',
        perigo: true,
      });
      if (!ok) return;
    }

    try {
      if (oficina.Ativo) await desativarOficina(oficina.IdOficina);
      else await reativarOficina(oficina.IdOficina);
      await lista.recarregar();
      toast.sucesso(`Conta de "${oficina.NomeOficina}" ${oficina.Ativo ? 'desativada' : 'reativada'}.`);
    } catch (error) {
      toast.erro(mensagemErro(error, 'Não foi possível alterar o status da oficina.'));
    }
  };

  // ---------- Tela ----------
  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={10} colunas={5} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    if (lista.itens.length === 0) {
      return (
        <EmptyState
          icone={Store}
          titulo="Nenhuma oficina cadastrada"
          descricao="As oficinas se cadastram pelo app. Elas aparecem aqui depois do cadastro."
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Oficinas"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdOficina"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={abrirDetalhe}
          linhaInativa={(o) => !o.Ativo}
          acoes={(o) => [
            { rotulo: 'Ver detalhes', icone: Eye, onClick: () => abrirDetalhe(o) },
            { rotulo: 'Desativar conta', icone: Power, onClick: () => alternarStatus(o), perigo: true, oculto: !o.Ativo },
            { rotulo: 'Reativar conta', icone: RotateCcw, onClick: () => alternarStatus(o), oculto: !!o.Ativo },
          ]}
          vazio={
            <EmptyState
              icone={Store}
              titulo="Nenhuma oficina encontrada"
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
          rotuloItens="oficinas"
        />
      </>
    );
  };

  return (
    <div>
      <PageHeader
        titulo="Oficinas"
        subtitulo="Oficinas cadastradas no app. Clique numa linha para ver os detalhes."
      />

      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar por nome, e-mail, proprietário ou CNPJ..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
      >
        <FiltroSelect rotulo="Faixa de preço" valor={lista.filtros.faixa} onChange={(v) => lista.mudarFiltro('faixa', v)}>
          <option value="">Todas as faixas</option>
          <option value="$">$ Econômico</option>
          <option value="$$">$$ Intermediário</option>
          <option value="$$$">$$$ Premium</option>
          <option value="sem">Sem faixa</option>
        </FiltroSelect>
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      <OficinaDetalheDrawer
        oficina={oficinaAberta}
        onFechar={fecharDetalhe}
        onAtualizado={lista.recarregar}
        onAlternarStatus={alternarStatus}
      />
    </div>
  );
};

export default OficinasPage;