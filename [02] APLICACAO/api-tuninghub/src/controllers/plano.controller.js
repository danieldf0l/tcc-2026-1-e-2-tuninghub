import PlanoService from '../services/plano.service.js';

class PlanoController {
  listar = async (req, res, next) => {
    try {
      const planos = await PlanoService.listarPlanos();
      res.status(200).json(planos);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const plano = await PlanoService.criarPlano(req.body);
      res.status(201).json({ message: 'Plano criado com sucesso!', plano });
    } catch (error) {
      next(error);
    }
  };

  vincularProdutoExterno = async (req, res, next) => {
  try {
    const resultado = await PlanoService.vincularProdutoExterno(req.params.id, req.body.idProdutoExterno);
    res.status(200).json({ message: 'Produto externo vinculado com sucesso!', ...resultado });
  } catch (error) {
    next(error);
  }
};
}

export default new PlanoController();