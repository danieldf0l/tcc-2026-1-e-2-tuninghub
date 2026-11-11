import { BarChart3 } from 'lucide-react';
import './Graficos.css';

/*
  Gráficos simples feitos só com CSS (sem biblioteca), legíveis nos dois temas.
  Cada um tem título, período (o que os números representam) e estado vazio.

  <GraficoBarras
    titulo="Assinaturas por plano"
    periodo="Situação atual"
    dados={[{ rotulo: 'Pro Mensal', valor: 12 }, ...]}
    maxItens={6}                // o que passar disso vira "Outros"
  />

  <GraficoColunas
    titulo="Novos cadastros"
    periodo="Últimos 6 meses"
    dados={[{ rotulo: 'jun/26', valor: 8, detalhe: '6 usuários · 2 oficinas' }, ...]}
    acoes={<seletor de período />}
  />
*/

const formatar = (n) => Number(n || 0).toLocaleString('pt-BR');

const CabecalhoGrafico = ({ titulo, periodo, total, acoes }) => (
  <div className="grafico__cabecalho">
    <div>
      <h3 className="grafico__titulo">{titulo}</h3>
      {periodo && <p className="grafico__periodo">{periodo}</p>}
    </div>
    {acoes || (total != null && <p className="grafico__total">{formatar(total)}</p>)}
  </div>
);

const VazioGrafico = ({ texto }) => (
  <div className="grafico__vazio">
    <BarChart3 size={20} aria-hidden="true" />
    <p>{texto}</p>
  </div>
);

// Mantém os maiores e soma o resto em "Outros", para o gráfico não virar uma lista enorme
const agruparOutros = (dados, maxItens) => {
  if (dados.length <= maxItens) return dados;
  const principais = dados.slice(0, maxItens - 1);
  const resto = dados.slice(maxItens - 1).reduce((soma, d) => soma + d.valor, 0);
  return [...principais, { rotulo: 'Outros', valor: resto }];
};

export const GraficoBarras = ({ titulo, periodo, dados, maxItens = 6, vazio = 'Sem dados ainda.' }) => {
  const itens = agruparOutros(dados, maxItens);
  const total = dados.reduce((soma, d) => soma + d.valor, 0);
  const maior = Math.max(1, ...itens.map((d) => d.valor));

  return (
    <section className="grafico">
      <CabecalhoGrafico titulo={titulo} periodo={periodo} total={dados.length > 0 ? total : null} />

      {itens.length === 0 ? (
        <VazioGrafico texto={vazio} />
      ) : (
        <ul className="barras">
          {itens.map((d) => {
            const pct = total > 0 ? Math.round((d.valor / total) * 100) : 0;
            return (
              <li key={d.rotulo} className="barras__linha" title={`${d.rotulo}: ${formatar(d.valor)} (${pct}%)`}>
                <span className="barras__rotulo">{d.rotulo}</span>
                <span className="barras__trilho" aria-hidden="true">
                  <span className="barras__barra" style={{ width: `${(d.valor / maior) * 100}%` }} />
                </span>
                <span className="barras__valor">
                  {formatar(d.valor)}
                  <span className="barras__pct">{pct}%</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export const GraficoColunas = ({ titulo, periodo, dados, acoes, vazio = 'Sem dados no período.' }) => {
  const maior = Math.max(1, ...dados.map((d) => d.valor));
  const semDados = dados.every((d) => d.valor === 0);

  return (
    <section className="grafico">
      <CabecalhoGrafico titulo={titulo} periodo={periodo} acoes={acoes} />

      {semDados ? (
        <VazioGrafico texto={vazio} />
      ) : (
        <ul className="colunas" style={{ '--quantidade': dados.length }}>
          {dados.map((d) => (
            <li
              key={d.rotulo}
              className="colunas__item"
              title={`${d.rotulo}: ${formatar(d.valor)}${d.detalhe ? ` (${d.detalhe})` : ''}`}
            >
              <span className="colunas__area">
                <span className="colunas__valor">{formatar(d.valor)}</span>
                <span
                  className="colunas__coluna"
                  style={{ height: `${Math.max((d.valor / maior) * 100, d.valor > 0 ? 3 : 0)}%` }}
                />
              </span>
              <span className="colunas__rotulo">{d.rotulo}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};