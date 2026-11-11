import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import MenuAcoes from './MenuAcoes';
import './DataTable.css';

/*
  const colunas = [
    { chave: 'Nome', titulo: 'Nome' },
    { chave: 'Montadora', titulo: 'Montadora' },
    { chave: 'Ativo', titulo: 'Status', render: (m) => <StatusBadge status={m.Ativo ? 'ativo' : 'inativo'} /> },
    { chave: 'DataCriacao', titulo: 'Criado em', alinhar: 'direita', ordenavel: false },
  ];

  <DataTable
    colunas={colunas}
    dados={itensPagina}                     // já filtrados, ordenados e paginados
    chaveLinha="IdModelo"                   // nome do campo ou função (item) => id
    ordenacao={ordenacao}                   // { chave, direcao }
    onOrdenar={setOrdenacao}                // sem isso, cabeçalho não ordena
    onLinhaClick={(m) => abrirEditar(m)}    // opcional (Enter também abre)
    linhaInativa={(m) => !m.Ativo}          // opcional (texto mais apagado)
    acoes={(m) => [ ...itens do MenuAcoes... ]}  // opcional (menu ⋯ no fim)
    vazio={<EmptyState ... />}              // mostrado quando dados está vazio
    alturaMaxima="calc(100vh - 320px)"      // opcional: rola por dentro com cabeçalho fixo
    rotulo="Modelos"                        // nome da tabela para leitor de tela
  />
*/
const DataTable = ({
  colunas,
  dados,
  chaveLinha,
  ordenacao,
  onOrdenar,
  onLinhaClick,
  linhaInativa,
  acoes,
  vazio,
  alturaMaxima,
  rotulo,
}) => {
  const chaveDe = typeof chaveLinha === 'function' ? chaveLinha : (item) => item[chaveLinha];

  const alternarOrdenacao = (coluna) => {
    const mesma = ordenacao?.chave === coluna.chave;
    onOrdenar({
      chave: coluna.chave,
      direcao: mesma && ordenacao.direcao === 'asc' ? 'desc' : 'asc',
    });
  };

  if (dados.length === 0 && vazio) return vazio;

  return (
    <div className="tabela-container" style={alturaMaxima ? { maxHeight: alturaMaxima } : undefined}>
      <table className="tabela" aria-label={rotulo}>
        <thead>
          <tr>
            {colunas.map((coluna) => {
              const ordenavel = !!onOrdenar && coluna.ordenavel !== false;
              const ativa = ordenacao?.chave === coluna.chave;
              const IconeOrdem = !ativa ? ChevronsUpDown : ordenacao.direcao === 'asc' ? ArrowUp : ArrowDown;

              return (
                <th
                  key={coluna.chave}
                  scope="col"
                  style={coluna.largura ? { width: coluna.largura } : undefined}
                  className={coluna.alinhar ? `tabela__celula--${coluna.alinhar}` : undefined}
                  aria-sort={ativa ? (ordenacao.direcao === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {ordenavel ? (
                    <button
                      type="button"
                      className={`tabela__ordenar${ativa ? ' tabela__ordenar--ativa' : ''}`}
                      onClick={() => alternarOrdenacao(coluna)}
                    >
                      {coluna.titulo}
                      <IconeOrdem size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    coluna.titulo
                  )}
                </th>
              );
            })}
            {acoes && (
              <th scope="col" className="tabela__acoes">
                <span className="sr-only">Ações</span>
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {dados.map((item) => {
            const clicavel = !!onLinhaClick;
            const classes = [
              clicavel && 'tabela__linha--clicavel',
              linhaInativa?.(item) && 'tabela__linha--inativa',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <tr
                key={chaveDe(item)}
                className={classes || undefined}
                tabIndex={clicavel ? 0 : undefined}
                onClick={clicavel ? () => onLinhaClick(item) : undefined}
                onKeyDown={
                  clicavel
                    ? (e) => {
                        if (e.key === 'Enter' && e.target === e.currentTarget) onLinhaClick(item);
                      }
                    : undefined
                }
              >
                {colunas.map((coluna) => (
                  <td
                    key={coluna.chave}
                    className={coluna.alinhar ? `tabela__celula--${coluna.alinhar}` : undefined}
                  >
                    {coluna.render ? coluna.render(item) : item[coluna.chave]}
                  </td>
                ))}
                {acoes && (
                  // Clique e teclado no menu não disparam o clique da linha
                  <td
                    className="tabela__acoes"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <MenuAcoes itens={acoes(item)} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;