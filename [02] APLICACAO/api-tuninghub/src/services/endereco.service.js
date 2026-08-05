import EnderecoRepository from '../repositories/endereco.repository.js';
import { ValidationError, NotFoundError } from '../errors/AppError.js';

class EnderecoService {
  async obterEndereco(idOficina) {
    if (!idOficina) throw new ValidationError('Id da oficina é obrigatório.');
    const endereco = await EnderecoRepository.findByOficina(idOficina);
    if (!endereco) throw new NotFoundError('Endereço não encontrado para esta oficina.');
    return endereco;
  }

  async salvarEndereco(idOficina, dados) {
    if (!idOficina) throw new ValidationError('Id da oficina é obrigatório.');

    const { rua, cidade, estado, cep } = dados;
    if (!rua || !cidade || !estado || !cep) {
      throw new ValidationError('Rua, Cidade, Estado e CEP são obrigatórios para localização.');
    }

    const enderecoExistente = await EnderecoRepository.findByOficina(idOficina);

    if (enderecoExistente) {
      await EnderecoRepository.update(idOficina, dados);
      return { message: 'Endereço atualizado com sucesso.', idOficina };
    }

    const novoId = await EnderecoRepository.create({ idOficina, ...dados });
    return { message: 'Endereço cadastrado com sucesso.', idEndereco: novoId };
  }
}

export default new EnderecoService();