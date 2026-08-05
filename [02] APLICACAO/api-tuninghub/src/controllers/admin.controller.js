import AdminService from '../services/admin.service.js';

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
      const admin = await AdminService.criarAdmin(req.body);
      res.status(201).json({ message: 'Administrador criado com sucesso!', admin });
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();