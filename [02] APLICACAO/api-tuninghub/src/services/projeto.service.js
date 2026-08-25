import ProjetoServicoRepository from '../repositories/projetoServico.repository.js';
import ProjetoRepository from '../repositories/projeto.repository.js';
import ModeloRepository from '../repositories/modelo.repository.js';
import EstiloServicoSugeridoRepository from '../repositories/estiloServicoSugerido.repository.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';
import { ESTILOS } from '../constants/estilos.js';


const LIMITE_PROJETOS_ATIVOS = 3;
const TIPOS_CUSTOMIZACAO = ['ESTILO', 'PERSONALIZADA'];

const resolverIdUsuario = (idUsuarioInformado, usuarioLogado) => {
  const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
  return ehAdmin ? idUsuarioInformado : usuarioLogado.id;
};

class ProjetoService {
  async listarProjetos() {
    return await ProjetoRepository.findAll();
  }

  async listarMeusProjetos(usuarioLogado) {
    return await ProjetoRepository.findByUsuario(usuarioLogado.id);
  }

  async criarProjeto(dados, usuarioLogado) {
    const idUsuario = resolverIdUsuario(dados.idUsuario, usuarioLogado);
    const { idModelo, descricao, tipoCustomizacao, estilo } = dados;

    // RN08: marca + modelo obrigatórios (idModelo já carrega essa relação)
    if (!idUsuario || !idModelo) {
      throw new ValidationError('Os campos idUsuario e idModelo são obrigatórios.');
    }

    // RN09: modo de customização obrigatório
    if (!tipoCustomizacao || !TIPOS_CUSTOMIZACAO.includes(tipoCustomizacao)) {
      throw new ValidationError(`tipoCustomizacao é obrigatório e deve ser um dos: ${TIPOS_CUSTOMIZACAO.join(', ')}.`);
    }
    if (tipoCustomizacao === 'ESTILO' && (!estilo || !ESTILOS.includes(estilo))) {
      throw new ValidationError(`Para customização por estilo, informe um estilo válido: ${ESTILOS.join(', ')}.`);
    }

    const modelo = await ModeloRepository.findByIdAtivo(idModelo)
    if (!modelo) throw new NotFoundError('Modelo não encontrado.');

    // RN07: máximo 3 projetos ativos por usuário
    const totalAtivos = await ProjetoRepository.countAtivosPorUsuario(idUsuario);
    if (totalAtivos >= LIMITE_PROJETOS_ATIVOS) {
      throw new ConflictError(`Limite de ${LIMITE_PROJETOS_ATIVOS} projetos ativos atingido.`);
    }

    const novoId = await ProjetoRepository.create({ idUsuario, idModelo, descricao, tipoCustomizacao, estilo });

    let servicosSugeridos = [];
    if (tipoCustomizacao === 'ESTILO') {
      servicosSugeridos = await EstiloServicoSugeridoRepository.findByEstilo(estilo);
      const idsServicos = servicosSugeridos.map((s) => s.IdServico);
      await ProjetoServicoRepository.vincularVarios(novoId, idsServicos);
    }

    return {
      id: novoId,
      idUsuario,
      idModelo,
      descricao,
      tipoCustomizacao,
      estilo,
      servicosSugeridos,
    };
  }
}

export default new ProjetoService();