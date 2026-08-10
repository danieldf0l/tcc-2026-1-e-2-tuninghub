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

  criar = async (req, res, next) => {
    try {
      const servico = await ServicoService.criarServico(req.body);
      res.status(201).json({ message: 'Serviço adicionado ao catálogo com sucesso!', servico });
    } catch (error) {
      next(error);
    }
  };
}

export default new ServicoController();