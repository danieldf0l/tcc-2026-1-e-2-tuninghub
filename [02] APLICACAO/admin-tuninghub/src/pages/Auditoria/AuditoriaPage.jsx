import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFiltrosUrl } from '../../hooks/useFiltrosUrl';
import { mensagemErro } from '../../utils/erroApi';
import { dataIso, formatarDataHora, iniciais, tempoRelativo } from '../../utils/formatadores';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import { FiltroSelect } from '../../components/ui/BarraFiltros';
import { Button, IconButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Campo';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { listarAdmins, listarLogs } from '../../api/adminService';
import { ENTIDADES, descreverAcao, rotuloReferencia } from './auditoriaUtils';
import '../../components/ui/BarraFiltros.css';
import './Auditoria.css';

const POR_PAGINA = 25;

const PADROES = { admin: '', entidade: '', periodo: '', de: '', ate: '', pagina: '1' };

// Aceitam tanto a resposta do axios quanto o dado direto
const paginaDe = (resposta) => (resposta?.itens ? resposta : resposta?.data);
const listaDe = (resposta) => (Array.isArray(resposta) ? resposta : resposta?.data || []);

// Período escolhido -> datas que vão para a API (AAAA-MM-DD)
const intervalo = ({ periodo, de, ate }) => {
  if (periodo === 'personalizado') return { de, ate };
  if (!periodo) return { de: '', ate: '' };
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - (Number(periodo) - 1));
  return { de: dataIso(inicio), ate: dataIso() };
};

const COLUNAS = [
  {
    chave: 'DataAcao',
    titulo: 'Quando',
    largura: '170px',
    ordenavel: false,
    render: (l) => (
      <>
        {formatarDataHora(l.DataAcao)}
        <span className="celula-nota">{tempoRelativo(l.DataAcao)}</span>
      </>
    ),
  },
  {
    chave: 'NomeAdmin',
    titulo: 'Administrador',
    largura: '220px',
    ordenavel: false,
    render: (l) => (
      <div className="celula-avatar">
        <span className="celula-avatar__iniciais" aria-hidden="true">
          {iniciais(l.NomeAdmin)}
        </span>
        <span className="celula-dupla__principal">{l.NomeAdmin || `Admin #${l.IdAdmin}`}</span>
      </div>
    ),
  },
  {
    chave: 'Acao',
    titulo: 'Ação',
    ordenavel: false,
    render: (l) => {
      const { verbo, objeto, tom } = descreverAcao(l.Acao);
      return (
        <span className="log-acao" title={l.Acao}>
          <Badge tom={tom}>{verbo}</Badge>
          <span>{objeto}</span>
        </span>
      );
    },
  },
  {
    chave: 'IdReferencia',
    titulo: 'Item',
    largura: '150px',
    ordenavel: false,
    render: (l) => {
      const rotulo = rotuloReferencia(l);
      if (!rotulo) return <span style={{ color: 'var(--text-secondary)' }}>—</span>;
      if (l.Entidade === 'oficina') {
        return (
          <Link className="log-link" to={`/oficinas?oficina=${l.IdReferencia}`}>
            {rotulo}
          </Link>
        );
      }
      return rotulo;
    },
  },
];

