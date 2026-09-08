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

atualizar = async (req, res, next) => {
  try {
    const plano = await PlanoService.atualizarPlano(req.params.id, req.body);
    res.status(200).json({ message: 'Plano atualizado com sucesso!', plano });
  } catch (error) {
    next(error);
  }
};

desativar = async (req, res, next) => {
  try {
    const resultado = await PlanoService.atualizarStatus(req.params.id, false);
    res.status(200).json({ message: 'Plano desativado com sucesso!', ...resultado });
  } catch (error) {
    next(error);
  }
};

reativar = async (req, res, next) => {
  try {
    const resultado = await PlanoService.atualizarStatus(req.params.id, true);
    res.status(200).json({ message: 'Plano reativado com sucesso!', ...resultado });
  } catch (error) {
    next(error);
  }
};

listarAdmin = async (req, res, next) => {
  try {
    const planos = await PlanoService.listarPlanosAdmin();
    res.status(200).json(planos);
  } catch (error) {
    next(error);
  }
};
}

export default new PlanoController();