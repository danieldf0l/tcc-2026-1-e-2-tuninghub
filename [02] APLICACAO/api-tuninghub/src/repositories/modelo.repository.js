import db from '../config/db.js';

class ModeloRepository {
  async findAll() {
    const query = `
      SELECT m.IdModelo, m.IdMontadora, m.Nome as Modelo, mo.Nome as Montadora
      FROM modelo m
      INNER JOIN montadora mo ON m.IdMontadora = mo.IdMontadora
      ORDER BY mo.Nome ASC, m.Nome ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByMontadora(idMontadora) {
    const query = 'SELECT * FROM modelo WHERE IdMontadora = ? ORDER BY Nome ASC';
    const [rows] = await db.execute(query, [idMontadora]);
    return rows;
  }

  async checkDuplicidade(idMontadora, nome) {
    const query = 'SELECT * FROM modelo WHERE IdMontadora = ? AND LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [idMontadora, nome]);
    return rows[0];
  }

  async create(idMontadora, nome) {
    const query = 'INSERT INTO modelo (IdMontadora, Nome) VALUES (?, ?)';
    const [result] = await db.execute(query, [idMontadora, nome]);
    return result.insertId;
  }
  
  async findById(idModelo) {
  const query = 'SELECT * FROM modelo WHERE IdModelo = ?';
  const [rows] = await db.execute(query, [idModelo]);
  return rows[0];
}

}

export default new ModeloRepository();