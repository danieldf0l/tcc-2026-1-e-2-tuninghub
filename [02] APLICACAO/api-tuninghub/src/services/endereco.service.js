import EnderecoRepository from '../repositories/endereco.repository.js';
import GeocodificacaoService from './geocodificacao.service.js';
import { ValidationError, NotFoundError } from '../errors/AppError.js';
import { calcularDistanciaKm } from '../utils/geolocalizacao.js';
import { SENAC_LATITUDE, SENAC_LONGITUDE, RAIO_MAXIMO_KM } from '../constants/localizacaoSenac.js';

class EnderecoService {
  async obterEndereco(idOficina) {
    if (!idOficina) throw new ValidationError('Id da oficina é obrigatório.');
    const endereco = await EnderecoRepository.findByOficina(idOficina);
    if (!endereco) throw new NotFoundError('Endereço não encontrado para esta oficina.');
    return endereco;
  }

  async salvarEndereco(idOficina, dados) {
    if (!idOficina) throw new ValidationError('Id da oficina é obrigatório.');

    const { rua, numero, bairro, cidade, estado, cep } = dados;
    if (!rua || !cidade || !estado || !cep) {
      throw new ValidationError('Rua, Cidade, Estado e CEP são obrigatórios para localização.');
    }

    const { latitude, longitude } = await GeocodificacaoService.geocodificar({ rua, numero, bairro, cidade, estado, cep });
    const distanciaKm = calcularDistanciaKm(SENAC_LATITUDE, SENAC_LONGITUDE, latitude, longitude);

    if (distanciaKm > RAIO_MAXIMO_KM) {
      throw new ValidationError(
        `Endereço fora da área de atuação da plataforma (${distanciaKm.toFixed(1)}km do SENAC Nações Unidas, limite de ${RAIO_MAXIMO_KM}km).`
      );
    }

    const dadosCompletos = { ...dados, latitude, longitude };
    const enderecoExistente = await EnderecoRepository.findByOficina(idOficina);

    if (enderecoExistente) {
      await EnderecoRepository.update(idOficina, dadosCompletos);
      return { message: 'Endereço atualizado com sucesso.', idOficina, distanciaKm: Number(distanciaKm.toFixed(2)) };
    }

    const novoId = await EnderecoRepository.create({ idOficina, ...dadosCompletos });
    return { message: 'Endereço cadastrado com sucesso.', idEndereco: novoId, distanciaKm: Number(distanciaKm.toFixed(2)) };
  }
}

export default new EnderecoService();