import db from '../config/db.js';

class PlanoRepository {
  async findAll() {
    const query = 'SELECT * FROM plano WHERE Ativo = 1';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findById(idPlano) {
    const query = 'SELECT * FROM plano WHERE IdPlano = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idPlano]);
    return rows[0];
  }

  async findByNome(nome) {
    const query = 'SELECT * FROM plano WHERE LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [nome]);
    return rows[0];
  }

  async create(nome, valor, duracaoDias) {
    const query = 'INSERT INTO plano (Nome, Valor, DuracaoDias) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [nome, valor ?? 0.0, duracaoDias]);
    return result.insertId;
  }
}

export default new PlanoRepository();