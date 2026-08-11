import ProjetoService from '../services/projeto.service.js';

class ProjetoController {
  listar = async (req, res, next) => {
    try {
      const projetos = await ProjetoService.listarProjetos();
      res.status(200).json(projetos);
    } catch (error) {
      next(error);
    }
  };

  listarMeus = async (req, res, next) => {
    try {
      const projetos = await ProjetoService.listarMeusProjetos(req.usuarioLogado);
      res.status(200).json(projetos);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const projeto = await ProjetoService.criarProjeto(req.body, req.usuarioLogado);
      res.status(201).json({ message: 'Projeto criado com sucesso!', projeto });
    } catch (error) {
      next(error);
    }
  };
}

export default new ProjetoController();