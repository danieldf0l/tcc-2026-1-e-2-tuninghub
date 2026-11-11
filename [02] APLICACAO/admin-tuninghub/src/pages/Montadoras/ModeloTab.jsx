import { useCallback, useMemo, useState } from 'react';
import { CarFront, Pencil, Plus, Power, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useListaCatalogo } from '../../hooks/useListaCatalogo';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
import { mensagemErro } from '../../utils/erroApi';
import { contem } from '../../utils/texto';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import BarraFiltros, { FiltroSelect, FiltroStatus } from '../../components/ui/BarraFiltros';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Campo';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { listarMontadorasAtivas } from '../../api/montadoraService';
import {
  listarModelosAdmin,
  criarModelo,
  atualizarModelo,
  desativarModelo,
  reativarModelo,
} from '../../api/modeloService';

const COLUNAS = [
  { chave: 'Modelo', titulo: 'Modelo' },
  { chave: 'Montadora', titulo: 'Montadora' },
  {
    chave: 'Ativo',
    titulo: 'Status',
    valorOrdenacao: (m) => (m.Ativo ? 1 : 0),
    render: (m) => <StatusBadge status={m.Ativo ? 'ativo' : 'inativo'} />,
  },
];

const filtrar = (m, { termo, montadora }) =>
  (contem(m.Modelo, termo) || contem(m.Montadora, termo)) &&
  (!montadora || String(m.IdMontadora) === montadora);

