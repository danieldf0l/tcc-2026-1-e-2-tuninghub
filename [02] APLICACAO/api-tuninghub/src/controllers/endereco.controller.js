import EnderecoService from '../services/endereco.service.js';

class EnderecoController {
  buscar = async (req, res, next) => {
    try {
      const { idOficina } = req.params;
      const endereco = await EnderecoService.obterEndereco(idOficina);
      res.status(200).json(endereco);
    } catch (error) {
      next(error);
    }
  };

  salvar = async (req, res, next) => {
    try {
      const { idOficina } = req.params;
      const resultado = await EnderecoService.salvarEndereco(idOficina, req.body);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new EnderecoController();