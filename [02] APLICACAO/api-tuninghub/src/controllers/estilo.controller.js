import EstiloService from '../services/estilo.service.js';

class EstiloController {
  listar = async (req, res, next) => {
    try {
      const estilos = await EstiloService.listarEstilos();
      res.status(200).json(estilos);
    } catch (error) {
      next(error);
    }
  };

  listarAdmin = async (req, res, next) => {
    try {
      const estilos = await EstiloService.listarEstilosAdmin();
      res.status(200).json(estilos);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const estilo = await EstiloService.criarEstilo(req.body);
      res.status(201).json({ message: 'Estilo criado com sucesso!', estilo });
    } catch (error) {
      next(error);
    }
  };

  atualizar = async (req, res, next) => {
    try {
      const estilo = await EstiloService.atualizarEstilo(req.params.id, req.body);
      res.status(200).json({ message: 'Estilo atualizado com sucesso!', estilo });
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req, res, next) => {
    try {
      const resultado = await EstiloService.atualizarStatus(req.params.id, false);
      res.status(200).json({ message: 'Estilo desativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req, res, next) => {
    try {
      const resultado = await EstiloService.atualizarStatus(req.params.id, true);
      res.status(200).json({ message: 'Estilo reativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };
}

export default new EstiloController();