const ModeloTab = () => {
  const { admin } = useAuth();
  const ehMaster = admin?.role === 'ADMIN_MASTER';
  const toast = useToast();
  const podeDescartar = useConfirmarDescarte();

  const [montadorasAtivas, setMontadorasAtivas] = useState([]);

  const carregar = useCallback(async () => {
    const [dadosModelos, dadosMontadoras] = await Promise.all([listarModelosAdmin(), listarMontadorasAtivas()]);
    setMontadorasAtivas(dadosMontadoras);
    return dadosModelos;
  }, []);

  const lista = useListaCatalogo({
    carregar,
    filtrar,
    colunas: COLUNAS,
    ordenacaoPadrao: { chave: 'Modelo', direcao: 'asc' },
    porPagina: 20,
    filtrosExtras: { montadora: '' },
  });

  // Montadoras que aparecem nos modelos (inclui inativas), para o filtro
  const montadorasDoFiltro = useMemo(() => {
    const mapa = new Map();
    lista.itens.forEach((m) => mapa.set(m.IdMontadora, m.Montadora));
    return [...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  }, [lista.itens]);

  // ---------- Criar / editar ----------
  const [modal, setModal] = useState(null); // null | { editando: modelo | null }
  const [nome, setNome] = useState('');
  const [idMontadora, setIdMontadora] = useState('');
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const alterado =
    !!modal &&
    (modal.editando
      ? nome.trim() !== modal.editando.Modelo
      : nome.trim() !== '' || String(idMontadora) !== String(modal.montadoraInicial));

  const abrirCriar = () => {
    // Se a lista está filtrada por uma montadora ativa, ela já vem escolhida
    const filtrada = montadorasAtivas.find((m) => String(m.IdMontadora) === lista.filtros.montadora);
    const inicial = filtrada?.IdMontadora ?? montadorasAtivas[0]?.IdMontadora ?? '';
    setModal({ editando: null, montadoraInicial: inicial });
    setNome('');
    setIdMontadora(inicial);
    setErros({});
  };

  const abrirEditar = (modelo) => {
    setModal({ editando: modelo });
    setNome(modelo.Modelo);
    setIdMontadora(modelo.IdMontadora);
    setErros({});
  };

  const fecharModal = async () => {
    if (await podeDescartar(alterado)) setModal(null);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    const novos = {};
    if (!nomeLimpo) novos.nome = 'Informe o nome do modelo.';
    if (!modal.editando && !idMontadora) novos.montadora = 'Escolha a montadora.';
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvando(true);
    try {
      if (modal.editando) {
        await atualizarModelo(modal.editando.IdModelo, nomeLimpo);
        toast.sucesso(`Modelo "${nomeLimpo}" atualizado.`);
      } else {
        await criarModelo(idMontadora, nomeLimpo);
        toast.sucesso(`Modelo "${nomeLimpo}" criado.`);
      }
      setModal(null);
      lista.recarregar();
    } catch (error) {
      setErros({ nome: mensagemErro(error, 'Erro ao salvar modelo.') });
    } finally {
      setSalvando(false);
    }
  };

  // ---------- Desativar / reativar com "Desfazer" ----------
  const alternarStatus = async (modelo, desfazendo = false) => {
    const desativando = !!modelo.Ativo;
    try {
      if (desativando) await desativarModelo(modelo.IdModelo);
      else await reativarModelo(modelo.IdModelo);
      await lista.recarregar();

      if (desfazendo) {
        toast.info('Alteração desfeita.');
        return;
      }
      toast.sucesso(`Modelo "${modelo.Modelo}" ${desativando ? 'desativado' : 'reativado'}.`, {
        acao: {
          rotulo: 'Desfazer',
          onClick: () => alternarStatus({ ...modelo, Ativo: desativando ? 0 : 1 }, true),
        },
      });
    } catch (error) {
      toast.erro(mensagemErro(error, 'Erro ao alterar o status do modelo.'));
    }
  };

  // ---------- Tela ----------
  const semMontadoraAtiva = montadorasAtivas.length === 0;
  const botaoNovo = (
    <Button
      icone={Plus}
      onClick={abrirCriar}
      disabled={lista.carregando || semMontadoraAtiva}
      title={semMontadoraAtiva ? 'Cadastre uma montadora ativa antes de criar modelos.' : undefined}
    >
      Novo modelo
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
          icone={CarFront}
          titulo="Nenhum modelo cadastrado"
          descricao={
            semMontadoraAtiva
              ? 'Cadastre uma montadora ativa antes de criar modelos.'
              : 'Cadastre o primeiro modelo para ele aparecer no app.'
          }
          acao={!semMontadoraAtiva && botaoNovo}
        />
      );
    }

    return (
      <>
        <DataTable
          rotulo="Modelos"
          colunas={COLUNAS}
          dados={lista.itensPagina}
          chaveLinha="IdModelo"
          ordenacao={lista.ordenacao}
          onOrdenar={lista.setOrdenacao}
          onLinhaClick={ehMaster ? abrirEditar : undefined}
          linhaInativa={(m) => !m.Ativo}
          acoes={
            ehMaster
              ? (m) => [
                  { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(m) },
                  { rotulo: 'Desativar', icone: Power, onClick: () => alternarStatus(m), perigo: true, oculto: !m.Ativo },
                  { rotulo: 'Reativar', icone: RotateCcw, onClick: () => alternarStatus(m), oculto: !!m.Ativo },
                ]
              : undefined
          }
          vazio={
            <EmptyState
              icone={CarFront}
              titulo="Nenhum modelo encontrado"
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
          rotuloItens="modelos"
        />
      </>
    );
  };

  return (
    <div>
      <BarraFiltros
        busca={lista.busca}
        onBusca={lista.setBusca}
        placeholder="Buscar modelo ou montadora..."
        filtrosAtivos={lista.filtrosAtivos}
        onLimpar={lista.limparFiltros}
        acoes={botaoNovo}
      >
        <FiltroSelect
          rotulo="Montadora"
          valor={lista.filtros.montadora}
          onChange={(v) => lista.mudarFiltro('montadora', v)}
        >
          <option value="">Todas as montadoras</option>
          {montadorasDoFiltro.map(([id, nomeMontadora]) => (
            <option key={id} value={String(id)}>
              {nomeMontadora}
            </option>
          ))}
        </FiltroSelect>
        <FiltroStatus valor={lista.filtros.status} onChange={(v) => lista.mudarFiltro('status', v)} />
      </BarraFiltros>

      {renderConteudo()}

      {modal && (
        <Modal title={modal.editando ? 'Editar modelo' : 'Novo modelo'} onClose={fecharModal}>
          <form onSubmit={handleSalvar} noValidate>
            {modal.editando ? (
              <Input
                label="Montadora"
                value={modal.editando.Montadora}
                disabled
                readOnly
                dica="A montadora não muda depois que o modelo é criado."
              />
            ) : (
              <Select
                label="Montadora"
                value={idMontadora}
                onChange={(e) => {
                  setIdMontadora(e.target.value);
                  setErros((atual) => ({ ...atual, montadora: undefined }));
                }}
                erro={erros.montadora}
                required
              >
                {montadorasAtivas.map((mo) => (
                  <option key={mo.IdMontadora} value={mo.IdMontadora}>
                    {mo.Nome}
                  </option>
                ))}
              </Select>
            )}

            <Input
              label="Nome do modelo"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErros((atual) => ({ ...atual, nome: undefined }));
              }}
              erro={erros.nome}
              placeholder="Ex.: Golf GTI"
              required
              autoFocus
            />

            <div className="form-actions">
              <Button variante="secundario" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" carregando={salvando} disabled={!alterado || !nome.trim()}>
                {modal.editando ? 'Salvar' : 'Criar modelo'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ModeloTab;