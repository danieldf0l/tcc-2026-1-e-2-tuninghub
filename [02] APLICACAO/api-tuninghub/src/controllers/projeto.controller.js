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

  listarMeusInativos = async (req, res, next) => {
    try {
      const projetos = await ProjetoService.listarMeusProjetosInativos(req.usuarioLogado);
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

  atualizar = async (req, res, next) => {
    try {
      const projeto = await ProjetoService.atualizarProjeto(req.params.id, req.body || {}, req.usuarioLogado);
      res.status(200).json({ message: 'Projeto atualizado com sucesso!', projeto });
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req, res, next) => {
    try {
      const resultado = await ProjetoService.desativarProjeto(req.params.id, req.usuarioLogado);
      res.status(200).json({ message: 'Projeto desativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req, res, next) => {
    try {
      const resultado = await ProjetoService.reativarProjeto(req.params.id, req.usuarioLogado);
      res.status(200).json({ message: 'Projeto reativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };
}

export default new ProjetoController();