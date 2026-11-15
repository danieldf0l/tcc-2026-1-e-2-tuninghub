import { useCallback, useMemo, useState } from 'react';
import { Pencil, Plus, Power, RotateCcw, Wrench } from 'lucide-react';
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
import BarraFiltros, { FiltroSelect, FiltroStatus } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Campo';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  listarServicosAdmin,
  criarServico,
  atualizarServico,
  desativarServico,
  reativarServico,
} from '../../api/servicoService';
import { listarCategoriasAtivas } from '../../api/categoriaServicoService';
import './Servicos.css';

const COLUNAS = [
  {
    chave: 'Nome',
    titulo: 'Serviço',
    render: (s) => (
      <div className="servico-celula">
        <span className="servico-celula__nome">{s.Nome}</span>
        {s.Descricao && <span className="servico-celula__descricao">{s.Descricao}</span>}
      </div>
    ),
  },
  { chave: 'Categoria', titulo: 'Categoria', render: (s) => <Badge>{s.Categoria}</Badge> },
  {
    chave: 'Ativo',
    titulo: 'Status',
    valorOrdenacao: (s) => (s.Ativo ? 1 : 0),
    render: (s) => <StatusBadge status={s.Ativo ? 'ativo' : 'inativo'} />,
  },
];

const filtrar = (s, { termo, categoria }) =>
  (contem(s.Nome, termo) || contem(s.Descricao, termo) || contem(s.Categoria, termo)) &&
  (!categoria || String(s.IdCategoria) === categoria);

const FORM_VAZIO = { nome: '', descricao: '', idCategoria: '' };

