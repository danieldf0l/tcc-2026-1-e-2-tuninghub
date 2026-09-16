import { useEffect, useState } from 'react';
import { buscarEndereco, salvarEndereco } from '../../api/enderecoService';

const EnderecoTab = ({ idOficina }) => {
  const [endereco, setEndereco] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    setNaoEncontrado(false);
    try {
      const dados = await buscarEndereco(idOficina);
      setEndereco(dados);
      setRua(dados.Rua || '');
      setNumero(dados.Numero || '');
      setBairro(dados.Bairro || '');
      setCidade(dados.Cidade || '');
      setEstado(dados.Estado || '');
      setCep(dados.CEP || '');
    } catch (error) {
      if (error.response?.status === 404) {
        setNaoEncontrado(true);
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [idOficina]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      const resultado = await salvarEndereco(idOficina, { rua, numero, bairro, cidade, estado, cep });
      setSucesso(`Endereço salvo. Distância do SENAC: ${resultado.distanciaKm}km.`);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar endereço.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <p className="empty-state">Carregando...</p>;

  return (
    <form onSubmit={handleSalvar}>
      {erro && <div className="form-erro">{erro}</div>}
      {sucesso && (
        <div className="status-badge ativo" style={{ display: 'block', marginBottom: 16, padding: '8px 12px' }}>
          {sucesso}
        </div>
      )}
      {naoEncontrado && (
        <p className="modal-texto">Nenhum endereço cadastrado ainda para esta oficina. Preencha abaixo para cadastrar.</p>
      )}

      {endereco && (
        <p className="modal-texto">
          Distância atual do SENAC: {endereco.Latitude && endereco.Longitude ? 'calculada no cadastro' : '—'}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="rua">Rua</label>
        <input id="rua" type="text" value={rua} onChange={(e) => setRua(e.target.value)} required />
      </div>

      <div className="form-field">
        <label htmlFor="numero">Número</label>
        <input id="numero" type="text" value={numero} onChange={(e) => setNumero(e.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="bairro">Bairro</label>
        <input id="bairro" type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="cidade">Cidade</label>
        <input id="cidade" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
      </div>

      <div className="form-field">
        <label htmlFor="estado">Estado</label>
        <input id="estado" type="text" value={estado} onChange={(e) => setEstado(e.target.value)} required maxLength={2} />
      </div>

      <div className="form-field">
        <label htmlFor="cep">CEP</label>
        <input id="cep" type="text" value={cep} onChange={(e) => setCep(e.target.value)} required />
      </div>

      <p className="form-hint">
        Ao salvar, o sistema reconsulta a localização e valida o raio de 4km do SENAC — endereços fora da área são recusados.
      </p>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Endereço'}
        </button>
      </div>
    </form>
  );
};

export default EnderecoTab;