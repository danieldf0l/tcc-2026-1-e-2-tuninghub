import AdminService from '../services/admin.service.js';
import LogSistemaService from '../services/logSistema.service.js';

class AdminController {
  listar = async (req, res, next) => {
    try {
      const admins = await AdminService.listarAdmins();
      res.status(200).json(admins);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const admin = await AdminService.criarAdmin(req.body || {});
      res.locals.idReferencia = admin.id; // o log de criação aponta para o admin novo
      res.status(201).json({ message: 'Administrador criado com sucesso!', admin });
    } catch (error) {
      next(error);
    }
  };

  atualizar = async (req, res, next) => {
    try {
      const admin = await AdminService.atualizarAdmin(req.params.id, req.body || {}, req.usuarioLogado.id);
      res.status(200).json({ message: 'Administrador atualizado com sucesso!', admin });
    } catch (error) {
      next(error);
    }
  };

  atualizarStatus = async (req, res, next) => {
    try {
      const { ativo } = req.body || {};
      const resultado = await AdminService.atualizarStatus(req.params.id, ativo, req.usuarioLogado.id);
      res.status(200).json({
        message: ativo ? 'Administrador reativado com sucesso!' : 'Administrador desativado com sucesso!',
        ...resultado,
      });
    } catch (error) {
      next(error);
    }
  };

  listarLogs = async (req, res, next) => {
    try {
      const logs = await LogSistemaService.listar(req.query);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();