import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

// O AuthContext registra aqui o que fazer quando o servidor recusa a sessão
let aoSessaoInvalida = null;
export function setSessaoInvalidaHandler(fn) {
  aoSessaoInvalida = fn;
}

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('tuninghub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  (error) => {
    const status = error.response?.status;
    const mensagem = error.response?.data?.message || '';
    const enviouToken = !!error.config?.headers?.Authorization;
    const ehRotaAuth = (error.config?.url || '').startsWith('/auth/');

    if (aoSessaoInvalida && enviouToken && !ehRotaAuth) {
      if (status === 401) {
        // token expirado/inválido ou "Sessão expirada" (senha trocada em outro aparelho)
        aoSessaoInvalida('Sua sessão expirou. Faça login novamente.');
      } else if (status === 403 && mensagem.startsWith('Conta desativada')) {
        aoSessaoInvalida(mensagem);
      }
    }
    return Promise.reject(error);
  }
);

export default api;