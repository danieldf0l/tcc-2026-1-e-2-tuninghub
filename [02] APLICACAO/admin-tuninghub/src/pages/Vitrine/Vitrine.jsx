import { useEffect, useMemo, useState } from 'react';
import { Car, Pencil, Plus, Power, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useFiltrosUrl } from '../../hooks/useFiltrosUrl';
import { useAlteracoesNaoSalvas } from '../../hooks/useAlteracoesNaoSalvas';
import { ordenarDados } from '../../utils/ordenarDados';
import { Logo, LogoIcone } from '../../components/ui/Logo';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Campo';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { SkeletonCards, SkeletonTabela } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

/*
  Vitrine de componentes. Só existe em "npm run dev" (rota /_ui).
  Não entra no build de produção.
*/

const MONTADORAS = ['Volkswagen', 'Chevrolet', 'Fiat', 'Honda', 'Toyota'];
const NOMES = ['Golf GTI', 'Onix', 'Uno', 'Civic Si', 'Corolla', 'Jetta', 'Cruze', 'Argo', 'Fit', 'Supra', 'Polo', 'Celta'];
const MODELOS_FALSOS = Array.from({ length: 24 }, (_, i) => ({
  IdModelo: i + 1,
  Modelo: `${NOMES[i % NOMES.length]}${i >= NOMES.length ? ' II' : ''}`,
  Montadora: MONTADORAS[i % MONTADORAS.length],
  Ativo: i % 5 !== 3 ? 1 : 0,
}));

const COLUNAS = [
  { chave: 'Modelo', titulo: 'Modelo' },
  { chave: 'Montadora', titulo: 'Montadora' },
  {
    chave: 'Ativo',
    titulo: 'Status',
    render: (m) => <StatusBadge status={m.Ativo ? 'ativo' : 'inativo'} />,
  },
];

const POR_PAGINA = 8;

const Secao = ({ titulo, children }) => (
  <section style={{ marginBottom: 'var(--space-10)' }}>
    <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>{titulo}</h2>
    {children}
  </section>
);

