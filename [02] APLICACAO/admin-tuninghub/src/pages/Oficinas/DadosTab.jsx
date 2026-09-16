import { useState } from 'react';
import { atualizarFaixaPreco, desativarOficina, reativarOficina } from '../../api/oficinaService';

const FAIXAS_PRECO = [
  { value: '$', label: '$ — Econômico' },
  { value: '$$', label: '$$ — Intermediário' },
  { value: '$$$', label: '$$$ — Premium' },
];

const formatarCnpj = (cnpj) => {
  const digitos = String(cnpj || '').replace(/\D/g, '');
  if (digitos.length !== 14) return cnpj;
  return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const DadosTab = ({ oficina, onAtualizado }) => {
  const [faixaPreco, setFaixaPreco] = useState(oficina.FaixaPreco || '$');
  const [salvandoFaixa, setSalvandoFaixa] = useState(false);
  const [erroFaixa, setErroFaixa] = useState('');

  const handleSalvarFaixa = async (e) => {
    e.preventDefault();
    setErroFaixa('');
    setSalvandoFaixa(true);
    try {
      await atualizarFaixaPreco(oficina.IdOficina, faixaPreco);
      onAtualizado();
    } catch (error) {
      setErroFaixa(error.response?.data?.message || 'Erro ao atualizar faixa de preço.');
    } finally {
      setSalvandoFaixa(false);
    }
  };

  const handleToggleStatus = async () => {
    const confirmar = window.confirm(
      oficina.Ativo
        ? `Desativar a conta de "${oficina.NomeOficina}"? Ela perde acesso ao login imediatamente.`
        : `Reativar a conta de "${oficina.NomeOficina}"?`
    );
    if (!confirmar) return;

    if (oficina.Ativo) {
      await desativarOficina(oficina.IdOficina);
    } else {
      await reativarOficina(oficina.IdOficina);
    }
    onAtualizado();
  };

  return (
    <div>
      <dl className="detalhe-info">
        <dt>Nome da Oficina</dt>
        <dd>{oficina.NomeOficina}</dd>

        <dt>CNPJ</dt>
        <dd>{formatarCnpj(oficina.CNPJ)}</dd>

        <dt>Proprietário</dt>
        <dd>{oficina.NomeProprietario || '—'}</dd>

        <dt>E-mail</dt>
        <dd>{oficina.Email}</dd>

        <dt>Telefone</dt>
        <dd>{oficina.Telefone || '—'}</dd>

        <dt>Status</dt>
        <dd>
          <span className={`status-badge ${oficina.Ativo ? 'ativo' : 'inativo'}`}>
            {oficina.Ativo ? 'Ativa' : 'Inativa'}
          </span>
        </dd>
      </dl>

      <button className="btn-secondary" onClick={handleToggleStatus}>
        {oficina.Ativo ? 'Desativar Conta' : 'Reativar Conta'}
      </button>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '24px 0' }} />

      <form onSubmit={handleSalvarFaixa}>
        {erroFaixa && <div className="form-erro">{erroFaixa}</div>}
        <div className="faixa-preco-form">
          <div className="form-field">
            <label htmlFor="faixaPreco">Faixa de Preço</label>
            <select id="faixaPreco" value={faixaPreco} onChange={(e) => setFaixaPreco(e.target.value)}>
              {FAIXAS_PRECO.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={salvandoFaixa}>
            {salvandoFaixa ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DadosTab;