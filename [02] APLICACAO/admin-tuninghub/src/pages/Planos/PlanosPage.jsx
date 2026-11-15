import { useState } from 'react';
import { BadgeDollarSign, Link2, Pencil, Plus, Power, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
import { useAlternarStatus } from '../../hooks/useAlternarStatus';
import { mensagemErro } from '../../utils/erroApi';
import { contem } from '../../utils/texto';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import BarraFiltros, { FiltroStatus } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Campo';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Aviso from '../../components/ui/Aviso';
import VincularProdutoModal from './VincularProdutoModal';
import { apelidoDuracao, ehGratuito, formatarMoeda } from './planoUtils';
import {
  listarPlanosAdmin,
  criarPlano,
  atualizarPlano,
  vincularProdutoExterno,
  desativarPlano,
  reativarPlano,
} from '../../api/planoService';

const COLUNAS = [
  {
    chave: 'Nome',
    titulo: 'Plano',
    render: (p) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontWeight: 'var(--font-medium)' }}>{p.Nome}</span>
        {ehGratuito(p) && <Badge>Gratuito</Badge>}
      </span>
    ),
  },
  {
    chave: 'Valor',
    titulo: 'Valor',
    valorOrdenacao: (p) => Number(p.Valor),
    render: (p) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatarMoeda(p.Valor)}</span>,
  },
  {
    chave: 'DuracaoDias',
    titulo: 'Duração',
    valorOrdenacao: (p) => Number(p.DuracaoDias),
    render: (p) => (
      <span>
        {p.DuracaoDias} dias
        {apelidoDuracao(p.DuracaoDias) && (
          <span style={{ color: 'var(--text-secondary)' }}> · {apelidoDuracao(p.DuracaoDias)}</span>
        )}
      </span>
    ),
  },
  {
    chave: 'IdProdutoExterno',
    titulo: 'AbacatePay',
    valorOrdenacao: (p) => (p.IdProdutoExterno ? 1 : 0),
    render: (p) =>
      p.IdProdutoExterno ? (
        <span title={`Produto: ${p.IdProdutoExterno}`}>
          <StatusBadge status="vinculado" />
        </span>
      ) : ehGratuito(p) ? (
        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Não precisa</span>
      ) : (
        <StatusBadge status="nao_vinculado" />
      ),
  },
  {
    chave: 'Ativo',
    titulo: 'Status',
    valorOrdenacao: (p) => (p.Ativo ? 1 : 0),
    render: (p) => <StatusBadge status={p.Ativo ? 'ativo' : 'inativo'} />,
  },
];

const filtrar = (p, { termo }) => contem(p.Nome, termo);

const FORM_VAZIO = { nome: '', valor: '', duracaoDias: '', idProdutoExterno: '' };

