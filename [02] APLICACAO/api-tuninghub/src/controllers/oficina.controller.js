import OficinaService from '../services/oficina.service.js';

class OficinaController {
  listar = async (req, res, next) => {
    try {
      const oficinas = await OficinaService.listarOficinas();
      res.status(200).json(oficinas);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const oficina = await OficinaService.criarOficina(req.body);
      res.status(201).json({ message: 'Oficina cadastrada com sucesso!', oficina });
    } catch (error) {
      next(error);
    }
  };
}

export default new OficinaController();