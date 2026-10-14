import ProjetoRepository from '../repositories/projeto.repository.js';
import ModeloRepository from '../repositories/modelo.repository.js';
import EstiloRepository from '../repositories/estilo.repository.js';
import EstiloServicoSugeridoRepository from '../repositories/estiloServicoSugerido.repository.js';
import ProjetoServicoRepository from '../repositories/projetoServico.repository.js';
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';

const LIMITE_PROJETOS_ATIVOS = 3;
const TIPOS_CUSTOMIZACAO = ['ESTILO', 'PERSONALIZADA'];
const CAMPOS_TRAVADOS = ['idModelo', 'tipoCustomizacao', 'estilo'];

const ehAdmin = (usuarioLogado) =>
  usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;

const resolverIdUsuario = (idUsuarioInformado, usuarioLogado) =>
  ehAdmin(usuarioLogado) ? idUsuarioInformado : usuarioLogado.id;

// Garante que o logado é o dono do projeto (ou admin). Nunca confia em id vindo do body.
const verificarDono = (projeto, usuarioLogado) => {
  const ehDono = String(projeto.IdUsuario) === String(usuarioLogado.id);
  if (!ehAdmin(usuarioLogado) && !ehDono) {
    throw new ForbiddenError('Você não tem permissão para alterar este projeto.');
  }
};

class ProjetoService {
  async listarProjetos() {
    return await ProjetoRepository.findAll();
  }

  async listarMeusProjetos(usuarioLogado) {
    return await ProjetoRepository.findByUsuario(usuarioLogado.id);
  }

  async listarMeusProjetosInativos(usuarioLogado) {
    return await ProjetoRepository.findInativosByUsuario(usuarioLogado.id);
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

    if (tipoCustomizacao === 'ESTILO') {
      if (!estilo) throw new ValidationError('Para customização por estilo, informe um estilo.');
      const estiloValido = await EstiloRepository.findByCodigoAtivo(estilo);
      if (!estiloValido) throw new ValidationError('Estilo inválido ou inativo.');
    }

    const modelo = await ModeloRepository.findById(idModelo);
    if (!modelo) throw new NotFoundError('Modelo não encontrado.');

    // RN07: máximo 3 projetos ativos por usuário
    const totalAtivos = await ProjetoRepository.countAtivosPorUsuario(idUsuario);
    if (totalAtivos >= LIMITE_PROJETOS_ATIVOS) {
      throw new ConflictError(`Limite de ${LIMITE_PROJETOS_ATIVOS} projetos ativos atingido.`);
    }

    const novoId = await ProjetoRepository.create({ idUsuario, idModelo, descricao, tipoCustomizacao, estilo });

    // RN10: gera a To-do List automaticamente
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

  // Só a descrição é editável: modelo, tipo e estilo definem a To-do List gerada (RN09/RN10).
  async atualizarProjeto(idProjeto, dados, usuarioLogado) {
    const projeto = await ProjetoRepository.findById(idProjeto);
    if (!projeto) throw new NotFoundError('Projeto não encontrado.');
    verificarDono(projeto, usuarioLogado);

    if (CAMPOS_TRAVADOS.some((campo) => dados[campo] !== undefined)) {
      throw new ValidationError(
        'Modelo, tipo de customização e estilo não podem ser alterados. Crie um novo projeto se precisar mudá-los.'
      );
    }
    if (dados.descricao === undefined) {
      throw new ValidationError('Informe o campo descricao para atualizar.');
    }
    if (dados.descricao !== null && typeof dados.descricao !== 'string') {
      throw new ValidationError('A descrição deve ser um texto.');
    }

    // string vazia ou null limpa a descrição
    const descricao = dados.descricao ? dados.descricao.trim() || null : null;
    await ProjetoRepository.atualizarDescricao(idProjeto, descricao);

    return await ProjetoRepository.findById(idProjeto);
  }

  async desativarProjeto(idProjeto, usuarioLogado) {
    const projeto = await ProjetoRepository.findByIdQualquerStatus(idProjeto);
    if (!projeto) throw new NotFoundError('Projeto não encontrado.');
    verificarDono(projeto, usuarioLogado);

    if (!projeto.Ativo) throw new ConflictError('Este projeto já está desativado.');

    await ProjetoRepository.atualizarStatus(idProjeto, false);
    return { idProjeto: Number(idProjeto), ativo: false };
  }

  async reativarProjeto(idProjeto, usuarioLogado) {
    const projeto = await ProjetoRepository.findByIdQualquerStatus(idProjeto);
    if (!projeto) throw new NotFoundError('Projeto não encontrado.');
    verificarDono(projeto, usuarioLogado);

    if (projeto.Ativo) throw new ConflictError('Este projeto já está ativo.');

    // RN07 vale também ao reativar
    const totalAtivos = await ProjetoRepository.countAtivosPorUsuario(projeto.IdUsuario);
    if (totalAtivos >= LIMITE_PROJETOS_ATIVOS) {
      throw new ConflictError(
        `Limite de ${LIMITE_PROJETOS_ATIVOS} projetos ativos atingido. Desative outro projeto para reativar este.`
      );
    }

    await ProjetoRepository.atualizarStatus(idProjeto, true);
    return { idProjeto: Number(idProjeto), ativo: true };
  }
}

export default new ProjetoService();