const linha = { display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' };

const Vitrine = () => {
  const { tema, modo, definirModo } = useTheme();
  const toast = useToast();
  const confirmar = useConfirm();
  const [resposta, setResposta] = useState('—');
  const [aba, setAba] = useState('modelos');

  // ---------- Tabela com filtros na URL ----------
  const [modelos, setModelos] = useState(MODELOS_FALSOS);
  const [filtros, setFiltros] = useFiltrosUrl({ busca: '', status: 'todos', pagina: '1' });
  const [busca, setBusca] = useState(filtros.busca);
  const buscaAdiada = useDebounce(busca, 300);
  const [ordenacao, setOrdenacao] = useState({ chave: 'Modelo', direcao: 'asc' });

  useEffect(() => {
    if (buscaAdiada !== filtros.busca) setFiltros({ busca: buscaAdiada, pagina: '1' });
  }, [buscaAdiada, filtros.busca, setFiltros]);

  const filtrados = useMemo(() => {
    const termo = filtros.busca.toLowerCase();
    return modelos.filter((m) => {
      const passaBusca = m.Modelo.toLowerCase().includes(termo) || m.Montadora.toLowerCase().includes(termo);
      const passaStatus =
        filtros.status === 'todos' ? true : filtros.status === 'ativos' ? !!m.Ativo : !m.Ativo;
      return passaBusca && passaStatus;
    });
  }, [modelos, filtros.busca, filtros.status]);

  const ordenados = ordenarDados(filtrados, COLUNAS, ordenacao);
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const pagina = Math.min(Number(filtros.pagina) || 1, totalPaginas);
  const itensPagina = ordenados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const alternarStatus = (modelo) => {
    const trocar = () =>
      setModelos((lista) => lista.map((m) => (m.IdModelo === modelo.IdModelo ? { ...m, Ativo: m.Ativo ? 0 : 1 } : m)));
    trocar();
    toast.sucesso(`Modelo "${modelo.Modelo}" ${modelo.Ativo ? 'desativado' : 'reativado'}.`, {
      acao: { rotulo: 'Desfazer', onClick: trocar },
    });
  };

  // ---------- Drawer com formulário ----------
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ Modelo: '', Montadora: '' });
  const [erroNome, setErroNome] = useState('');
  const alterado = !!editando && (form.Modelo !== editando.Modelo || form.Montadora !== editando.Montadora);
  useAlteracoesNaoSalvas(alterado);

  const abrirEditar = (m) => {
    setEditando(m);
    setForm({ Modelo: m.Modelo, Montadora: m.Montadora });
    setErroNome('');
  };

  const fecharDrawer = async () => {
    if (alterado) {
      const sair = await confirmar({
        titulo: 'Descartar alterações?',
        mensagem: 'As mudanças feitas neste modelo serão perdidas.',
        textoConfirmar: 'Descartar',
        textoCancelar: 'Continuar editando',
        perigo: true,
      });
      if (!sair) return;
    }
    setEditando(null);
  };

  const salvar = (e) => {
    e.preventDefault();
    if (form.Modelo.trim().length < 2) {
      setErroNome('Informe pelo menos 2 caracteres.');
      return;
    }
    setModelos((lista) => lista.map((m) => (m.IdModelo === editando.IdModelo ? { ...m, ...form } : m)));
    setEditando(null);
    toast.sucesso('Modelo salvo.');
  };

  const testarConfirmar = async (perigo) => {
    const ok = await confirmar(
      perigo
        ? {
            titulo: 'Desativar "Volkswagen"?',
            mensagem: 'Todos os modelos dessa montadora também serão desativados.',
            textoConfirmar: 'Desativar',
            perigo: true,
          }
        : { titulo: 'Reativar "Volkswagen"?', textoConfirmar: 'Reativar' }
    );
    setResposta(ok ? 'confirmou' : 'cancelou');
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <PageHeader
        titulo="Vitrine de componentes"
        subtitulo={`Tema: ${modo} (aplicado: ${tema})`}
        acoes={
          <>
            <Button variante="secundario" tamanho="sm" onClick={() => definirModo('light')}>Claro</Button>
            <Button variante="secundario" tamanho="sm" onClick={() => definirModo('dark')}>Escuro</Button>
            <Button variante="secundario" tamanho="sm" onClick={() => definirModo('system')}>Sistema</Button>
          </>
        }
      >
        <Tabs
          abas={[
            { id: 'modelos', rotulo: 'Modelos', contador: modelos.length },
            { id: 'montadoras', rotulo: 'Montadoras', icone: Car },
          ]}
          ativa={aba}
          onChange={setAba}
        />
      </PageHeader>

      <Secao titulo="Tabela (busca e status ficam na URL; clique na linha abre o drawer)">
        <div style={{ ...linha, marginBottom: 'var(--space-4)' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Input
              type="search"
              icone={Search}
              placeholder="Buscar modelo ou montadora..."
              aria-label="Buscar"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              semMargem
            />
          </div>
          <div style={{ width: 160 }}>
            <Select
              aria-label="Status"
              value={filtros.status}
              onChange={(e) => setFiltros({ status: e.target.value, pagina: '1' })}
              semMargem
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </Select>
          </div>
          <Button icone={Plus}>Novo modelo</Button>
        </div>

        <DataTable
          rotulo="Modelos"
          colunas={COLUNAS}
          dados={itensPagina}
          chaveLinha="IdModelo"
          ordenacao={ordenacao}
          onOrdenar={setOrdenacao}
          onLinhaClick={abrirEditar}
          linhaInativa={(m) => !m.Ativo}
          acoes={(m) => [
            { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(m) },
            { rotulo: 'Desativar', icone: Power, onClick: () => alternarStatus(m), perigo: true, oculto: !m.Ativo },
            { rotulo: 'Reativar', icone: RotateCcw, onClick: () => alternarStatus(m), oculto: !!m.Ativo },
          ]}
          vazio={
            <EmptyState
              icone={Car}
              titulo="Nenhum modelo encontrado"
              descricao="Tente outra busca ou mude o filtro de status."
              acao={
                <Button variante="secundario" onClick={() => { setBusca(''); setFiltros({ busca: '', status: 'todos', pagina: '1' }); }}>
                  Limpar filtros
                </Button>
              }
            />
          }
        />
        <Pagination paginaAtual={pagina} totalPaginas={totalPaginas} onChange={(p) => setFiltros({ pagina: p })} />
      </Secao>

      <Secao titulo="Botões">
        <div style={linha}>
          <Button>Primário</Button>
          <Button variante="secundario">Secundário</Button>
          <Button variante="fantasma">Fantasma</Button>
          <Button variante="perigo" icone={Trash2}>Perigo</Button>
          <Button carregando>Salvando</Button>
          <Button disabled>Desabilitado</Button>
          <Button tamanho="sm" icone={Plus}>Pequeno</Button>
          <IconButton icone={Pencil} rotulo="Editar" />
          <IconButton icone={Trash2} rotulo="Excluir" variante="perigo" />
        </div>
      </Secao>

      <Secao titulo="Campos">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input label="Nome" placeholder="Ex.: Golf GTI" required />
          <Input label="Com erro" defaultValue="G" erro="Informe pelo menos 2 caracteres." />
          <Select label="Montadora" defaultValue="">
            <option value="" disabled>Selecione</option>
            {MONTADORAS.map((m) => <option key={m}>{m}</option>)}
          </Select>
          <Input label="Desabilitado" value="Volkswagen" disabled dica="A montadora não muda depois de criar." readOnly />
          <Textarea label="Descrição" placeholder="Opcional" />
        </div>
      </Secao>

      <Secao titulo="Badges">
        <div style={linha}>
          {['ativo', 'inativa', 'PENDENTE', 'ATIVA', 'EXPIRADA', 'CANCELADA', 'vinculado', 'nao_vinculado'].map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
          <Badge tom="primario">Pro</Badge>
          <Badge>$$</Badge>
        </div>
      </Secao>

      <Secao titulo="Logo">
        <div style={linha}>
          <LogoIcone />
          <LogoIcone variante="auto" />
          <Logo tamanho={32} />
          <Logo variante="marca" tamanho={32} />
        </div>
      </Secao>

      <Secao titulo="Toast">
        <div style={linha}>
          <Button variante="secundario" onClick={() => toast.sucesso('Modelo salvo.')}>Sucesso</Button>
          <Button variante="secundario" onClick={() => toast.erro('Já existe um modelo com esse nome.')}>Erro</Button>
          <Button variante="secundario" onClick={() => toast.aviso('A montadora está inativa.')}>Aviso</Button>
          <Button variante="secundario" onClick={() => toast.info('Nenhuma alteração para salvar.')}>Info</Button>
        </div>
      </Secao>

      <Secao titulo={`Diálogo de confirmação (última resposta: ${resposta})`}>
        <div style={linha}>
          <Button variante="secundario" onClick={() => testarConfirmar(false)}>Normal</Button>
          <Button variante="secundario" onClick={() => testarConfirmar(true)}>Perigo</Button>
        </div>
      </Secao>

      <Secao titulo="Skeleton">
        <SkeletonCards quantidade={4} />
        <div style={{ height: 'var(--space-4)' }} />
        <SkeletonTabela linhas={4} colunas={4} />
      </Secao>

      <Secao titulo="Estado vazio e erro">
        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: '1fr 1fr' }}>
          <EmptyState
            icone={Car}
            titulo="Nenhum modelo cadastrado"
            descricao="Cadastre o primeiro modelo para ele aparecer no app."
            acao={<Button icone={Plus}>Novo modelo</Button>}
          />
          <ErrorState onTentarNovamente={() => toast.info('Tentando de novo...')} />
        </div>
      </Secao>

      <Drawer
        aberto={!!editando}
        onFechar={fecharDrawer}
        titulo={editando?.Modelo}
        subtitulo={editando?.Montadora}
        acoesCabecalho={editando && <StatusBadge status={editando.Ativo ? 'ativo' : 'inativo'} />}
        rodape={
          <>
            <Button variante="secundario" onClick={fecharDrawer}>Cancelar</Button>
            <Button type="submit" form="form-vitrine" disabled={!alterado}>Salvar</Button>
          </>
        }
      >
        <form id="form-vitrine" onSubmit={salvar} noValidate>
          <Input
            label="Nome"
            value={form.Modelo}
            onChange={(e) => {
              setForm({ ...form, Modelo: e.target.value });
              setErroNome('');
            }}
            erro={erroNome}
            required
            autoFocus
          />
          <Select label="Montadora" value={form.Montadora} onChange={(e) => setForm({ ...form, Montadora: e.target.value })}>
            {MONTADORAS.map((m) => <option key={m}>{m}</option>)}
          </Select>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Salvar só habilita quando algo mudou. Esc, X ou clique fora com alterações perguntam antes de fechar.
          </p>
        </form>
      </Drawer>
    </div>
  );
};

export default Vitrine;