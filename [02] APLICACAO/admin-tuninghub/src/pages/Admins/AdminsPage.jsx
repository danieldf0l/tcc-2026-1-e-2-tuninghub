import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Pencil, Plus, Power, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { mensagemErro } from '../../utils/erroApi';
import { contem } from '../../utils/texto';
import { formatarData, iniciais } from '../../utils/formatadores';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import BarraFiltros, { FiltroSelect, FiltroStatus } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import AdminFormModal from './AdminFormModal';
import { listarAdmins, alterarStatusAdmin } from '../../api/adminService';
import './Admins.css';

const NIVEL_LABEL = {
  SUPER: 'Admin Master',
  PADRAO: 'Admin',
};

// Aceita tanto a resposta do axios quanto a lista direta
const carregar = () => listarAdmins().then((resposta) => (Array.isArray(resposta) ? resposta : resposta.data));

const filtrar = (a, { termo, nivel }) =>
  (contem(a.Nome, termo) || contem(a.Email, termo)) && (!nivel || a.NivelAcesso === nivel);

const AdminsPage = () => {
  const { admin: logado } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const navigate = useNavigate();
  const ehMaster = logado?.role === 'ADMIN_MASTER';
  const ehVoce = useCallback((a) => String(a.IdAdmin) === String(logado?.id), [logado?.id]);

  const [modal, setModal] = useState(null); // null | { editando: admin | null }

  const colunas = [
    {
      chave: 'Nome',
      titulo: 'Administrador',
      render: (a) => (
        <div className="celula-avatar">
          <span className="celula-avatar__iniciais" aria-hidden="true">
            {iniciais(a.Nome)}
          </span>
          <div className="celula-dupla">
            <span className="celula-dupla__principal">
              {a.Nome}
              {ehVoce(a) && <span className="admin-voce">você</span>}
            </span>
            <span className="celula-dupla__secundario">{a.Email}</span>
          </div>
        </div>
      ),
    },
    {
      chave: 'NivelAcesso',
      titulo: 'Nível',
      largura: '160px',
      valorOrdenacao: (a) => NIVEL_LABEL[a.NivelAcesso] || a.NivelAcesso,
      render: (a) => (
        <Badge tom={a.NivelAcesso === 'SUPER' ? 'primario' : 'neutro'}>{NIVEL_LABEL[a.NivelAcesso] || a.NivelAcesso}</Badge>
      ),
    },
    {
      chave: 'DataCriacao',
      titulo: 'Cadastro',
      largura: '140px',
      valorOrdenacao: (a) => (a.DataCriacao ? new Date(a.DataCriacao).getTime() : null),
      render: (a) => formatarData(a.DataCriacao),
    },
    {
      chave: 'Ativo',
      titulo: 'Status',
      largura: '120px',
      valorOrdenacao: (a) => (a.Ativo ? 1 : 0),
      render: (a) => <StatusBadge status={a.Ativo ? 'ativo' : 'inativo'} />,
    },
  ];

  const lista = useListaCatalogo({
    carregar,
    filtrar,
    colunas,
    ordenacaoPadrao: { chave: 'Nome', direcao: 'asc' },
    porPagina: 20,
    filtrosExtras: { nivel: '' },
  });

  const alternarStatus = async (a) => {
    if (a.Ativo) {
      const ok = await confirmar({
        titulo: `Desativar "${a.Nome}"?`,
        mensagem: 'Ele perde o acesso ao painel na hora, mesmo se estiver logado agora. Dá para reativar depois.',
        textoConfirmar: 'Desativar administrador',
        perigo: true,
      });
      if (!ok) return;
    }

    try {
      await alterarStatusAdmin(a.IdAdmin, !a.Ativo);
      await lista.recarregar();
      toast.sucesso(`Administrador "${a.Nome}" ${a.Ativo ? 'desativado' : 'reativado'}.`);
    } catch (error) {
      toast.erro(mensagemErro(error, 'Não foi possível alterar o status do administrador.'));
    }
  };

  const abrirCriar = () => setModal({ editando: null });
  const abrirEditar = (a) => setModal({ editando: a });

  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={5} colunas={4} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    return (
      <>
        <DataTable
          rotulo="Administradores"
          colunas={colunas}
          dados={lista.itensPagina}
          chaveLinha="IdAdmin"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={ehMaster ? abrirEditar : undefined}
          linhaInativa={(a) => !a.Ativo}
          acoes={
            ehMaster
              ? (a) => [
                  { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(a) },
                  { rotulo: 'Ver atividade', icone: History, onClick: () => navigate(`/auditoria?admin=${a.IdAdmin}`) },
                  {
                    rotulo: ehVoce(a) ? 'Você não pode se desativar' : 'Desativar',
                    icone: Power,
                    onClick: () => alternarStatus(a),
                    perigo: true,
                    oculto: !a.Ativo,
                    desabilitado: ehVoce(a),
                  },
                  { rotulo: 'Reativar', icone: RotateCcw, onClick: () => alternarStatus(a), oculto: !!a.Ativo },
                ]
              : undefined
          }
          vazio={
            <EmptyState
              icone={ShieldCheck}
              titulo="Nenhum administrador encontrado"
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
          rotuloItens="administradores"
        />
      </>
    );
  };

  return (
    <div>
      <PageHeader
        titulo="Administradores"
        subtitulo="Quem tem acesso a este painel. Admin Master gerencia catálogos e outros administradores."
      />

      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar por nome ou e-mail..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
        acoes={
          ehMaster && (
            <Button icone={Plus} onClick={abrirCriar}>
              Novo administrador
            </Button>
          )
        }
      >
        <FiltroSelect rotulo="Nível" valor={lista.filtros.nivel} onChange={(v) => lista.mudarFiltro('nivel', v)}>
          <option value="">Todos os níveis</option>
          <option value="SUPER">Admin Master</option>
          <option value="PADRAO">Admin</option>
        </FiltroSelect>
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      {modal && (
        <AdminFormModal
          editando={modal.editando}
          ehVoce={!!modal.editando && ehVoce(modal.editando)}
          onFechar={() => setModal(null)}
          onSalvo={lista.recarregar}
        />
      )}
    </div>
  );
};

export default AdminsPage;