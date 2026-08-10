import OficinaServicoService from '../services/oficinaServico.service.js';

class OficinaServicoController {
  listar = async (req, res, next) => {
    try {
      const { idOficina } = req.params;
      const servicos = await OficinaServicoService.listarPorOficina(idOficina);
      res.status(200).json(servicos);
    } catch (error) {
      next(error);
    }
  };

  vincular = async (req, res, next) => {
    try {
      const vinculo = await OficinaServicoService.vincularServico(req.body, req.usuarioLogado);
      res.status(201).json({ message: 'Serviço vinculado à oficina com sucesso!', vinculo });
    } catch (error) {
      next(error);
    }
  };

  desvincular = async (req, res, next) => {
    try {
      const { idOficina, idServico } = req.params;
      const resultado = await OficinaServicoService.desvincularServico(idOficina, idServico, req.usuarioLogado);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new OficinaServicoController();