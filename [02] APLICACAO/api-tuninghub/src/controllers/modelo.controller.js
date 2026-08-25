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

  listarAdmin = async (req, res, next) => {
    try {
      const modelos = await ModeloService.listarModelosAdmin();
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

  atualizar = async (req, res, next) => {
    try {
      const modelo = await ModeloService.atualizarModelo(req.params.id, req.body);
      res.status(200).json({ message: 'Modelo atualizado com sucesso!', modelo });
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req, res, next) => {
    try {
      const resultado = await ModeloService.atualizarStatus(req.params.id, false);
      res.status(200).json({ message: 'Modelo desativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req, res, next) => {
    try {
      const resultado = await ModeloService.atualizarStatus(req.params.id, true);
      res.status(200).json({ message: 'Modelo reativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };
}

export default new ModeloController();