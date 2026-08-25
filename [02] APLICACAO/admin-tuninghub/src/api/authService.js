import api from './axiosInstance';

export const loginAdmin = async (email, senha) => {
  const response = await api.post('/auth/login/admin', { email, senha });
  return response.data.data; // { usuario, token }
};