import { ServiceUnavailableError, ValidationError } from '../errors/AppError.js';

const BASE_URL = 'https://api.abacatepay.com/v2';
const API_KEY = process.env.ABACATEPAY_API_KEY;

const request = async (path, options = {}) => {
  const resposta = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const corpo = await resposta.json();

  if (!resposta.ok || corpo.error) {
    console.error('[AbacatePay] Erro na API:', corpo.error || resposta.status);
    throw new ServiceUnavailableError('Não foi possível processar o pagamento no momento.');
  }

  return corpo.data;
};

class AbacatePayService {
  async criarCheckout({ idProdutoExterno, returnUrl, completionUrl, metadata }) {
    if (!idProdutoExterno) {
      throw new ValidationError('Este plano ainda não está vinculado a um produto de pagamento.');
    }

    return request('/checkouts/create', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: idProdutoExterno, quantity: 1 }],
        methods: ['PIX'],
        returnUrl,
        completionUrl,
        metadata,
      }),
    });
  }

  async obterCheckout(idCheckout) {
    return request(`/checkouts/get?id=${idCheckout}`, { method: 'GET' });
  }
}

export default new AbacatePayService();