import { useCallback, useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  Car,
  CarFront,
  Clock,
  FolderKanban,
  Receipt,
  RotateCw,
  Store,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFiltrosUrl } from '../../hooks/useFiltrosUrl';
import { mensagemErro } from '../../utils/erroApi';
import PageHeader from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import KpiCard from '../../components/ui/KpiCard';
import { GraficoBarras, GraficoColunas } from '../../components/ui/Graficos';
import { Skeleton, SkeletonCards } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { listarOficinasAdmin } from '../../api/oficinaService';
import { listarUsuariosAdmin } from '../../api/usuarioService';
import { listarAssinaturasAdmin } from '../../api/assinaturaService';
import { listarServicosAdmin } from '../../api/servicoService';
import { listarMontadorasAdmin } from '../../api/montadoraService';
import { listarModelosAdmin } from '../../api/modeloService';
import { listarPlanosAdmin } from '../../api/planoService';
import { listarAdmins } from '../../api/adminService';
import { listarProjetosAdmin } from '../../api/projetoService';
import './Dashboard.css';

// ---------- Cálculos (feitos no front, como antes: nenhum endpoint novo) ----------

const ROTULOS = {
  TipoCustomizacao: { ESTILO: 'Por estilo', PERSONALIZADA: 'Personalizada' },
  NivelAcesso: { SUPER: 'Master', PADRAO: 'Padrão' },
};

// "OFF_ROAD" -> "Off Road" (estilos vêm como código)
const humanizar = (codigo) =>
  String(codigo)
    .toLowerCase()
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

const contarPor = (lista, campo, { rotuloVazio = 'Não definido', traduzir } = {}) => {
  const contagem = {};
  lista.forEach((item) => {
    const bruto = item[campo];
    const chave = bruto ? (traduzir ? traduzir(bruto) : bruto) : rotuloVazio;
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  return Object.entries(contagem)
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor);
};

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarNumero = (n) => Number(n || 0).toLocaleString('pt-BR');

const ultimosNMeses = (n) => {
  const meses = [];
  const hoje = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push({
      chave: `${d.getFullYear()}-${d.getMonth()}`,
      // "jun/26"
      rotulo: `${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}/${String(d.getFullYear()).slice(-2)}`,
    });
  }
  return meses;
};

const cadastrosPorMes = (usuarios, oficinas, n) => {
  const meses = ultimosNMeses(n);
  const contagem = {};
  meses.forEach((m) => {
    contagem[m.chave] = { usuarios: 0, oficinas: 0 };
  });

  const somar = (lista, tipo) => {
    lista.forEach((item) => {
      if (!item.DataCriacao) return;
      const d = new Date(item.DataCriacao);
      const chave = `${d.getFullYear()}-${d.getMonth()}`;
      if (contagem[chave]) contagem[chave][tipo] += 1;
    });
  };
  somar(usuarios, 'usuarios');
  somar(oficinas, 'oficinas');

  return meses.map((m) => {
    const { usuarios: u, oficinas: o } = contagem[m.chave];
    return { rotulo: m.rotulo, valor: u + o, usuarios: u, oficinas: o, detalhe: `${u} usuários · ${o} oficinas` };
  });
};

const PERIODOS = ['3', '6', '12'];

// Mesmas chamadas de antes, em paralelo
const buscarDados = async () => {
  const [oficinas, usuarios, assinaturas, servicos, montadoras, modelos, planos, admins, projetos] =
    await Promise.all([
      listarOficinasAdmin(),
      listarUsuariosAdmin(),
      listarAssinaturasAdmin(),
      listarServicosAdmin(),
      listarMontadorasAdmin(),
      listarModelosAdmin(),
      listarPlanosAdmin(),
      listarAdmins(),
      listarProjetosAdmin(),
    ]);
  return { oficinas, usuarios, assinaturas, servicos, montadoras, modelos, planos, admins, projetos };
};

// ---------- Tela ----------

