import OficinaService from '../services/oficina.service.js';

class OficinaController {
  listar = async (req, res, next) => {
    try {
      const oficinas = await OficinaService.listarOficinas();
      res.status(200).json(oficinas);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const oficina = await OficinaService.criarOficina(req.body);
      res.status(201).json({ message: 'Oficina cadastrada com sucesso!', oficina });
    } catch (error) {
      next(error);
    }
  };

  buscar = async (req, res, next) => {
  try {
    const { idServico, lat, lng } = req.query;
    const resultado = await OficinaService.buscarOficinas({ idServico, lat, lng });
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

aceitarTermos = async (req, res, next) => {
  try {
    const resultado = await OficinaService.aceitarTermos(req.usuarioLogado.id);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

listarAdmin = async (req, res, next) => {
  try {
    const oficinas = await OficinaService.listarOficinasAdmin();
    res.status(200).json(oficinas);
  } catch (error) {
    next(error);
  }
};

atualizarFaixaPreco = async (req, res, next) => {
  try {
    const resultado = await OficinaService.atualizarFaixaPreco(req.params.id, req.body.faixaPreco);
    res.status(200).json({ message: 'Faixa de preço atualizada com sucesso!', ...resultado });
  } catch (error) {
    next(error);
  }
};

desativar = async (req, res, next) => {
  try {
    const resultado = await OficinaService.atualizarStatus(req.params.id, false);
    res.status(200).json({ message: 'Oficina desativada com sucesso!', ...resultado });
  } catch (error) {
    next(error);
  }
};

reativar = async (req, res, next) => {
  try {
    const resultado = await OficinaService.atualizarStatus(req.params.id, true);
    res.status(200).json({ message: 'Oficina reativada com sucesso!', ...resultado });
  } catch (error) {
    next(error);
  }
};
}

export default new OficinaController();