const AuditoriaPage = () => {
  const { admin: logado } = useAuth();
  const ehMaster = logado?.role === 'ADMIN_MASTER';

  const [filtros, setFiltros] = useFiltrosUrl(PADROES);
  const [admins, setAdmins] = useState([]);
  const [resultado, setResultado] = useState(null); // { chave, dados, erro }
  const [tentativa, setTentativa] = useState(0);

  const { de, ate } = intervalo(filtros);
  const pagina = Math.max(Number(filtros.pagina) || 1, 1);

  // Parâmetros que vão para GET /api/admin/logs (sem valores vazios)
  const consulta = useMemo(() => {
    const p = { pagina, limite: POR_PAGINA };
    if (filtros.admin) p.idAdmin = filtros.admin;
    if (filtros.entidade) p.entidade = filtros.entidade;
    if (de) p.de = de;
    if (ate) p.ate = ate;
    return p;
  }, [pagina, filtros.admin, filtros.entidade, de, ate]);

  const chave = `${JSON.stringify(consulta)}|${tentativa}`;
  const carregando = !resultado || resultado.chave !== chave;

  useEffect(() => {
    if (!ehMaster) return;
    listarLogs(consulta)
      .then((resposta) => setResultado({ chave, dados: paginaDe(resposta), erro: '' }))
      .catch((error) =>
        setResultado({ chave, dados: null, erro: mensagemErro(error, 'Não foi possível carregar a auditoria.') })
      );
  }, [chave, consulta, ehMaster]);

  // Lista de admins para o filtro (falhar aqui não impede a tela)
  useEffect(() => {
    if (!ehMaster) return;
    listarAdmins()
      .then((resposta) => {
        setAdmins([...listaDe(resposta)].sort((a, b) => a.Nome.localeCompare(b.Nome, 'pt-BR')));
      })
      .catch(() => {});
  }, [ehMaster]);

  const mudar = (novos) => setFiltros({ ...novos, pagina: '1' });

  const mudarPeriodo = (periodo) => {
    if (periodo === 'personalizado') mudar({ periodo, de: de || dataIso(), ate: ate || dataIso() });
    else mudar({ periodo, de: '', ate: '' });
  };

  const filtrosAtivos = !!(filtros.admin || filtros.entidade || filtros.periodo);
  const limpar = () => setFiltros({ ...PADROES });

  if (!ehMaster) {
    return (
      <div>
        <PageHeader titulo="Auditoria" />
        <EmptyState icone={Lock} titulo="Acesso restrito" descricao="Só o Admin Master pode ver a auditoria do painel." />
      </div>
    );
  }

  const dados = resultado?.dados;
  const itens = dados?.itens || [];
  const total = dados?.total ?? 0;
  const totalPaginas = Math.max(dados?.totalPaginas || 1, 1);

  const renderConteudo = () => {
    // Primeira carga: skeleton. Nas próximas, mantém a tabela antiga até chegar a nova.
    if (carregando && !dados) return <SkeletonTabela linhas={10} colunas={4} />;

    if (resultado?.erro && !dados) {
      return <ErrorState descricao={resultado.erro} onTentarNovamente={() => setTentativa((t) => t + 1)} />;
    }

    return (
      <div className={carregando ? 'auditoria--atualizando' : undefined} aria-busy={carregando}>
        <DataTable
          rotulo="Registros de auditoria"
          colunas={COLUNAS}
          dados={itens}
          chaveLinha="IdLog"
          vazio={
            filtrosAtivos ? (
              <EmptyState
                icone={History}
                titulo="Nenhum registro nesse filtro"
                descricao="Tente outro admin, outra área ou um período maior."
                acao={
                  <Button variante="secundario" onClick={limpar}>
                    Limpar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icone={History}
                titulo="Nenhum registro ainda"
                descricao="As ações dos administradores aparecem aqui assim que acontecem."
              />
            )
          }
        />
        <Pagination
          paginaAtual={Math.min(pagina, totalPaginas)}
          totalPaginas={totalPaginas}
          onChange={(p) => setFiltros({ pagina: String(p) })}
          totalItens={total}
          porPagina={POR_PAGINA}
          rotuloItens="registros"
        />
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        titulo="Auditoria"
        subtitulo="Quem fez o quê no painel, do mais recente para o mais antigo."
        acoes={
          <IconButton
            icone={RefreshCw}
            rotulo="Atualizar"
            variante="secundario"
            onClick={() => setTentativa((t) => t + 1)}
            disabled={carregando}
          />
        }
      />

      <div className="barra-filtros">
        <FiltroSelect rotulo="Administrador" valor={filtros.admin} onChange={(v) => mudar({ admin: v })}>
          <option value="">Todos os admins</option>
          {admins.map((a) => (
            <option key={a.IdAdmin} value={String(a.IdAdmin)}>
              {a.Nome}
            </option>
          ))}
        </FiltroSelect>

        <FiltroSelect rotulo="Área" valor={filtros.entidade} onChange={(v) => mudar({ entidade: v })}>
          <option value="">Todas as áreas</option>
          {ENTIDADES.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.rotulo}
            </option>
          ))}
        </FiltroSelect>

        <FiltroSelect rotulo="Período" valor={filtros.periodo} onChange={mudarPeriodo}>
          <option value="">Qualquer data</option>
          <option value="1">Hoje</option>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="personalizado">Escolher datas...</option>
        </FiltroSelect>

        {filtros.periodo === 'personalizado' && (
          <div className="auditoria__datas">
            <Input
              type="date"
              aria-label="De"
              value={filtros.de}
              max={filtros.ate || undefined}
              onChange={(e) => mudar({ de: e.target.value })}
              semMargem
            />
            <span className="auditoria__ate">até</span>
            <Input
              type="date"
              aria-label="Até"
              value={filtros.ate}
              min={filtros.de || undefined}
              onChange={(e) => mudar({ ate: e.target.value })}
              semMargem
            />
          </div>
        )}

        {filtrosAtivos && (
          <Button variante="fantasma" onClick={limpar}>
            Limpar
          </Button>
        )}
      </div>

      {renderConteudo()}
    </div>
  );
};

export default AuditoriaPage;