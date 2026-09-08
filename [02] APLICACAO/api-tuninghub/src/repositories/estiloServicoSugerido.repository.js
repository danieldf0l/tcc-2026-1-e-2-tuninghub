import db from '../config/db.js';

class EstiloServicoSugeridoRepository {
  async findByEstilo(estilo) {
  const query = `
    SELECT ess.IdEstiloServico, s.IdServico, s.Nome, s.Descricao, c.Nome AS Categoria
    FROM estiloservicosugerido ess
    INNER JOIN servico s ON ess.IdServico = s.IdServico
    INNER JOIN categoriaservico c ON c.IdCategoria = s.IdCategoria
    WHERE ess.Estilo = ?
  `;
  const [rows] = await db.execute(query, [estilo]);
  return rows;
}

  async checkVinculo(estilo, idServico) {
    const query = 'SELECT * FROM estiloservicosugerido WHERE Estilo = ? AND IdServico = ?';
    const [rows] = await db.execute(query, [estilo, idServico]);
    return rows[0];
  }

  async vincular(estilo, idServico) {
    const query = 'INSERT INTO estiloservicosugerido (Estilo, IdServico) VALUES (?, ?)';
    const [result] = await db.execute(query, [estilo, idServico]);
    return result.insertId;
  }

  async desvincular(estilo, idServico) {
    const query = 'DELETE FROM estiloservicosugerido WHERE Estilo = ? AND IdServico = ?';
    const [result] = await db.execute(query, [estilo, idServico]);
    return result.affectedRows;
  }
}

export default new EstiloServicoSugeridoRepository();