import db from '../config/db.js';

class MontadoraRepository {
  async findAll() {
    const query = 'SELECT * FROM montadora ORDER BY Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByNome(nome) {
    const query = 'SELECT * FROM montadora WHERE LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [nome]);
    return rows[0];
  }

  async create(nome) {
    const query = 'INSERT INTO montadora (Nome) VALUES (?)';
    const [result] = await db.execute(query, [nome]);
    return result.insertId;
  }

  async findById(idMontadora) {
  const query = 'SELECT * FROM montadora WHERE IdMontadora = ?';
  const [rows] = await db.execute(query, [idMontadora]);
  return rows[0];
}
}

export default new MontadoraRepository();