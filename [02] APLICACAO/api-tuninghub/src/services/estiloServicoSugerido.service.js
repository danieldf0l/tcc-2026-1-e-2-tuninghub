import EstiloServicoSugeridoRepository from '../repositories/estiloServicoSugerido.repository.js';
import ServicoRepository from '../repositories/servico.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import EstiloRepository from '../repositories/estilo.repository.js';

class EstiloServicoSugeridoService {
  async listarPorEstilo(estilo) {
    const estiloValido = await EstiloRepository.findByCodigoAtivo(estilo);
    if (!estiloValido) throw new ValidationError('Estilo inválido ou inativo.');
    return await EstiloServicoSugeridoRepository.findByEstilo(estilo);
  }

  async vincular(dados) {
    const { estilo, idServico } = dados;
    if (!estilo || !idServico) {
      throw new ValidationError('Os campos estilo e idServico são obrigatórios.');
    }
    const estiloValido = await EstiloRepository.findByCodigoAtivo(estilo);
    if (!estiloValido) throw new ValidationError('Estilo inválido ou inativo.');

    const servico = await ServicoRepository.findById(idServico);
    if (!servico) throw new NotFoundError('Serviço não encontrado.');

    const existente = await EstiloServicoSugeridoRepository.checkVinculo(estilo, idServico);
    if (existente) throw new ConflictError('Este serviço já está vinculado a este estilo.');

    const novoId = await EstiloServicoSugeridoRepository.vincular(estilo, idServico);
    return { idEstiloServico: novoId, estilo, idServico };
  }

  async desvincular(estilo, idServico) {
    const linhasAfetadas = await EstiloServicoSugeridoRepository.desvincular(estilo, idServico);
    if (linhasAfetadas === 0) throw new NotFoundError('Vínculo não encontrado.');
    return { message: 'Serviço desvinculado do estilo com sucesso.' };
  }
}

export default new EstiloServicoSugeridoService();