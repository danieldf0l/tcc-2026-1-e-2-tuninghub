import { useEffect, useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAlteracoesNaoSalvas } from '../../hooks/useAlteracoesNaoSalvas';
import { mensagemErro } from '../../utils/erroApi';
import { mascaraCep, somenteDigitos } from '../../utils/formatadores';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Campo';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import Aviso from '../../components/ui/Aviso';
import { buscarEndereco, salvarEndereco } from '../../api/enderecoService';

const VAZIO = { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' };

const deEndereco = (dados) => ({
  cep: mascaraCep(dados.CEP || ''),
  rua: dados.Rua || '',
  numero: dados.Numero || '',
  bairro: dados.Bairro || '',
  cidade: dados.Cidade || '',
  estado: (dados.Estado || '').toUpperCase(),
});

const EnderecoTab = ({ idOficina, onSujoChange }) => {
  const toast = useToast();
  const [endereco, setEndereco] = useState(null); // dado salvo (com Latitude/Longitude)
  const [original, setOriginal] = useState(VAZIO);
  const [form, setForm] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState('');
  const [semEndereco, setSemEndereco] = useState(false);
  const [erros, setErros] = useState({});
  const [erroSalvar, setErroSalvar] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const alterado = Object.keys(VAZIO).some((c) => String(form[c]).trim() !== String(original[c]).trim());
  useAlteracoesNaoSalvas(alterado);

  useEffect(() => {
    onSujoChange?.(alterado);
  }, [alterado, onSujoChange]);
  useEffect(() => () => onSujoChange?.(false), [onSujoChange]);

  const aplicarCarregamento = (promessa) =>
    promessa
      .then((dados) => {
        const valores = deEndereco(dados);
        setEndereco(dados);
        setOriginal(valores);
        setForm(valores);
        setSemEndereco(false);
        setErroCarregar('');
      })
      .catch((error) => {
        if (error.response?.status === 404) setSemEndereco(true);
        else setErroCarregar(mensagemErro(error, 'Não foi possível carregar o endereço.'));
      })
      .finally(() => setCarregando(false));

  useEffect(() => {
    aplicarCarregamento(buscarEndereco(idOficina));
  }, [idOficina]);

  const mudarCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    setErroSalvar('');
  };

  // Ao completar o CEP, preenche rua, bairro, cidade e UF pelo ViaCEP (se falhar, preenche à mão)
  const completarPorCep = async (cep) => {
    const digitos = somenteDigitos(cep);
    if (digitos.length !== 8 || digitos === somenteDigitos(original.cep)) return;
    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const dados = await resposta.json();
      if (dados.erro) {
        setErros((atual) => ({ ...atual, cep: 'CEP não encontrado.' }));
        return;
      }
      setForm((atual) => ({
        ...atual,
        rua: dados.logradouro || atual.rua,
        bairro: dados.bairro || atual.bairro,
        cidade: dados.localidade || atual.cidade,
        estado: dados.uf || atual.estado,
      }));
    } catch {
      // Sem internet ou ViaCEP fora do ar: segue com o preenchimento manual
    } finally {
      setBuscandoCep(false);
    }
  };

  const validar = () => {
    const novos = {};
    if (somenteDigitos(form.cep).length !== 8) novos.cep = 'Informe o CEP com 8 dígitos.';
    if (!form.rua.trim()) novos.rua = 'Informe a rua.';
    if (!form.cidade.trim()) novos.cidade = 'Informe a cidade.';
    if (!/^[A-Za-z]{2}$/.test(form.estado.trim())) novos.estado = 'Use a sigla (ex.: SP).';
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    setErroSalvar('');
    try {
      const resultado = await salvarEndereco(idOficina, {
        rua: form.rua.trim(),
        numero: form.numero.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase(),
        cep: somenteDigitos(form.cep),
      });
      toast.sucesso(
        resultado?.distanciaKm != null
          ? `Endereço salvo. Distância do SENAC: ${resultado.distanciaKm} km.`
          : 'Endereço salvo.'
      );
      await aplicarCarregamento(buscarEndereco(idOficina));
    } catch (error) {
      // Ex.: endereço fora do raio de 4 km do SENAC ou não encontrado na geocodificação
      setErroSalvar(mensagemErro(error, 'Erro ao salvar endereço.'));
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="drawer-oficina__secoes">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} altura={38} raio="var(--radius-md)" />
        ))}
      </div>
    );
  }

  if (erroCarregar) {
    return (
      <ErrorState
        compacto
        descricao={erroCarregar}
        onTentarNovamente={() => {
          setCarregando(true);
          setErroCarregar('');
          aplicarCarregamento(buscarEndereco(idOficina));
        }}
      />
    );
  }

  const temCoordenadas = endereco?.Latitude && endereco?.Longitude;

  return (
    <form className="drawer-oficina__secoes" onSubmit={handleSalvar} noValidate>
      {semEndereco && (
        <Aviso tom="info" titulo="Nenhum endereço cadastrado">
          Preencha abaixo para cadastrar o endereço desta oficina.
        </Aviso>
      )}

      {erroSalvar && (
        <Aviso tom="perigo" titulo="Endereço não salvo">
          {erroSalvar}
        </Aviso>
      )}

      {temCoordenadas && (
        <div className="localizacao">
          <MapPin size={18} aria-hidden="true" />
          <span>
            Localização confirmada ({Number(endereco.Latitude).toFixed(5)}, {Number(endereco.Longitude).toFixed(5)})
          </span>
          <a
            href={`https://www.openstreetmap.org/?mlat=${endereco.Latitude}&mlon=${endereco.Longitude}#map=17/${endereco.Latitude}/${endereco.Longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver no mapa <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      )}

      <div className="grade-endereco">
        <div className="grade-endereco__cep">
          <Input
            label="CEP"
            inputMode="numeric"
            value={form.cep}
            onChange={(e) => mudarCampo('cep', mascaraCep(e.target.value))}
            onBlur={(e) => completarPorCep(e.target.value)}
            erro={erros.cep}
            dica={buscandoCep ? 'Buscando endereço...' : 'Preenche a rua, o bairro e a cidade.'}
            placeholder="00000-000"
            required
          />
        </div>
        <div className="grade-endereco__rua">
          <Input label="Rua" value={form.rua} onChange={(e) => mudarCampo('rua', e.target.value)} erro={erros.rua} required />
        </div>
        <div className="grade-endereco__numero">
          <Input label="Número" value={form.numero} onChange={(e) => mudarCampo('numero', e.target.value)} />
        </div>
        <div className="grade-endereco__bairro">
          <Input label="Bairro" value={form.bairro} onChange={(e) => mudarCampo('bairro', e.target.value)} />
        </div>
        <div className="grade-endereco__cidade">
          <Input
            label="Cidade"
            value={form.cidade}
            onChange={(e) => mudarCampo('cidade', e.target.value)}
            erro={erros.cidade}
            required
          />
        </div>
        <div className="grade-endereco__uf">
          <Input
            label="UF"
            value={form.estado}
            onChange={(e) => mudarCampo('estado', e.target.value.toUpperCase().slice(0, 2))}
            erro={erros.estado}
            maxLength={2}
            required
          />
        </div>
      </div>

      <p className="secao__descricao">
        Ao salvar, o sistema confirma a localização de novo e recusa endereços fora do raio de 4 km do SENAC.
      </p>

      <div className="secao__acoes">
        <Button variante="secundario" onClick={() => setForm(original)} disabled={!alterado || salvando}>
          Desfazer alterações
        </Button>
        <Button type="submit" carregando={salvando} disabled={!alterado}>
          Salvar endereço
        </Button>
      </div>
    </form>
  );
};

export default EnderecoTab;