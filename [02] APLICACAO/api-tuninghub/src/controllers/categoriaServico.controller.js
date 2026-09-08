import CategoriaServicoService from '../services/categoriaServico.service.js';

class CategoriaServicoController {
  listar = async (req, res, next) => {
    try {
      const categorias = await CategoriaServicoService.listarCategorias();
      res.status(200).json(categorias);
    } catch (error) {
      next(error);
    }
  };

  listarAdmin = async (req, res, next) => {
    try {
      const categorias = await CategoriaServicoService.listarCategoriasAdmin();
      res.status(200).json(categorias);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const categoria = await CategoriaServicoService.criarCategoria(req.body);
      res.status(201).json({ message: 'Categoria criada com sucesso!', categoria });
    } catch (error) {
      next(error);
    }
  };

  atualizar = async (req, res, next) => {
    try {
      const categoria = await CategoriaServicoService.atualizarCategoria(req.params.id, req.body);
      res.status(200).json({ message: 'Categoria atualizada com sucesso!', categoria });
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req, res, next) => {
    try {
      const resultado = await CategoriaServicoService.atualizarStatus(req.params.id, false);
      res.status(200).json({ message: 'Categoria desativada com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req, res, next) => {
    try {
      const resultado = await CategoriaServicoService.atualizarStatus(req.params.id, true);
      res.status(200).json({ message: 'Categoria reativada com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };
}

export default new CategoriaServicoController();