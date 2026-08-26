import ServicoService from '../services/servico.service.js';

class ServicoController {
  listar = async (req, res, next) => {
    try {
      const servicos = await ServicoService.listarServicos();
      res.status(200).json(servicos);
    } catch (error) {
      next(error);
    }
  };

  listarAdmin = async (req, res, next) => {
    try {
      const servicos = await ServicoService.listarServicosAdmin();
      res.status(200).json(servicos);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const servico = await ServicoService.criarServico(req.body);
      res.status(201).json({ message: 'Serviço adicionado ao catálogo com sucesso!', servico });
    } catch (error) {
      next(error);
    }
  };

  atualizar = async (req, res, next) => {
    try {
      const servico = await ServicoService.atualizarServico(req.params.id, req.body);
      res.status(200).json({ message: 'Serviço atualizado com sucesso!', servico });
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req, res, next) => {
    try {
      const resultado = await ServicoService.atualizarStatus(req.params.id, false);
      res.status(200).json({ message: 'Serviço desativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req, res, next) => {
    try {
      const resultado = await ServicoService.atualizarStatus(req.params.id, true);
      res.status(200).json({ message: 'Serviço reativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };
}

export default new ServicoController();