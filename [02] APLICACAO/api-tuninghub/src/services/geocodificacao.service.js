import { ServiceUnavailableError, ValidationError } from '../errors/AppError.js';

const BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TuningHub-TCC/1.0 (projeto academico)';
const MAX_TENTATIVAS = 3;
const TIMEOUT_MS = 5000;
const DELAY_ENTRE_CANDIDATOS_MS = 1100; // respeita o limite de 1 req/s da Nominatim

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buscarComTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, headers: { 'User-Agent': USER_AGENT } });
  } finally {
    clearTimeout(timeoutId);
  }
};

// Expande abreviações comuns que a Nominatim às vezes não reconhece
const expandirAbreviacao = (rua = '') =>
  rua.replace(/^Av\.?\s/i, 'Avenida ').replace(/^R\.?\s/i, 'Rua ');

// Gera várias versões do endereço, da mais precisa pra mais genérica.
// Isso contorna a cobertura inconsistente de numeração predial da
// Nominatim/OpenStreetMap no Brasil, especialmente em zonas industriais.
const montarCandidatos = ({ rua, numero, bairro, cidade, estado, cep }) => {
  const ruaCompleta = expandirAbreviacao(rua);
  const cepLimpo = cep?.replace(/\D/g, '');

  return [
    [ruaCompleta, numero, bairro, cidade, estado, cepLimpo, 'Brasil'].filter(Boolean).join(', '),
    [ruaCompleta, bairro, cidade, estado, 'Brasil'].filter(Boolean).join(', '),
    [ruaCompleta, cidade, estado, 'Brasil'].filter(Boolean).join(', '),
    [bairro, cidade, estado, 'Brasil'].filter(Boolean).join(', '),
    cepLimpo ? `${cepLimpo}, Brasil` : null,
    [cidade, estado, 'Brasil'].filter(Boolean).join(', '),
  ].filter(Boolean);
};

class GeocodificacaoService {
  async #buscarCandidato(query) {
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
    const resposta = await buscarComTimeout(url, TIMEOUT_MS);
    if (!resposta.ok) throw new Error(`status ${resposta.status}`);
    return resposta.json();
  }

  async geocodificar(endereco) {
    const candidatos = montarCandidatos(endereco);
    let ultimoErro;

    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      try {
        for (let i = 0; i < candidatos.length; i++) {
          const resultados = await this.#buscarCandidato(candidatos[i]);

          if (resultados.length) {
            return { latitude: parseFloat(resultados[0].lat), longitude: parseFloat(resultados[0].lon) };
          }
          if (i < candidatos.length - 1) await delay(DELAY_ENTRE_CANDIDATOS_MS);
        }
        // Nenhum candidato encontrou resultado -- não é erro de rede, é endereço não localizável
        throw new ValidationError('Não foi possível localizar este endereço no mapa. Verifique os dados informados.');
      } catch (error) {
        if (error instanceof ValidationError) throw error;
        ultimoErro = error;
        console.warn(`[Geocodificação] Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou: ${error.message}`);
        await delay(1000);
      }
    }

    console.error('[Geocodificação] Falha definitiva:', ultimoErro?.message);
    throw new ServiceUnavailableError('Não foi possível calcular a localização no momento. Tente novamente mais tarde.');
  }
}

export default new GeocodificacaoService();