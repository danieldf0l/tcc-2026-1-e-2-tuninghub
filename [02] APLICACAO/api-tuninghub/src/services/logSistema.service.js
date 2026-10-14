import LogSistemaRepository from '../repositories/logSistema.repository.js';
import { ValidationError } from '../errors/AppError.js';

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

class LogSistemaService {
  // Nunca lança erro: falha no log não pode derrubar a ação do admin.
  async registrar({ idAdmin, acao, entidade, idReferencia }) {
    try {
      await LogSistemaRepository.create({ idAdmin, acao, entidade, idReferencia });
    } catch (error) {
      console.error('[logsistema] Falha ao registrar ação:', error.message);
    }
  }

  async listar({ idAdmin, entidade, de, ate, pagina, limite } = {}) {
    if (idAdmin !== undefined && !Number.isInteger(Number(idAdmin))) {
      throw new ValidationError('idAdmin deve ser numérico.');
    }
    if (de !== undefined && !FORMATO_DATA.test(String(de))) {
      throw new ValidationError('O filtro "de" deve estar no formato AAAA-MM-DD.');
    }
    if (ate !== undefined && !FORMATO_DATA.test(String(ate))) {
      throw new ValidationError('O filtro "ate" deve estar no formato AAAA-MM-DD.');
    }

    const paginaAtual = Math.max(1, parseInt(pagina, 10) || 1);
    const itensPorPagina = Math.min(100, Math.max(1, parseInt(limite, 10) || 20));

    const { itens, total } = await LogSistemaRepository.listar({
      idAdmin: idAdmin !== undefined ? Number(idAdmin) : undefined,
      entidade: entidade ? String(entidade).trim() : undefined,
      de: de !== undefined ? String(de) : undefined,
      ate: ate !== undefined ? String(ate) : undefined,
      limite: itensPorPagina,
      offset: (paginaAtual - 1) * itensPorPagina,
    });

    return {
      pagina: paginaAtual,
      limite: itensPorPagina,
      total,
      totalPaginas: Math.ceil(total / itensPorPagina),
      itens,
    };
  }
}

export default new LogSistemaService();