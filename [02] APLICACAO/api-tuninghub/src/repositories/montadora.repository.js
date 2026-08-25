import db from '../config/db.js';

class MontadoraRepository {
  async findAll() {
    const query = 'SELECT * FROM montadora WHERE Ativo = 1 ORDER BY Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findAllAdmin() {
    const query = 'SELECT * FROM montadora ORDER BY Ativo DESC, Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findById(idMontadora) {
    const query = 'SELECT * FROM montadora WHERE IdMontadora = ?';
    const [rows] = await db.execute(query, [idMontadora]);
    return rows[0];
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

  async update(idMontadora, nome) {
    const query = 'UPDATE montadora SET Nome = ? WHERE IdMontadora = ?';
    const [result] = await db.execute(query, [nome, idMontadora]);
    return result.affectedRows;
  }

  async atualizarStatus(idMontadora, ativo) {
    const query = 'UPDATE montadora SET Ativo = ? WHERE IdMontadora = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idMontadora]);
    return result.affectedRows;
  }
}

export default new MontadoraRepository();