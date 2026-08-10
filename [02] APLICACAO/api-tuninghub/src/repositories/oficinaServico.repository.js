import db from '../config/db.js';

class OficinaServicoRepository {
  async findByOficina(idOficina) {
    const query = `
      SELECT os.IdOficinaServico, s.IdServico, s.Nome, s.Descricao, s.Categoria 
      FROM oficinaservico os
      INNER JOIN servico s ON os.IdServico = s.IdServico
      WHERE os.IdOficina = ?
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows;
  }

  async checkVinculo(idOficina, idServico) {
    const query = 'SELECT * FROM oficinaservico WHERE IdOficina = ? AND IdServico = ?';
    const [rows] = await db.execute(query, [idOficina, idServico]);
    return rows[0];
  }

  async vincular(idOficina, idServico) {
    const query = 'INSERT INTO oficinaservico (IdOficina, IdServico) VALUES (?, ?)';
    const [result] = await db.execute(query, [idOficina, idServico]);
    return result.insertId;
  }

  async desvincular(idOficina, idServico) {
    const query = 'DELETE FROM oficinaservico WHERE IdOficina = ? AND IdServico = ?';
    const [result] = await db.execute(query, [idOficina, idServico]);
    return result.affectedRows;
  }
}

export default new OficinaServicoRepository();