// src/services/cnpjExterno.service.js
import { ValidationError, ServiceUnavailableError } from '../errors/AppError.js';
import { CNAES_PERMITIDOS } from '../constants/cnaesPermitidos.js';

const BASE_URL = 'https://api.opencnpj.org';
const MAX_TENTATIVAS = 3;
const TIMEOUT_MS = 5000;

const buscarComTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

class CnpjExternoService {
  // RN23: até 3 tentativas antes de recusar o cadastro
  async consultar(cnpjSemPontuacao) {
    let ultimoErro;

    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      try {
        const resposta = await buscarComTimeout(`${BASE_URL}/${cnpjSemPontuacao}`, TIMEOUT_MS);

        if (resposta.status === 404) {
          throw new ValidationError('CNPJ não encontrado na Receita Federal.');
        }
        if (!resposta.ok) {
          throw new Error(`status ${resposta.status}`);
        }

        return await resposta.json();
      } catch (error) {
        if (error instanceof ValidationError) throw error; // CNPJ não existe, tentar de novo não ajuda
        ultimoErro = error;
        console.warn(`[CNPJ Externo] Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou: ${error.message}`);
      }
    }

    console.error('[CNPJ Externo] Falha definitiva após 3 tentativas:', ultimoErro?.message);
    throw new ServiceUnavailableError('Não foi possível validar o CNPJ no momento. Tente novamente mais tarde.');
  }

  // RN16 + RN24: situação ativa e CNAE compatível com oficina automotiva
  validarSituacaoECnae(dadosCnpj) {
    const situacaoAtiva = dadosCnpj.situacao_cadastral?.toUpperCase() === 'ATIVA';
    if (!situacaoAtiva) {
      throw new ValidationError('CNPJ inativo ou irregular perante a Receita Federal.');
    }

    const cnaesDaEmpresa = [dadosCnpj.cnae_principal, ...(dadosCnpj.cnaes_secundarios || [])].filter(Boolean);
    const possuiCnaeCompativel = cnaesDaEmpresa.some((cnae) => CNAES_PERMITIDOS.includes(cnae));

    if (!possuiCnaeCompativel) {
      throw new ValidationError('CNPJ não corresponde a uma oficina automotiva.');
    }

    return dadosCnpj.cnae_principal;
  }
}

export default new CnpjExternoService();