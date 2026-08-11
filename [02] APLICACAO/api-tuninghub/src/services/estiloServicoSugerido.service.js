import EstiloServicoSugeridoRepository from '../repositories/estiloServicoSugerido.repository.js';
import ServicoRepository from '../repositories/servico.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { ESTILOS } from '../constants/estilos.js';

class EstiloServicoSugeridoService {
  async listarPorEstilo(estilo) {
    if (!ESTILOS.includes(estilo)) {
      throw new ValidationError(`Estilo inválido. Use um dos: ${ESTILOS.join(', ')}.`);
    }
    return await EstiloServicoSugeridoRepository.findByEstilo(estilo);
  }

  async vincular(dados) {
    const { estilo, idServico } = dados;

    if (!estilo || !idServico) {
      throw new ValidationError('Os campos estilo e idServico são obrigatórios.');
    }
    if (!ESTILOS.includes(estilo)) {
      throw new ValidationError(`Estilo inválido. Use um dos: ${ESTILOS.join(', ')}.`);
    }

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