import GeocodificacaoService from '../services/geocodificacao.service.js';
import { ValidationError } from '../errors/AppError.js';

class GeolocalizacaoController {
  geocodificar = async (req, res, next) => {
    try {
      const { rua, numero, bairro, cidade, estado, cep } = req.query;

      if (!rua && !cep) {
        throw new ValidationError('Informe ao menos "rua" ou "cep" na busca.');
      }

      const resultado = await GeocodificacaoService.geocodificar({ rua, numero, bairro, cidade, estado, cep });
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new GeolocalizacaoController();