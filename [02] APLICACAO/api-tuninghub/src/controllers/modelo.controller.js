import ModeloService from '../services/modelo.service.js';

class ModeloController {
  listar = async (req, res, next) => {
    try {
      const modelos = await ModeloService.listarModelos();
      res.status(200).json(modelos);
    } catch (error) {
      next(error);
    }
  };

  listarPorMontadora = async (req, res, next) => {
    try {
      const { idMontadora } = req.params;
      const modelos = await ModeloService.listarPorMontadora(idMontadora);
      res.status(200).json(modelos);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const modelo = await ModeloService.criarModelo(req.body);
      res.status(201).json({ message: 'Modelo registrado com sucesso!', modelo });
    } catch (error) {
      next(error);
    }
  };
}

export default new ModeloController();