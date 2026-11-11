import { useCallback, useState } from 'react';
import { Car, CarFront, Pencil, Plus, Power, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
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
import ReativarMontadoraModal from './ReativarMontadoraModal';
import {
  listarMontadorasAdmin,
  criarMontadora,
  atualizarMontadora,
  desativarMontadora,
  reativarMontadora,
} from '../../api/montadoraService';
import { listarModelosAdmin, reativarModelo } from '../../api/modeloService';

const COLUNAS = [
  { chave: 'Nome', titulo: 'Montadora' },
  {
    chave: 'modelos',
    titulo: 'Modelos',
    valorOrdenacao: (m) => m.totalModelos,
    render: (m) =>
      m.totalModelos === 0 ? (
        <span style={{ color: 'var(--text-secondary)' }}>Nenhum</span>
      ) : (
        <span>
          {m.modelosAtivos.toLocaleString('pt-BR')}
          <span style={{ color: 'var(--text-secondary)' }}> de {m.totalModelos.toLocaleString('pt-BR')} ativos</span>
        </span>
      ),
  },
  {
    chave: 'Ativo',
    titulo: 'Status',
    valorOrdenacao: (m) => (m.Ativo ? 1 : 0),
    render: (m) => <StatusBadge status={m.Ativo ? 'ativa' : 'inativa'} />,
  },
];

const filtrar = (m, { termo }) => contem(m.Nome, termo);

const MontadoraTab = ({ onVerModelos }) => {
  const { admin } = useAuth();
  // Editar, desativar e reativar são só do ADMIN_MASTER no backend; criar é de qualquer admin
  const ehMaster = admin?.role === 'ADMIN_MASTER';
  const toast = useToast();
  const confirmar = useConfirm();
  const podeDescartar = useConfirmarDescarte();

  const [modelos, setModelos] = useState([]);

  // Montadoras + modelos (para mostrar a contagem e montar a reativação)
  const carregar = useCallback(async () => {
    const [dadosMontadoras, dadosModelos] = await Promise.all([listarMontadorasAdmin(), listarModelosAdmin()]);
    setModelos(dadosModelos);
    return dadosMontadoras.map((m) => {
      const daMontadora = dadosModelos.filter((mo) => mo.IdMontadora === m.IdMontadora);
      return {
        ...m,
        totalModelos: daMontadora.length,
        modelosAtivos: daMontadora.filter((mo) => mo.Ativo).length,
      };
    });
  }, []);

  const lista = useListaCatalogo({
    carregar,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'Nome', direcao: 'asc' },
  });

  // ---------- Criar / editar ----------
  const [modal, setModal] = useState(null); // null | { editando: montadora | null }
  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const nomeOriginal = modal?.editando?.Nome ?? '';
  const alterado = !!modal && nome.trim() !== nomeOriginal;

  const abrirCriar = () => {
    setModal({ editando: null });
    setNome('');
    setErroNome('');
  };

  const abrirEditar = (montadora) => {
    setModal({ editando: montadora });
    setNome(montadora.Nome);
    setErroNome('');
  };

  const fecharModal = async () => {
    if (await podeDescartar(alterado)) setModal(null);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome('Informe o nome da montadora.');
      return;
    }

    setSalvando(true);
    try {
      if (modal.editando) {
        await atualizarMontadora(modal.editando.IdMontadora, nomeLimpo);
        toast.sucesso(`Montadora "${nomeLimpo}" atualizada.`);
      } else {
        await criarMontadora(nomeLimpo);
        toast.sucesso(`Montadora "${nomeLimpo}" criada.`);
      }
      setModal(null);
      lista.recarregar();
    } catch (error) {
      setErroNome(mensagemErro(error, 'Erro ao salvar montadora.'));
    } finally {
      setSalvando(false);
    }
  };

  // ---------- Desativar (com confirmação: desativa os modelos junto) ----------
  const handleDesativar = async (montadora) => {
    const ok = await confirmar({
      titulo: `Desativar "${montadora.Nome}"?`,
      mensagem:
        montadora.modelosAtivos > 0
          ? `Os ${montadora.modelosAtivos} modelos ativos dela também serão desativados. Projetos existentes não são afetados.`
          : 'Ela deixa de aparecer no app. Projetos existentes não são afetados.',
      textoConfirmar: 'Desativar',
      perigo: true,
    });
    if (!ok) return;

    try {
      await desativarMontadora(montadora.IdMontadora);
      toast.sucesso(`Montadora "${montadora.Nome}" desativada.`);
      lista.recarregar();
    } catch (error) {
      toast.erro(mensagemErro(error, 'Erro ao desativar montadora.'));
    }
  };

  // ---------- Reativar (escolhendo quais modelos voltam junto) ----------
  const [reativando, setReativando] = useState(null);
  const [salvandoReativacao, setSalvandoReativacao] = useState(false);

  const modelosInativosDe = (montadora) =>
    modelos.filter((m) => m.IdMontadora === montadora.IdMontadora && !m.Ativo);

  const handleConfirmarReativar = async (idsModelos) => {
    setSalvandoReativacao(true);
    try {
      await reativarMontadora(reativando.IdMontadora);
      if (idsModelos.length > 0) {
        await Promise.all(idsModelos.map((id) => reativarModelo(id)));
      }
      toast.sucesso(
        idsModelos.length > 0
          ? `"${reativando.Nome}" reativada com ${idsModelos.length} ${idsModelos.length === 1 ? 'modelo' : 'modelos'}.`
          : `Montadora "${reativando.Nome}" reativada.`
      );
      setReativando(null);
      lista.recarregar();
    } catch (error) {
      toast.erro(mensagemErro(error, 'Erro ao reativar montadora.'));
    } finally {
      setSalvandoReativacao(false);
    }
  };

  // ---------- Tela ----------
  const botaoNovo = (
    <Button icone={Plus} onClick={abrirCriar}>
      Nova montadora
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
          icone={Car}
          titulo="Nenhuma montadora cadastrada"
          descricao="Cadastre a primeira montadora para ela aparecer no app."
          acao={botaoNovo}
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Montadoras"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdMontadora"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={ehMaster ? abrirEditar : undefined}
          linhaInativa={(m) => !m.Ativo}
          acoes={(m) => [
            { rotulo: 'Ver modelos', icone: CarFront, onClick: () => onVerModelos(m.IdMontadora) },
            { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(m), oculto: !ehMaster },
            {
              rotulo: 'Desativar',
              icone: Power,
              onClick: () => handleDesativar(m),
              perigo: true,
              oculto: !ehMaster || !m.Ativo,
            },
            { rotulo: 'Reativar', icone: RotateCcw, onClick: () => setReativando(m), oculto: !ehMaster || !!m.Ativo },
          ]}
          vazio={
            <EmptyState
              icone={Car}
              titulo="Nenhuma montadora encontrada"
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
          rotuloItens="montadoras"
        />
      </>
    );
  };

  return (
    <div>
      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar montadora..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
        acoes={botaoNovo}
      >
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      {modal && (
        <Modal title={modal.editando ? 'Editar montadora' : 'Nova montadora'} onClose={fecharModal}>
          <form onSubmit={handleSalvar} noValidate>
            <Input
              label="Nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErroNome('');
              }}
              erro={erroNome}
              placeholder="Ex.: Volkswagen"
              required
              autoFocus
            />
            <div className="form-actions">
              <Button variante="secundario" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" carregando={salvando} disabled={!alterado || !nome.trim()}>
                {modal.editando ? 'Salvar' : 'Criar montadora'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {reativando && (
        <ReativarMontadoraModal
          montadora={reativando}
          modelosInativos={modelosInativosDe(reativando)}
          onConfirm={handleConfirmarReativar}
          onClose={() => setReativando(null)}
          salvando={salvandoReativacao}
        />
      )}
    </div>
  );
};

export default MontadoraTab;