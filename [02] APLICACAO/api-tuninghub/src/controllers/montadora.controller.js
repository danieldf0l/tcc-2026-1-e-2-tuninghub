import MontadoraService from '../services/montadora.service.js';

class MontadoraController {
  listar = async (req, res, next) => {
    try {
      const montadoras = await MontadoraService.listarMontadoras();
      res.status(200).json(montadoras);
    } catch (error) {
      next(error);
    }
  };

  listarAdmin = async (req, res, next) => {
    try {
      const montadoras = await MontadoraService.listarMontadorasAdmin();
      res.status(200).json(montadoras);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const montadora = await MontadoraService.criarMontadora(req.body);
      res.status(201).json({ message: 'Montadora cadastrada com sucesso!', montadora });
    } catch (error) {
      next(error);
    }
  };

  atualizar = async (req, res, next) => {
    try {
      const montadora = await MontadoraService.atualizarMontadora(req.params.id, req.body);
      res.status(200).json({ message: 'Montadora atualizada com sucesso!', montadora });
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req, res, next) => {
    try {
      const resultado = await MontadoraService.atualizarStatus(req.params.id, false);
      res.status(200).json({ message: 'Montadora desativada com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req, res, next) => {
    try {
      const resultado = await MontadoraService.atualizarStatus(req.params.id, true);
      res.status(200).json({ message: 'Montadora reativada com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };
}

export default new MontadoraController();