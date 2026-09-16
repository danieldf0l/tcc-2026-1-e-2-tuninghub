import api from './axiosInstance';

export const listarKitDoEstilo = (codigoEstilo) =>
  api.get(`/estiloservicosugerido/${codigoEstilo}`).then((r) => r.data);

export const vincularServicoAoEstilo = (codigoEstilo, idServico) =>
  api.post('/estiloservicosugerido', { estilo: codigoEstilo, idServico }).then((r) => r.data);

export const desvincularServicoDoEstilo = (codigoEstilo, idServico) =>
  api.delete(`/estiloservicosugerido/${codigoEstilo}/${idServico}`).then((r) => r.data);