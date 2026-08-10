import AssinaturaService from '../services/assinatura.service.js';

class AssinaturaController {
  listar = async (req, res, next) => {
    try {
      const assinaturas = await AssinaturaService.listarAssinaturas();
      res.status(200).json(assinaturas);
    } catch (error) {
      next(error);
    }
  };

  criarGratuita = async (req, res, next) => {
    try {
      const assinatura = await AssinaturaService.criarAssinaturaGratuita(req.body, req.usuarioLogado);
      res.status(201).json({ message: 'Assinatura gratuita ativada com sucesso!', assinatura });
    } catch (error) {
      next(error);
    }
  };

  checkout = async (req, res, next) => {
    try {
      const resultado = await AssinaturaService.iniciarCheckout(req.body, req.usuarioLogado);
      res.status(201).json({ message: 'Checkout gerado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  confirmarPagamento = async (req, res, next) => {
    try {
      const resultado = await AssinaturaService.confirmarPagamento(req.params.id, req.usuarioLogado);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new AssinaturaController();