const ServicoTab = () => {
  const { admin } = useAuth();
  // Editar, desativar e reativar são só do ADMIN_MASTER no backend; criar é de qualquer admin
  const ehMaster = admin?.role === 'ADMIN_MASTER';
  const toast = useToast();
  const podeDescartar = useConfirmarDescarte();

  const [categoriasAtivas, setCategoriasAtivas] = useState([]);

  const carregar = useCallback(async () => {
    const [dadosServicos, dadosCategorias] = await Promise.all([listarServicosAdmin(), listarCategoriasAtivas()]);
    setCategoriasAtivas(dadosCategorias);
    return dadosServicos;
  }, []);

  const lista = useListaCatalogo({
    carregar,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'Nome', direcao: 'asc' },
    porPagina: 15,
    filtrosExtras: { categoria: '' },
  });

  const alternarStatus = useAlternarStatus(lista.recarregar);

  // Categorias que aparecem nos serviços (inclui inativas), para o filtro
  const categoriasDoFiltro = useMemo(() => {
    const mapa = new Map();
    lista.itens.forEach((s) => mapa.set(s.IdCategoria, s.Categoria));
    return [...mapa.entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1]), 'pt-BR'));
  }, [lista.itens]);

  // ---------- Criar / editar ----------
  const [modal, setModal] = useState(null); // null | { editando: servico | null, inicial: {...} }
  const [form, setForm] = useState(FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const alterado =
    !!modal &&
    (form.nome.trim() !== modal.inicial.nome ||
      form.descricao.trim() !== modal.inicial.descricao ||
      String(form.idCategoria) !== String(modal.inicial.idCategoria));

  const abrirCriar = () => {
    // Se a lista está filtrada por uma categoria ativa, ela já vem escolhida
    const filtrada = categoriasAtivas.find((c) => String(c.IdCategoria) === lista.filtros.categoria);
    const inicial = {
      nome: '',
      descricao: '',
      idCategoria: filtrada?.IdCategoria ?? categoriasAtivas[0]?.IdCategoria ?? '',
    };
    setModal({ editando: null, inicial });
    setForm(inicial);
    setErros({});
  };

  const abrirEditar = (servico) => {
    const inicial = {
      nome: servico.Nome,
      descricao: servico.Descricao || '',
      idCategoria: servico.IdCategoria,
    };
    setModal({ editando: servico, inicial });
    setForm(inicial);
    setErros({});
  };

  const mudarCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  const fecharModal = async () => {
    if (await podeDescartar(alterado)) setModal(null);
  };

  // A categoria atual do serviço pode estar inativa: ela continua aparecendo no select da edição
  const opcoesCategoria = useMemo(() => {
    const editando = modal?.editando;
    if (!editando || categoriasAtivas.some((c) => c.IdCategoria === editando.IdCategoria)) return categoriasAtivas;
    return [{ IdCategoria: editando.IdCategoria, Nome: `${editando.Categoria} (inativa)` }, ...categoriasAtivas];
  }, [modal, categoriasAtivas]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    const nome = form.nome.trim();
    const descricao = form.descricao.trim();
    const novos = {};
    if (!nome) novos.nome = 'Informe o nome do serviço.';
    if (!form.idCategoria) novos.idCategoria = 'Escolha a categoria.';
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvando(true);
    try {
      if (modal.editando) {
        await atualizarServico(modal.editando.IdServico, nome, descricao, form.idCategoria);
        toast.sucesso(`Serviço "${nome}" atualizado.`);
      } else {
        await criarServico(nome, descricao, form.idCategoria);
        toast.sucesso(`Serviço "${nome}" criado.`);
      }
      setModal(null);
      lista.recarregar();
    } catch (error) {
      setErros({ nome: mensagemErro(error, 'Erro ao salvar serviço.') });
    } finally {
      setSalvando(false);
    }
  };

  const mudarStatus = (s) =>
    alternarStatus({
      ativo: !!s.Ativo,
      rotulo: `Serviço "${s.Nome}"`,
      desativar: () => desativarServico(s.IdServico),
      reativar: () => reativarServico(s.IdServico),
    });

  // ---------- Tela ----------
  const semCategoriaAtiva = categoriasAtivas.length === 0;
  const botaoNovo = (
    <Button
      icone={Plus}
      onClick={abrirCriar}
      disabled={lista.carregando || semCategoriaAtiva}
      title={semCategoriaAtiva ? 'Cadastre uma categoria ativa antes de criar serviços.' : undefined}
    >
      Novo serviço
    </Button>
  );

  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={10} colunas={3} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    if (lista.itens.length === 0) {
      return (
        <EmptyState
          icone={Wrench}
          titulo="Nenhum serviço cadastrado"
          descricao={
            semCategoriaAtiva
              ? 'Cadastre uma categoria ativa (aba Categorias) antes de criar serviços.'
              : 'Cadastre o primeiro serviço para as oficinas poderem oferecê-lo.'
          }
          acao={!semCategoriaAtiva && botaoNovo}
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Serviços"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdServico"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={ehMaster ? abrirEditar : undefined}
          linhaInativa={(s) => !s.Ativo}
          acoes={
            ehMaster
              ? (s) => [
                  { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(s) },
                  { rotulo: 'Desativar', icone: Power, onClick: () => mudarStatus(s), perigo: true, oculto: !s.Ativo },
                  { rotulo: 'Reativar', icone: RotateCcw, onClick: () => mudarStatus(s), oculto: !!s.Ativo },
                ]
              : undefined
          }
          vazio={
            <EmptyState
              icone={Wrench}
              titulo="Nenhum serviço encontrado"
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
          rotuloItens="serviços"
        />
      </>
    );
  };

  return (
    <div>
      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar serviço..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
        acoes={botaoNovo}
      >
        <FiltroSelect
          rotulo="Categoria"
          valor={lista.filtros.categoria}
          onChange={(v) => lista.mudarFiltro('categoria', v)}
        >
          <option value="">Todas as categorias</option>
          {categoriasDoFiltro.map(([id, nome]) => (
            <option key={id} value={String(id)}>
              {nome}
            </option>
          ))}
        </FiltroSelect>
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      {modal && (
        <Modal title={modal.editando ? 'Editar serviço' : 'Novo serviço'} onClose={fecharModal}>
          <form onSubmit={handleSalvar} noValidate>
            <Input
              label="Nome"
              value={form.nome}
              onChange={(e) => mudarCampo('nome', e.target.value)}
              erro={erros.nome}
              placeholder="Ex.: Rebaixamento com molas"
              required
              autoFocus
            />

            <Select
              label="Categoria"
              value={form.idCategoria}
              onChange={(e) => mudarCampo('idCategoria', e.target.value)}
              erro={erros.idCategoria}
              required
            >
              {opcoesCategoria.map((c) => (
                <option key={c.IdCategoria} value={c.IdCategoria}>
                  {c.Nome}
                </option>
              ))}
            </Select>

            <Textarea
              label="Descrição"
              value={form.descricao}
              onChange={(e) => mudarCampo('descricao', e.target.value)}
              dica="Opcional. Aparece para o entusiasta no app."
              rows={3}
            />

            {modal.editando && !modal.editando.Ativo && (
              <p className="modal-texto">Este serviço está inativo: não aparece para novos vínculos.</p>
            )}

            <div className="form-actions">
              <Button variante="secundario" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" carregando={salvando} disabled={!alterado || !form.nome.trim()}>
                {modal.editando ? 'Salvar' : 'Criar serviço'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServicoTab;