import ProjetoServicoService from "../services/projetoServico.service.js";

class ProjetoServicoController {
  listar = async (req, res, next) => {
    try {
      const { idProjeto } = req.params;
      const servicos = await ProjetoServicoService.listarPorProjeto(
        idProjeto,
        req.usuarioLogado,
      );
      res.status(200).json(servicos);
    } catch (error) {
      next(error);
    }
  };

  vincular = async (req, res, next) => {
    try {
      const vinculo = await ProjetoServicoService.adicionarServico(
        req.body,
        req.usuarioLogado,
      );
      res
        .status(201)
        .json({
          message: "Serviço adicionado ao projeto com sucesso!",
          vinculo,
        });
    } catch (error) {
      next(error);
    }
  };

  desvincular = async (req, res, next) => {
    try {
      const { idProjeto, idServico } = req.params;
      const resultado = await ProjetoServicoService.removerServico(
        idProjeto,
        idServico,
        req.usuarioLogado,
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  marcarConcluido = async (req, res, next) => {
    try {
      const { idProjeto, idServico } = req.params;
      const { concluido } = req.body || {};
      const resultado = await ProjetoServicoService.marcarConcluido(
        idProjeto,
        idServico,
        concluido,
        req.usuarioLogado,
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new ProjetoServicoController();
