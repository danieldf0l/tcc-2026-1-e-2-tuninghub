import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/ui/StatCard';
import BarChartSimple from '../../components/ui/BarChartSimple';
import { listarOficinasAdmin } from '../../api/oficinaService';
import { listarUsuariosAdmin } from '../../api/usuarioService';
import { listarAssinaturasAdmin } from '../../api/assinaturaService';
import { listarServicosAdmin } from '../../api/servicoService';
import { listarMontadorasAdmin } from '../../api/montadoraService';
import { listarModelosAdmin } from '../../api/modeloService';
import { listarPlanosAdmin } from '../../api/planoService';
import { listarAdmins } from '../../api/adminService';
import { listarProjetosAdmin } from '../../api/projetoService';

const contarPor = (lista, campo, rotuloVazio = 'Não definido') => {
  const contagem = {};
  lista.forEach((item) => {
    const chave = item[campo] || rotuloVazio;
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  return Object.entries(contagem)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

const formatarValor = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ultimosNMeses = (n) => {
  const meses = [];
  const hoje = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push({ chave: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) });
  }
  return meses;
};

const cadastrosPorMes = (listas) => {
  const meses = ultimosNMeses(6);
  const contagemPorChave = {};
  meses.forEach((m) => { contagemPorChave[m.chave] = 0; });

  listas.forEach((lista) => {
    lista.forEach((item) => {
      if (!item.DataCriacao) return;
      const d = new Date(item.DataCriacao);
      const chave = `${d.getFullYear()}-${d.getMonth()}`;
      if (chave in contagemPorChave) contagemPorChave[chave] += 1;
    });
  });

  return meses.map((m) => ({ label: m.label, value: contagemPorChave[m.chave] }));
};

const Dashboard = () => {
  const { admin } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState(null);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const [
        oficinas, usuarios, assinaturas, servicos,
        montadoras, modelos, planos, admins, projetos,
      ] = await Promise.all([
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
      setDados({ oficinas, usuarios, assinaturas, servicos, montadoras, modelos, planos, admins, projetos });
      setCarregando(false);
    };
    carregar();
  }, []);

  if (carregando || !dados) {
    return (
      <div>
        <h1>Olá, {admin?.nome}</h1>
        <p className="empty-state">Carregando painel...</p>
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
  planos.forEach((p) => { mapaValorPlano[p.Nome] = Number(p.Valor); });
  const receitaRecorrente = assinaturas
    .filter((a) => a.Status === 'ATIVA')
    .reduce((soma, a) => soma + (mapaValorPlano[a.NomePlano] || 0), 0);

  const servicosPorCategoria = contarPor(servicos.filter((s) => s.Ativo), 'Categoria');
  const oficinasPorFaixaPreco = contarPor(oficinas.filter((o) => o.Ativo), 'FaixaPreco');
  const assinaturasPorPlano = contarPor(assinaturas, 'NomePlano');
  const projetosPorTipo = contarPor(projetos, 'TipoCustomizacao');
  const projetosPorEstilo = contarPor(projetos.filter((p) => p.Estilo), 'Estilo');
  const adminsPorNivel = contarPor(admins, 'NivelAcesso');
  const novosCadastros = cadastrosPorMes([usuarios, oficinas]);

  return (
    <div>
      <h1>Olá, {admin?.nome}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24 }}>
        Visão geral da plataforma TuningHub.
      </p>

      <div className="stats-grid">
        <StatCard label="Oficinas Ativas" value={oficinasAtivas} hint={`${oficinas.length} no total`} />
        <StatCard label="Usuários Ativos" value={usuariosAtivos} hint={`${usuarios.length} no total`} />
        <StatCard label="Assinaturas Ativas" value={assinaturasAtivas} />
        <StatCard label="Assinaturas Pendentes" value={assinaturasPendentes} hint="Checkout não confirmado" />
      </div>

      <div className="stats-grid">
        <StatCard label="Montadoras Ativas" value={montadorasAtivas} />
        <StatCard label="Modelos Ativos" value={modelosAtivos} />
        <StatCard label="Total de Projetos" value={projetos.length} />
        <StatCard label="Receita Recorrente Estimada" value={formatarValor(receitaRecorrente)} hint="Soma dos planos ativos" />
      </div>

      <div className="panels-grid">
        <BarChartSimple title="Novos Cadastros por Mês" data={novosCadastros} emptyLabel="Sem cadastros ainda." />
        <BarChartSimple title="Serviços Ativos por Categoria" data={servicosPorCategoria} />
        <BarChartSimple title="Oficinas Ativas por Faixa de Preço" data={oficinasPorFaixaPreco} />
        <BarChartSimple title="Assinaturas por Plano" data={assinaturasPorPlano} />
        <BarChartSimple title="Projetos por Tipo de Customização" data={projetosPorTipo} />
        <BarChartSimple title="Projetos por Estilo" data={projetosPorEstilo} emptyLabel="Nenhum projeto com estilo definido ainda." />
        <BarChartSimple title="Admins por Nível de Acesso" data={adminsPorNivel} />
      </div>
    </div>
  );
};

export default Dashboard;