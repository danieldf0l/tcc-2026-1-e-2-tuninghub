import EstiloServicoSugeridoService from '../services/estiloServicoSugerido.service.js';

class EstiloServicoSugeridoController {
  listar = async (req, res, next) => {
    try {
      const servicos = await EstiloServicoSugeridoService.listarPorEstilo(req.params.estilo);
      res.status(200).json(servicos);
    } catch (error) {
      next(error);
    }
  };

  vincular = async (req, res, next) => {
    try {
      const vinculo = await EstiloServicoSugeridoService.vincular(req.body);
      res.status(201).json({ message: 'Serviço vinculado ao estilo com sucesso!', vinculo });
    } catch (error) {
      next(error);
    }
  };

  desvincular = async (req, res, next) => {
    try {
      const resultado = await EstiloServicoSugeridoService.desvincular(req.params.estilo, req.params.idServico);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new EstiloServicoSugeridoController();