import LogSistemaService from '../services/logSistema.service.js';
import { ROLES } from '../constants/roles.js';

// Grava no logsistema a ação de um admin, só se a requisição terminou com sucesso (status < 400).
// Use DEPOIS de verificarToken/checkRole e ANTES do controller.
//   acao:      texto fixo ou função (req) => texto
//   entidade:  o que foi alterado ('usuario', 'oficina', 'montadora'...)
//   idParam:   nome do parâmetro da rota com o id afetado (padrão 'id')
// Em rotas de criação (sem :id), o controller pode informar o id novo: res.locals.idReferencia = novoId
export const registrarAcao = (acao, entidade, idParam = 'id') => (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) return;

    const { id, role } = req.usuarioLogado || {};
    if (role !== ROLES.ADMIN && role !== ROLES.ADMIN_MASTER) return;

    const idReferencia = Number(res.locals.idReferencia ?? req.params[idParam]);

    LogSistemaService.registrar({
      idAdmin: id,
      acao: typeof acao === 'function' ? acao(req) : acao,
      entidade,
      idReferencia: Number.isInteger(idReferencia) ? idReferencia : null,
    });
  });
  next();
};