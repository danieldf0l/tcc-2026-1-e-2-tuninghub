import { useMemo } from 'react';
import { Copy, Mail, Power, RotateCcw, Users } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { mensagemErro } from '../../utils/erroApi';
import { contem } from '../../utils/texto';
import { diasAte, formatarData, iniciais } from '../../utils/formatadores';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import BarraFiltros, { FiltroSelect, FiltroStatus } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { listarUsuariosAdmin, desativarUsuario, reativarUsuario } from '../../api/usuarioService';

const COLUNAS = [
  {
    chave: 'Nome',
    titulo: 'Usuário',
    render: (u) => (
      <div className="celula-avatar">
        <span className="celula-avatar__iniciais" aria-hidden="true">
          {iniciais(u.Nome)}
        </span>
        <div className="celula-dupla">
          <span className="celula-dupla__principal">{u.Nome}</span>
          <span className="celula-dupla__secundario">{u.Email}</span>
        </div>
      </div>
    ),
  },
  {
    chave: 'DataCriacao',
    titulo: 'Cadastro',
    largura: '160px',
    valorOrdenacao: (u) => (u.DataCriacao ? new Date(u.DataCriacao).getTime() : null),
    render: (u) => formatarData(u.DataCriacao),
  },
  {
    chave: 'Ativo',
    titulo: 'Status',
    largura: '130px',
    valorOrdenacao: (u) => (u.Ativo ? 1 : 0),
    render: (u) => <StatusBadge status={u.Ativo ? 'ativo' : 'inativo'} />,
  },
];

// Busca por nome ou e-mail + período de cadastro (últimos N dias)
const filtrar = (u, { termo, periodo }) => {
  const passaBusca = contem(u.Nome, termo) || contem(u.Email, termo);
  const passaPeriodo = !periodo || (u.DataCriacao && -diasAte(u.DataCriacao) <= Number(periodo));
  return passaBusca && passaPeriodo;
};

const UsuariosPage = () => {
  const toast = useToast();
  const confirmar = useConfirm();

  const lista = useListaCatalogo({
    carregar: listarUsuariosAdmin,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'DataCriacao', direcao: 'desc' },
    porPagina: 20,
    filtrosExtras: { periodo: '' },
  });

  // Resumo do cabeçalho: total e novos nos últimos 30 dias
  const resumo = useMemo(() => {
    const novos = lista.itens.filter((u) => u.DataCriacao && -diasAte(u.DataCriacao) <= 30).length;
    return { total: lista.itens.length, novos };
  }, [lista.itens]);

  const copiarEmail = async (usuario) => {
    try {
      await navigator.clipboard.writeText(usuario.Email);
      toast.info('E-mail copiado.');
    } catch {
      toast.erro('Não foi possível copiar.');
    }
  };

  const alternarStatus = async (usuario) => {
    if (usuario.Ativo) {
      const ok = await confirmar({
        titulo: `Desativar "${usuario.Nome}"?`,
        mensagem: 'O usuário perde o acesso ao app na hora. Dá para reativar depois.',
        textoConfirmar: 'Desativar usuário',
        perigo: true,
      });
      if (!ok) return;
    }

    try {
      if (usuario.Ativo) await desativarUsuario(usuario.IdUsuario);
      else await reativarUsuario(usuario.IdUsuario);
      await lista.recarregar();
      toast.sucesso(`Usuário "${usuario.Nome}" ${usuario.Ativo ? 'desativado' : 'reativado'}.`);
    } catch (error) {
      toast.erro(mensagemErro(error, 'Não foi possível alterar o status do usuário.'));
    }
  };

  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={10} colunas={3} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    if (lista.itens.length === 0) {
      return (
        <EmptyState
          icone={Users}
          titulo="Nenhum usuário cadastrado"
          descricao="Os entusiastas se cadastram pelo app. Eles aparecem aqui depois do cadastro."
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Usuários"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdUsuario"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          linhaInativa={(u) => !u.Ativo}
          acoes={(u) => [
            { rotulo: 'Copiar e-mail', icone: Copy, onClick: () => copiarEmail(u) },
            { rotulo: 'Enviar e-mail', icone: Mail, onClick: () => (window.location.href = `mailto:${u.Email}`) },
            { rotulo: 'Desativar usuário', icone: Power, onClick: () => alternarStatus(u), perigo: true, oculto: !u.Ativo },
            { rotulo: 'Reativar usuário', icone: RotateCcw, onClick: () => alternarStatus(u), oculto: !!u.Ativo },
          ]}
          vazio={
            <EmptyState
              icone={Users}
              titulo="Nenhum usuário encontrado"
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
          rotuloItens="usuários"
        />
      </>
    );
  };

  const subtitulo = lista.carregando
    ? 'Entusiastas cadastrados no app.'
    : `${resumo.total} ${resumo.total === 1 ? 'usuário' : 'usuários'} · ${resumo.novos} ${
        resumo.novos === 1 ? 'novo' : 'novos'
      } nos últimos 30 dias`;

  return (
    <div>
      <PageHeader titulo="Usuários" subtitulo={subtitulo} />

      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar por nome ou e-mail..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
      >
        <FiltroSelect rotulo="Período de cadastro" valor={lista.filtros.periodo} onChange={(v) => lista.mudarFiltro('periodo', v)}>
          <option value="">Qualquer data</option>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </FiltroSelect>
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}
    </div>
  );
};

export default UsuariosPage;