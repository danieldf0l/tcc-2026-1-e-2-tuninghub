import { useEffect, useState, useRef } from 'react';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import FiltroBar from '../../components/ui/FiltroBar';
import VincularProdutoModal from './VincularProdutoModal';
import {
  listarPlanosAdmin,
  criarPlano,
  atualizarPlano,
  vincularProdutoExterno,
  desativarPlano,
  reativarPlano,
} from '../../api/planoService';

const ITEMS_POR_PAGINA = 10;

const formatarValor = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PlanosPage = () => {
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [duracaoDias, setDuracaoDias] = useState('');
  const [idProdutoExternoInicial, setIdProdutoExternoInicial] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [planoVinculando, setPlanoVinculando] = useState(null);

  const ultimoScroll = useRef(0);

  const carregar = async () => {
    setCarregando(true);
    const dados = await listarPlanosAdmin();
    setPlanos(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, statusFiltro]);

  const abrirCriar = () => {
    setEditando(null);
    setNome('');
    setValor('');
    setDuracaoDias('');
    setIdProdutoExternoInicial('');
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (plano) => {
    setEditando(plano);
    setNome(plano.Nome);
    setDuracaoDias(String(plano.DuracaoDias));
    setErro('');
    setModalAberto(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      if (editando) {
        await atualizarPlano(editando.IdPlano, nome, Number(duracaoDias));
      } else {
        const resultado = await criarPlano(nome, valor === '' ? 0 : Number(valor), Number(duracaoDias));
        const idNovoPlano = resultado.plano?.id;

        if (idProdutoExternoInicial.trim()) {
          try {
            await vincularProdutoExterno(idNovoPlano, idProdutoExternoInicial.trim());
          } catch (erroVinculo) {
            setModalAberto(false);
            await carregar();
            alert(
              `O plano "${nome}" foi criado, mas houve um erro ao vincular o AbacatePay: ${
                erroVinculo.response?.data?.message || 'tente novamente pela lista.'
              }`
            );
            return;
          }
        }
      }
      setModalAberto(false);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar plano.');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleStatus = async (plano) => {
    const confirmar = window.confirm(
      plano.Ativo
        ? `Desativar o plano "${plano.Nome}"? Ele some da listagem pública e fica bloqueado para novas assinaturas.`
        : `Reativar o plano "${plano.Nome}"?`
    );
    if (!confirmar) return;

    if (plano.Ativo) {
      await desativarPlano(plano.IdPlano);
    } else {
      await reativarPlano(plano.IdPlano);
    }
    await carregar();
  };

  const filtrados = planos.filter((p) => {
    const passaBusca = p.Nome.toLowerCase().includes(busca.toLowerCase());
    const passaStatus =
      statusFiltro === 'todos' ? true : statusFiltro === 'ativos' ? !!p.Ativo : !p.Ativo;
    return passaBusca && passaStatus;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const itensPagina = filtrados.slice(
    (paginaSegura - 1) * ITEMS_POR_PAGINA,
    paginaSegura * ITEMS_POR_PAGINA
  );

  const handleScrollPagina = (e) => {
    const agora = Date.now();
    if (agora - ultimoScroll.current < 500) return;
    if (Math.abs(e.deltaY) < 20) return;

    if (e.deltaY > 0 && paginaSegura < totalPaginas) {
      ultimoScroll.current = agora;
      setPagina(paginaSegura + 1);
    } else if (e.deltaY < 0 && paginaSegura > 1) {
      ultimoScroll.current = agora;
      setPagina(paginaSegura - 1);
    }
  };

  if (carregando) return <p className="empty-state">Carregando...</p>;

  return (
    <div>
      <div className="crud-header">
        <h1>Planos</h1>
        <button className="btn-primary" onClick={abrirCriar}>+ Novo Plano</button>
      </div>

      <FiltroBar
        busca={busca}
        onBuscaChange={setBusca}
        status={statusFiltro}
        onStatusChange={setStatusFiltro}
        placeholder="Buscar plano..."
      />

      {filtrados.length === 0 ? (
        <p className="empty-state">Nenhum plano encontrado.</p>
      ) : (
        <div className="crud-table-wrapper" onWheel={handleScrollPagina}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Valor</th>
                <th>Duração</th>
                <th>AbacatePay</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((p) => (
                <tr key={p.IdPlano} className={!p.Ativo ? 'inativo' : ''}>
                  <td>{p.Nome}</td>
                  <td>{formatarValor(p.Valor)}</td>
                  <td>{p.DuracaoDias} dias</td>
                  <td>
                    <span className={`status-badge ${p.IdProdutoExterno ? 'ativo' : 'pendente'}`}>
                      {p.IdProdutoExterno ? 'Vinculado' : 'Não vinculado'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${p.Ativo ? 'ativo' : 'inativo'}`}>
                      {p.Ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="crud-actions">
                      <button className="link-action" onClick={() => abrirEditar(p)}>Editar</button>
                      <button className="link-action" onClick={() => setPlanoVinculando(p)}>
                        {p.IdProdutoExterno ? 'Alterar produto' : 'Vincular AbacatePay'}
                      </button>
                      <button className="link-action" onClick={() => handleToggleStatus(p)}>
                        {p.Ativo ? 'Desativar' : 'Reativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination paginaAtual={paginaSegura} totalPaginas={totalPaginas} onChange={setPagina} />
        </div>
      )}

      {modalAberto && (
        <Modal title={editando ? 'Editar Plano' : 'Novo Plano'} onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar}>
            {erro && <div className="form-erro">{erro}</div>}

            <div className="form-field">
              <label htmlFor="nomePlano">Nome</label>
              <input
                id="nomePlano"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </div>

            {editando ? (
              <div className="form-field">
                <label>Valor</label>
                <div className="form-field-readonly">{formatarValor(editando.Valor)}</div>
              </div>
            ) : (
              <div className="form-field">
                <label htmlFor="valorPlano">Valor (R$)</label>
                <input
                  id="valorPlano"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>
            )}
            {!editando && (
              <p className="form-hint">
                O valor é só informativo (exibição no app). O preço realmente cobrado no checkout vem do produto vinculado no AbacatePay.
              </p>
            )}

            <div className="form-field">
              <label htmlFor="duracaoPlano">Duração (dias)</label>
              <input
                id="duracaoPlano"
                type="number"
                min="1"
                value={duracaoDias}
                onChange={(e) => setDuracaoDias(e.target.value)}
                required
              />
            </div>
            {editando && (
              <p className="form-hint">
                Alterar a duração só afeta novas assinaturas — assinaturas ativas já têm a data de expiração fixada.
              </p>
            )}

            {!editando && (
              <div className="form-field">
                <label htmlFor="produtoExternoInicial">Id do Produto Externo (AbacatePay) — opcional</label>
                <input
                  id="produtoExternoInicial"
                  type="text"
                  value={idProdutoExternoInicial}
                  onChange={(e) => setIdProdutoExternoInicial(e.target.value)}
                  placeholder="Deixe em branco para vincular depois"
                />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {planoVinculando && (
        <VincularProdutoModal
          plano={planoVinculando}
          onClose={() => setPlanoVinculando(null)}
          onSalvo={() => {
            setPlanoVinculando(null);
            carregar();
          }}
        />
      )}
    </div>
  );
};

export default PlanosPage;