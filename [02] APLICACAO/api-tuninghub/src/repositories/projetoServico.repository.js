import db from '../config/db.js';

class ProjetoServicoRepository {
  async findByProjeto(idProjeto) {
  const query = `
    SELECT ps.IdProjetoServico, s.IdServico, s.Nome, s.Descricao, c.Nome AS Categoria, ps.Concluido
    FROM projetoservico ps
    INNER JOIN servico s ON ps.IdServico = s.IdServico
    INNER JOIN categoriaservico c ON c.IdCategoria = s.IdCategoria
    WHERE ps.IdProjeto = ?
    ORDER BY c.Nome, s.Nome
  `;
  const [rows] = await db.execute(query, [idProjeto]);
  return rows;
}

  async checkVinculo(idProjeto, idServico) {
    const query = 'SELECT * FROM projetoservico WHERE IdProjeto = ? AND IdServico = ?';
    const [rows] = await db.execute(query, [idProjeto, idServico]);
    return rows[0];
  }

  async vincular(idProjeto, idServico) {
    const query = 'INSERT INTO projetoservico (IdProjeto, IdServico) VALUES (?, ?)';
    const [result] = await db.execute(query, [idProjeto, idServico]);
    return result.insertId;
  }

  // Usado na geração automática da To-do List (RN10) -- ignora duplicados silenciosamente
  async vincularVarios(idProjeto, idServicos) {
    if (!idServicos.length) return;
    const valores = idServicos.map((idServico) => [idProjeto, idServico]);
    await db.query('INSERT IGNORE INTO projetoservico (IdProjeto, IdServico) VALUES ?', [valores]);
  }

  async desvincular(idProjeto, idServico) {
    const query = 'DELETE FROM projetoservico WHERE IdProjeto = ? AND IdServico = ?';
    const [result] = await db.execute(query, [idProjeto, idServico]);
    return result.affectedRows;
  }

  async marcarConcluido(idProjeto, idServico, concluido) {
    const query = 'UPDATE projetoservico SET Concluido = ? WHERE IdProjeto = ? AND IdServico = ?';
    const [result] = await db.execute(query, [concluido ? 1 : 0, idProjeto, idServico]);
    return result.affectedRows;
  }
}

export default new ProjetoServicoRepository();