const PlanosPage = () => {
  const { admin } = useAuth();
  // Editar, desativar e reativar são só do ADMIN_MASTER no backend; criar e vincular são de qualquer admin
  const ehMaster = admin?.role === 'ADMIN_MASTER';
  const toast = useToast();
  const podeDescartar = useConfirmarDescarte();

  const lista = useListaCatalogo({
    carregar: listarPlanosAdmin,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'Valor', direcao: 'asc' },
  });

  const alternarStatus = useAlternarStatus(lista.recarregar);
  const [vinculando, setVinculando] = useState(null);

  // Plano pago e ativo sem produto no AbacatePay: o checkout dele não funciona
  const pagosSemVinculo = lista.itens.filter((p) => p.Ativo && !ehGratuito(p) && !p.IdProdutoExterno);

  // ---------- Criar / editar ----------
  const [modal, setModal] = useState(null); // null | { editando: plano | null, inicial: {...} }
  const [form, setForm] = useState(FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const alterado =
    !!modal &&
    Object.keys(FORM_VAZIO).some((campo) => String(form[campo]).trim() !== String(modal.inicial[campo]).trim());

  const abrirCriar = () => {
    setModal({ editando: null, inicial: FORM_VAZIO });
    setForm(FORM_VAZIO);
    setErros({});
  };

  const abrirEditar = (plano) => {
    const inicial = {
      nome: plano.Nome,
      valor: String(plano.Valor),
      duracaoDias: String(plano.DuracaoDias),
      idProdutoExterno: '',
    };
    setModal({ editando: plano, inicial });
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

  const validar = () => {
    const novos = {};
    if (!form.nome.trim()) novos.nome = 'Informe o nome do plano.';
    if (!modal.editando) {
      const valor = Number(String(form.valor).replace(',', '.'));
      if (form.valor === '' || Number.isNaN(valor) || valor < 0) novos.valor = 'Informe um valor igual ou maior que zero.';
    }
    const dias = Number(form.duracaoDias);
    if (!Number.isInteger(dias) || dias < 1) novos.duracaoDias = 'Informe um número inteiro de dias (mínimo 1).';
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    const nome = form.nome.trim();
    const duracaoDias = Number(form.duracaoDias);

    setSalvando(true);
    try {
      if (modal.editando) {
        await atualizarPlano(modal.editando.IdPlano, nome, duracaoDias);
        toast.sucesso(`Plano "${nome}" atualizado.`);
        setModal(null);
        lista.recarregar();
        return;
      }

      const valor = Number(String(form.valor).replace(',', '.'));
      const resultado = await criarPlano(nome, valor, duracaoDias);
      const idNovoPlano = resultado?.plano?.id;
      const idProduto = form.idProdutoExterno.trim();
      setModal(null);

      // Vínculo opcional: se falhar, o plano já foi criado e o vínculo pode ser feito depois
      if (idProduto && idNovoPlano) {
        try {
          await vincularProdutoExterno(idNovoPlano, idProduto);
          toast.sucesso(`Plano "${nome}" criado e vinculado ao AbacatePay.`);
        } catch (erroVinculo) {
          toast.aviso(
            `Plano "${nome}" criado, mas o vínculo com o AbacatePay falhou: ${mensagemErro(erroVinculo, 'tente de novo.')}`,
            {
              duracao: 10000,
              acao: {
                rotulo: 'Vincular agora',
                onClick: () => setVinculando({ IdPlano: idNovoPlano, Nome: nome, Valor: valor, IdProdutoExterno: null }),
              },
            }
          );
        }
      } else {
        toast.sucesso(`Plano "${nome}" criado.`);
      }
      lista.recarregar();
    } catch (error) {
      setErros({ nome: mensagemErro(error, 'Erro ao salvar plano.') });
    } finally {
      setSalvando(false);
    }
  };

  const mudarStatus = (p) =>
    alternarStatus({
      ativo: !!p.Ativo,
      rotulo: `Plano "${p.Nome}"`,
      desativar: () => desativarPlano(p.IdPlano),
      reativar: () => reativarPlano(p.IdPlano),
    });

  // ---------- Tela ----------
  const botaoNovo = (
    <Button icone={Plus} onClick={abrirCriar}>
      Novo plano
    </Button>
  );

  const renderConteudo = () => {
    if (lista.carregando) return <SkeletonTabela linhas={4} colunas={5} />;

    if (lista.erro && lista.itens.length === 0) {
      return <ErrorState descricao={lista.erro} onTentarNovamente={lista.tentarNovamente} />;
    }

    if (lista.itens.length === 0) {
      return (
        <EmptyState
          icone={BadgeDollarSign}
          titulo="Nenhum plano cadastrado"
          descricao="Crie o plano gratuito e os planos pagos que as oficinas podem assinar."
          acao={botaoNovo}
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Planos"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdPlano"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={ehMaster ? abrirEditar : undefined}
          linhaInativa={(p) => !p.Ativo}
          acoes={(p) => [
            { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(p), oculto: !ehMaster },
            {
              rotulo: p.IdProdutoExterno ? 'Alterar produto AbacatePay' : 'Vincular AbacatePay',
              icone: Link2,
              onClick: () => setVinculando(p),
            },
            {
              rotulo: 'Desativar',
              icone: Power,
              onClick: () => mudarStatus(p),
              perigo: true,
              oculto: !ehMaster || !p.Ativo,
            },
            { rotulo: 'Reativar', icone: RotateCcw, onClick: () => mudarStatus(p), oculto: !ehMaster || !!p.Ativo },
          ]}
          vazio={
            <EmptyState
              icone={BadgeDollarSign}
              titulo="Nenhum plano encontrado"
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
          rotuloItens="planos"
        />
      </>
    );
  };

  return (
    <div>
      <PageHeader
        titulo="Planos"
        subtitulo="Planos que as oficinas assinam. O preço cobrado vem do produto vinculado no AbacatePay."
      />

      {pagosSemVinculo.length > 0 && (
        <Aviso
          tom="aviso"
          titulo={
            pagosSemVinculo.length === 1
              ? `O plano "${pagosSemVinculo[0].Nome}" está sem produto no AbacatePay`
              : `${pagosSemVinculo.length} planos pagos estão sem produto no AbacatePay`
          }
          acao={
            pagosSemVinculo.length === 1 && (
              <Button tamanho="sm" variante="secundario" icone={Link2} onClick={() => setVinculando(pagosSemVinculo[0])}>
                Vincular
              </Button>
            )
          }
        >
          {pagosSemVinculo.length === 1
            ? 'O checkout desse plano não funciona até o produto ser vinculado.'
            : `O checkout não funciona até vincular: ${pagosSemVinculo.map((p) => p.Nome).join(', ')}.`}
        </Aviso>
      )}

      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar plano..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
        acoes={botaoNovo}
      >
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      {modal && (
        <Modal title={modal.editando ? 'Editar plano' : 'Novo plano'} onClose={fecharModal}>
          <form onSubmit={handleSalvar} noValidate>
            <Input
              label="Nome"
              value={form.nome}
              onChange={(e) => mudarCampo('nome', e.target.value)}
              erro={erros.nome}
              placeholder="Ex.: Pro Mensal"
              required
              autoFocus
            />

            {modal.editando ? (
              <Input
                label="Valor"
                value={formatarMoeda(modal.editando.Valor)}
                disabled
                readOnly
                dica="O valor não muda depois de criado. Para mudar o preço, crie um plano novo e desative este."
              />
            ) : (
              <Input
                label="Valor (R$)"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={(e) => mudarCampo('valor', e.target.value)}
                erro={erros.valor}
                placeholder="0,00"
                dica="Só para exibição no app. O preço cobrado vem do produto no AbacatePay. Use 0 para o plano gratuito."
                required
              />
            )}

            <Input
              label="Duração (dias)"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.duracaoDias}
              onChange={(e) => mudarCampo('duracaoDias', e.target.value)}
              erro={erros.duracaoDias}
              placeholder="Ex.: 30 ou 365"
              dica={
                modal.editando
                  ? 'Só afeta novas assinaturas. As ativas mantêm a data de vencimento.'
                  : '30 para mensal, 365 para anual.'
              }
              required
            />

            {!modal.editando && (
              <Input
                label="Id do produto no AbacatePay"
                value={form.idProdutoExterno}
                onChange={(e) => mudarCampo('idProdutoExterno', e.target.value)}
                placeholder="Opcional: pode vincular depois"
                dica="Necessário para planos pagos. Copie do painel do AbacatePay."
              />
            )}

            <div className="form-actions">
              <Button variante="secundario" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" carregando={salvando} disabled={!alterado}>
                {modal.editando ? 'Salvar' : 'Criar plano'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {vinculando && (
        <VincularProdutoModal
          plano={vinculando}
          onClose={() => setVinculando(null)}
          onSalvo={() => {
            setVinculando(null);
            lista.recarregar();
          }}
        />
      )}
    </div>
  );
};

export default PlanosPage;