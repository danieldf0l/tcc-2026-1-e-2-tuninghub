import { useState } from 'react';
import { Pencil, Plus, Power, RotateCcw, Tags, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
import { useAlternarStatus } from '../../hooks/useAlternarStatus';
import { mensagemErro } from '../../utils/erroApi';
import { contem } from '../../utils/texto';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import BarraFiltros, { FiltroStatus } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Campo';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  listarCategoriasAdmin,
  criarCategoria,
  atualizarCategoria,
  desativarCategoria,
  reativarCategoria,
} from '../../api/categoriaServicoService';
import { listarServicosAdmin } from '../../api/servicoService';

const COLUNAS = [
  { chave: 'Nome', titulo: 'Categoria' },
  {
    chave: 'servicos',
    titulo: 'Serviços',
    valorOrdenacao: (c) => c.totalServicos,
    render: (c) =>
      c.totalServicos === 0 ? (
        <span style={{ color: 'var(--text-secondary)' }}>Nenhum</span>
      ) : (
        <span>
          {c.servicosAtivos}
          <span style={{ color: 'var(--text-secondary)' }}> de {c.totalServicos} ativos</span>
        </span>
      ),
  },
  {
    chave: 'Ativo',
    titulo: 'Status',
    valorOrdenacao: (c) => (c.Ativo ? 1 : 0),
    render: (c) => <StatusBadge status={c.Ativo ? 'ativa' : 'inativa'} />,
  },
];

const filtrar = (c, { termo }) => contem(c.Nome, termo);

// Categorias + serviços (para mostrar quantos serviços cada uma tem)
const carregar = async () => {
  const [categorias, servicos] = await Promise.all([listarCategoriasAdmin(), listarServicosAdmin()]);
  return categorias.map((c) => {
    const daCategoria = servicos.filter((s) => s.IdCategoria === c.IdCategoria);
    return {
      ...c,
      totalServicos: daCategoria.length,
      servicosAtivos: daCategoria.filter((s) => s.Ativo).length,
    };
  });
};

const CategoriaTab = ({ onVerServicos }) => {
  const { admin } = useAuth();
  const ehMaster = admin?.role === 'ADMIN_MASTER';
  const toast = useToast();
  const podeDescartar = useConfirmarDescarte();

  const lista = useListaCatalogo({
    carregar,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'Nome', direcao: 'asc' },
  });

  const alternarStatus = useAlternarStatus(lista.recarregar);

  // ---------- Criar / editar ----------
  const [modal, setModal] = useState(null); // null | { editando: categoria | null }
  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const alterado = !!modal && nome.trim() !== (modal.editando?.Nome ?? '');

  const abrirCriar = () => {
    setModal({ editando: null });
    setNome('');
    setErroNome('');
  };

  const abrirEditar = (categoria) => {
    setModal({ editando: categoria });
    setNome(categoria.Nome);
    setErroNome('');
  };

  const fecharModal = async () => {
    if (await podeDescartar(alterado)) setModal(null);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome('Informe o nome da categoria.');
      return;
    }

    setSalvando(true);
    try {
      if (modal.editando) {
        await atualizarCategoria(modal.editando.IdCategoria, nomeLimpo);
        toast.sucesso(`Categoria "${nomeLimpo}" atualizada.`);
      } else {
        await criarCategoria(nomeLimpo);
        toast.sucesso(`Categoria "${nomeLimpo}" criada.`);
      }
      setModal(null);
      lista.recarregar();
    } catch (error) {
      setErroNome(mensagemErro(error, 'Erro ao salvar categoria.'));
    } finally {
      setSalvando(false);
    }
  };

  // Desativar não mexe nos serviços já cadastrados com ela; só some para serviços novos
  const mudarStatus = (c) =>
    alternarStatus({
      ativo: !!c.Ativo,
      rotulo: `Categoria "${c.Nome}"`,
      feminino: true,
      desativar: () => desativarCategoria(c.IdCategoria),
      reativar: () => reativarCategoria(c.IdCategoria),
    });

  // ---------- Tela ----------
  const botaoNovo = (
    <Button icone={Plus} onClick={abrirCriar}>
      Nova categoria
    </Button>
  );

  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={8} colunas={3} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    if (lista.itens.length === 0) {
      return (
        <EmptyState
          icone={Tags}
          titulo="Nenhuma categoria cadastrada"
          descricao="As categorias organizam os serviços (ex.: Suspensão, Motor, Rodas)."
          acao={botaoNovo}
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Categorias"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdCategoria"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={ehMaster ? abrirEditar : undefined}
          linhaInativa={(c) => !c.Ativo}
          acoes={(c) => [
            { rotulo: 'Ver serviços', icone: Wrench, onClick: () => onVerServicos(c.IdCategoria) },
            { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(c), oculto: !ehMaster },
            {
              rotulo: 'Desativar',
              icone: Power,
              onClick: () => mudarStatus(c),
              perigo: true,
              oculto: !ehMaster || !c.Ativo,
            },
            { rotulo: 'Reativar', icone: RotateCcw, onClick: () => mudarStatus(c), oculto: !ehMaster || !!c.Ativo },
          ]}
          vazio={
            <EmptyState
              icone={Tags}
              titulo="Nenhuma categoria encontrada"
              descricao="Tente outra busca ou mude o filtro de status."
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
          rotuloItens="categorias"
        />
      </>
    );
  };

  return (
    <div>
      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar categoria..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
        acoes={botaoNovo}
      >
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      {modal && (
        <Modal title={modal.editando ? 'Editar categoria' : 'Nova categoria'} onClose={fecharModal}>
          <form onSubmit={handleSalvar} noValidate>
            <Input
              label="Nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErroNome('');
              }}
              erro={erroNome}
              placeholder="Ex.: Suspensão"
              dica={modal.editando ? 'O novo nome aparece em todos os serviços desta categoria.' : undefined}
              required
              autoFocus
            />
            <div className="form-actions">
              <Button variante="secundario" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" carregando={salvando} disabled={!alterado || !nome.trim()}>
                {modal.editando ? 'Salvar' : 'Criar categoria'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoriaTab;