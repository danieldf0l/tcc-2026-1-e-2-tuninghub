export function getErrorMessage(error, fallback = 'Ocorreu um erro. Tente novamente.') {
  const data = error?.response?.data;

  if (!data) {
    if (error?.message === 'Network Error') {
      return 'Não foi possível conectar ao servidor. Verifique sua internet e o IP configurado no .env.';
    }
    return fallback;
  }

  return data.message || fallback;
}