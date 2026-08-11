import db from '../config/db.js';

class ProjetoRepository {
  async findAll() {
    const query = 'SELECT * FROM projeto WHERE Ativo = 1';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByUsuario(idUsuario) {
    const query = 'SELECT * FROM projeto WHERE IdUsuario = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idUsuario]);
    return rows;
  }

  async countAtivosPorUsuario(idUsuario) {
    const query = 'SELECT COUNT(*) AS total FROM projeto WHERE IdUsuario = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idUsuario]);
    return rows[0].total;
  }

  async create({ idUsuario, idModelo, descricao, tipoCustomizacao, estilo }) {
    const query = `
      INSERT INTO projeto (IdUsuario, IdModelo, Descricao, TipoCustomizacao, Estilo) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [idUsuario, idModelo, descricao || null, tipoCustomizacao, estilo || null]);
    return result.insertId;
  }
}

export default new ProjetoRepository();