const DashboardCarregando = () => (
  <>
    <SkeletonCards quantidade={8} />
    <div className="dashboard__graficos dashboard__graficos--carregando">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`grafico${i === 0 ? ' dashboard__destaque' : ''}`}>
          <Skeleton largura="40%" altura={14} />
          <div style={{ height: 'var(--space-5)' }} />
          <Skeleton largura="100%" altura={i === 0 ? 180 : 110} raio="var(--radius-md)" />
        </div>
      ))}
    </div>
  </>
);

const Dashboard = () => {
  const { admin } = useAuth();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [atualizando, setAtualizando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [filtros, setFiltros] = useFiltrosUrl({ meses: '6' });
  const meses = PERIODOS.includes(filtros.meses) ? Number(filtros.meses) : 6;

  // Resultado da busca (sucesso ou erro) vai para o estado num lugar só
  const aplicarResultado = useCallback((promessa) => {
    promessa
      .then((novos) => {
        setDados(novos);
        setErro('');
        setAtualizadoEm(new Date());
      })
      .catch((error) => setErro(mensagemErro(error, 'Não foi possível carregar os dados do painel.')))
      .finally(() => setAtualizando(false));
  }, []);

  useEffect(() => {
    aplicarResultado(buscarDados());
  }, [aplicarResultado]);

  const recarregar = () => {
    setAtualizando(true);
    setErro('');
    aplicarResultado(buscarDados());
  };

  const primeiroNome = admin?.nome?.split(' ')[0] || '';
  const subtitulo = atualizadoEm
    ? `Visão geral da plataforma · atualizado às ${atualizadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : 'Visão geral da plataforma';

  const cabecalho = (
    <PageHeader
      titulo={`Olá, ${primeiroNome}`}
      subtitulo={subtitulo}
      acoes={
        dados && (
          <Button variante="secundario" icone={RotateCw} carregando={atualizando} onClick={recarregar}>
            Atualizar
          </Button>
        )
      }
    />
  );

  // Erro sem nenhum dado ainda: tela de erro com "Tentar de novo"
  if (erro && !dados) {
    return (
      <div>
        {cabecalho}
        <ErrorState descricao={erro} onTentarNovamente={recarregar} />
      </div>
    );
  }

  if (!dados) {
    return (
      <div>
        {cabecalho}
        <DashboardCarregando />
      </div>
    );
  }

  const { oficinas, usuarios, assinaturas, servicos, montadoras, modelos, planos, admins, projetos } = dados;

  const oficinasAtivas = oficinas.filter((o) => o.Ativo).length;
  const usuariosAtivos = usuarios.filter((u) => u.Ativo).length;
  const assinaturasAtivas = assinaturas.filter((a) => a.Status === 'ATIVA').length;
  const assinaturasPendentes = assinaturas.filter((a) => a.Status === 'PENDENTE').length;
  const montadorasAtivas = montadoras.filter((m) => m.Ativo).length;
  const modelosAtivos = modelos.filter((m) => m.Ativo).length;

  const mapaValorPlano = {};
  planos.forEach((p) => {
    mapaValorPlano[p.Nome] = Number(p.Valor);
  });
  const receitaRecorrente = assinaturas
    .filter((a) => a.Status === 'ATIVA')
    .reduce((soma, a) => soma + (mapaValorPlano[a.NomePlano] || 0), 0);

  const novosCadastros = cadastrosPorMes(usuarios, oficinas, meses);
  const totalUsuariosPeriodo = novosCadastros.reduce((s, m) => s + m.usuarios, 0);
  const totalOficinasPeriodo = novosCadastros.reduce((s, m) => s + m.oficinas, 0);

  const seletorPeriodo = (
    <div className="seletor-periodo" role="group" aria-label="Período">
      {PERIODOS.map((p) => (
        <button
          key={p}
          type="button"
          className={`seletor-periodo__opcao${String(meses) === p ? ' seletor-periodo__opcao--ativa' : ''}`}
          aria-pressed={String(meses) === p}
          onClick={() => setFiltros({ meses: p })}
        >
          {p} meses
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {cabecalho}

      {erro && (
        <p className="dashboard__aviso" role="alert">
          {erro} Os números abaixo são da última atualização.
        </p>
      )}

      <div className="dashboard__kpis">
        <KpiCard
          icone={Store}
          tom="primario"
          rotulo="Oficinas ativas"
          valor={formatarNumero(oficinasAtivas)}
          detalhe={`de ${formatarNumero(oficinas.length)} cadastradas`}
          para="/oficinas"
        />
        <KpiCard
          icone={Users}
          tom="primario"
          rotulo="Usuários ativos"
          valor={formatarNumero(usuariosAtivos)}
          detalhe={`de ${formatarNumero(usuarios.length)} cadastrados`}
          para="/usuarios"
        />
        <KpiCard
          icone={Receipt}
          tom="sucesso"
          rotulo="Assinaturas ativas"
          valor={formatarNumero(assinaturasAtivas)}
          detalhe={`${formatarNumero(assinaturas.length)} no histórico`}
          para="/assinaturas"
        />
        <KpiCard
          icone={BadgeDollarSign}
          tom="sucesso"
          rotulo="Receita recorrente estimada"
          valor={formatarMoeda(receitaRecorrente)}
          detalhe="Soma dos planos ativos"
        />
        <KpiCard
          icone={Clock}
          tom={assinaturasPendentes > 0 ? 'aviso' : 'neutro'}
          rotulo="Assinaturas pendentes"
          valor={formatarNumero(assinaturasPendentes)}
          detalhe="Checkout não confirmado"
          para="/assinaturas"
        />
        <KpiCard
          icone={Car}
          rotulo="Montadoras ativas"
          valor={formatarNumero(montadorasAtivas)}
          detalhe={`de ${formatarNumero(montadoras.length)} no catálogo`}
          para="/montadoras"
        />
        <KpiCard
          icone={CarFront}
          rotulo="Modelos ativos"
          valor={formatarNumero(modelosAtivos)}
          detalhe={`de ${formatarNumero(modelos.length)} no catálogo`}
          para="/montadoras"
        />
        <KpiCard
          icone={FolderKanban}
          rotulo="Projetos ativos"
          valor={formatarNumero(projetos.length)}
          detalhe="Criados pelos entusiastas"
        />
      </div>

      <div className="dashboard__graficos">
        <div className="dashboard__destaque">
          <GraficoColunas
            titulo="Novos cadastros"
            periodo={`Últimos ${meses} meses · ${formatarNumero(totalUsuariosPeriodo)} usuários e ${formatarNumero(totalOficinasPeriodo)} oficinas`}
            dados={novosCadastros}
            acoes={seletorPeriodo}
            vazio="Nenhum cadastro no período."
          />
        </div>
        <GraficoBarras
          titulo="Assinaturas por plano"
          periodo="Todo o histórico"
          dados={contarPor(assinaturas, 'NomePlano')}
        />
        <GraficoBarras
          titulo="Serviços ativos por categoria"
          periodo="Catálogo atual"
          dados={contarPor(servicos.filter((s) => s.Ativo), 'Categoria')}
        />
        <GraficoBarras
          titulo="Oficinas ativas por faixa de preço"
          periodo="Situação atual"
          dados={contarPor(oficinas.filter((o) => o.Ativo), 'FaixaPreco')}
        />
        <GraficoBarras
          titulo="Projetos por tipo de customização"
          periodo="Projetos ativos"
          dados={contarPor(projetos, 'TipoCustomizacao', { traduzir: (v) => ROTULOS.TipoCustomizacao[v] || v })}
        />
        <GraficoBarras
          titulo="Projetos por estilo"
          periodo="Projetos ativos com estilo"
          dados={contarPor(projetos.filter((p) => p.Estilo), 'Estilo', { traduzir: humanizar })}
          vazio="Nenhum projeto com estilo definido ainda."
        />
        <GraficoBarras
          titulo="Administradores por nível"
          periodo="Situação atual"
          dados={contarPor(admins, 'NivelAcesso', { traduzir: (v) => ROTULOS.NivelAcesso[v] || v })}
        />
      </div>
    </div>
  );
};

export default Dashboard;