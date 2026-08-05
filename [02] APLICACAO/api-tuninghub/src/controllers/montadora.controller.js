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

  criar = async (req, res, next) => {
    try {
      const montadora = await MontadoraService.criarMontadora(req.body);
      res.status(201).json({ message: 'Montadora cadastrada com sucesso!', montadora });
    } catch (error) {
      next(error);
    }
  };
}

export default new MontadoraController();