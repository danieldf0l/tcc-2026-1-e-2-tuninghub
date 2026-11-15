import { useState } from 'react';
import { ListChecks, Palette, Pencil, Plus, Power, RotateCcw } from 'lucide-react';
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
  listarEstilosAdmin,
  criarEstilo,
  atualizarEstilo,
  desativarEstilo,
  reativarEstilo,
} from '../../api/estiloService';
import { listarKitDoEstilo } from '../../api/estiloServicoSugeridoService';
import './Estilos.css';

// Prévia do código que o backend gera: maiúsculo, sem acento, espaço vira "_"
const previaCodigo = (nome) =>
  nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

const COLUNAS = [
  { chave: 'Nome', titulo: 'Estilo' },
  { chave: 'Codigo', titulo: 'Código', render: (e) => <code className="codigo-estilo">{e.Codigo}</code> },
  {
    chave: 'totalKit',
    titulo: 'Kit sugerido',
    valorOrdenacao: (e) => e.totalKit,
    render: (e) =>
      e.totalKit == null ? (
        <span style={{ color: 'var(--text-secondary)' }}>—</span>
      ) : e.totalKit === 0 ? (
        <span style={{ color: 'var(--text-secondary)' }}>Vazio</span>
      ) : (
        `${e.totalKit} ${e.totalKit === 1 ? 'serviço' : 'serviços'}`
      ),
  },
  {
    chave: 'Ativo',
    titulo: 'Status',
    valorOrdenacao: (e) => (e.Ativo ? 1 : 0),
    render: (e) => <StatusBadge status={e.Ativo ? 'ativo' : 'inativo'} />,
  },
];

const filtrar = (e, { termo }) => contem(e.Nome, termo) || contem(e.Codigo, termo);

// Estilos + tamanho do kit de cada um (se um kit falhar, a coluna mostra "—")
const carregar = async () => {
  const estilos = await listarEstilosAdmin();
  const kits = await Promise.all(estilos.map((e) => listarKitDoEstilo(e.Codigo).catch(() => null)));
  return estilos.map((e, i) => ({ ...e, totalKit: kits[i] ? kits[i].length : null }));
};

const EstiloTab = ({ onMontarKit }) => {
  const { admin } = useAuth();
  // Editar, desativar e reativar são só do ADMIN_MASTER no backend; criar é de qualquer admin
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
  const [modal, setModal] = useState(null); // null | { editando: estilo | null }
  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const alterado = !!modal && nome.trim() !== (modal.editando?.Nome ?? '');

  const abrirCriar = () => {
    setModal({ editando: null });
    setNome('');
    setErroNome('');
  };

  const abrirEditar = (estilo) => {
    setModal({ editando: estilo });
    setNome(estilo.Nome);
    setErroNome('');
  };

  const fecharModal = async () => {
    if (await podeDescartar(alterado)) setModal(null);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome('Informe o nome do estilo.');
      return;
    }

    setSalvando(true);
    try {
      if (modal.editando) {
        await atualizarEstilo(modal.editando.IdEstilo, nomeLimpo);
        toast.sucesso(`Estilo "${nomeLimpo}" atualizado.`);
      } else {
        await criarEstilo(nomeLimpo);
        toast.sucesso(`Estilo "${nomeLimpo}" criado. Monte o kit de serviços dele na aba ao lado.`);
      }
      setModal(null);
      lista.recarregar();
    } catch (error) {
      setErroNome(mensagemErro(error, 'Erro ao salvar estilo.'));
    } finally {
      setSalvando(false);
    }
  };

  // Desativar bloqueia novos projetos com o estilo; projetos existentes continuam iguais
  const mudarStatus = (e) =>
    alternarStatus({
      ativo: !!e.Ativo,
      rotulo: `Estilo "${e.Nome}"`,
      desativar: () => desativarEstilo(e.IdEstilo),
      reativar: () => reativarEstilo(e.IdEstilo),
    });

  // ---------- Tela ----------
  const botaoNovo = (
    <Button icone={Plus} onClick={abrirCriar}>
      Novo estilo
    </Button>
  );

  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={6} colunas={4} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    if (lista.itens.length === 0) {
      return (
        <EmptyState
          icone={Palette}
          titulo="Nenhum estilo cadastrado"
          descricao="Estilos como Stance, JDM ou Off Road guiam o entusiasta na criação do projeto."
          acao={botaoNovo}
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Estilos"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdEstilo"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={ehMaster ? abrirEditar : undefined}
          linhaInativa={(e) => !e.Ativo}
          acoes={(e) => [
            { rotulo: 'Montar kit', icone: ListChecks, onClick: () => onMontarKit(e.Codigo), oculto: !e.Ativo },
            { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(e), oculto: !ehMaster },
            {
              rotulo: 'Desativar',
              icone: Power,
              onClick: () => mudarStatus(e),
              perigo: true,
              oculto: !ehMaster || !e.Ativo,
            },
            { rotulo: 'Reativar', icone: RotateCcw, onClick: () => mudarStatus(e), oculto: !ehMaster || !!e.Ativo },
          ]}
          vazio={
            <EmptyState
              icone={Palette}
              titulo="Nenhum estilo encontrado"
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
          rotuloItens="estilos"
        />
      </>
    );
  };

  return (
    <div>
      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar estilo ou código..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
        acoes={botaoNovo}
      >
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      {modal && (
        <Modal title={modal.editando ? 'Editar estilo' : 'Novo estilo'} onClose={fecharModal}>
          <form onSubmit={handleSalvar} noValidate>
            <Input
              label="Nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErroNome('');
              }}
              erro={erroNome}
              placeholder="Ex.: Off Road"
              required
              autoFocus
            />

            {modal.editando ? (
              <Input
                label="Código"
                value={modal.editando.Codigo}
                disabled
                readOnly
                dica="O código nunca muda: ele liga o estilo aos projetos e ao kit. Só o nome é editável."
              />
            ) : (
              <p className="modal-texto">
                Código gerado automaticamente:{' '}
                <code className="codigo-estilo">{previaCodigo(nome) || 'EX: OFF_ROAD'}</code>
                <br />
                Ele nunca muda depois de criado.
              </p>
            )}

            <div className="form-actions">
              <Button variante="secundario" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" carregando={salvando} disabled={!alterado || !nome.trim()}>
                {modal.editando ? 'Salvar' : 'Criar estilo'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EstiloTab;