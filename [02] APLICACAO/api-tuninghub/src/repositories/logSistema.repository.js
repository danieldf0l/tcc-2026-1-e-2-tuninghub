import db from '../config/db.js';

class LogSistemaRepository {
  async create({ idAdmin, acao, entidade, idReferencia }) {
    const query = `
      INSERT INTO logsistema (IdAdmin, Acao, Entidade, IdReferencia)
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [idAdmin, acao, entidade || null, idReferencia ?? null]);
  }

  // limite e offset chegam validados como inteiros (service), por isso vão direto no SQL
  async listar({ idAdmin, entidade, de, ate, limite, offset }) {
    const condicoes = [];
    const params = [];

    if (idAdmin !== undefined) { condicoes.push('l.IdAdmin = ?'); params.push(idAdmin); }
    if (entidade) { condicoes.push('l.Entidade = ?'); params.push(entidade); }
    if (de) { condicoes.push('l.DataAcao >= ?'); params.push(de); }
    if (ate) { condicoes.push('l.DataAcao < DATE_ADD(?, INTERVAL 1 DAY)'); params.push(ate); }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const [itens] = await db.execute(
      `SELECT l.IdLog, l.IdAdmin, a.Nome AS NomeAdmin, l.Acao, l.Entidade, l.IdReferencia, l.DataAcao
       FROM logsistema l
       INNER JOIN admin a ON a.IdAdmin = l.IdAdmin
       ${where}
       ORDER BY l.DataAcao DESC, l.IdLog DESC
       LIMIT ${limite} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM logsistema l ${where}`, params);

    return { itens, total };
  }
}

export default new LogSistemaRepository();