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

  async atualizarProdutoExterno(idPlano, idProdutoExterno) {
  const query = 'UPDATE plano SET IdProdutoExterno = ? WHERE IdPlano = ?';
  const [result] = await db.execute(query, [idProdutoExterno, idPlano]);
  return result.affectedRows;
}

async findByIdAdmin(idPlano) {
  const query = 'SELECT * FROM plano WHERE IdPlano = ?';
  const [rows] = await db.execute(query, [idPlano]);
  return rows[0];
}

async update(idPlano, nome, duracaoDias) {
  const query = 'UPDATE plano SET Nome = ?, DuracaoDias = ? WHERE IdPlano = ?';
  const [result] = await db.execute(query, [nome, duracaoDias, idPlano]);
  return result.affectedRows;
}

async atualizarStatus(idPlano, ativo) {
  const query = 'UPDATE plano SET Ativo = ? WHERE IdPlano = ?';
  const [result] = await db.execute(query, [ativo ? 1 : 0, idPlano]);
  return result.affectedRows;
}

async findAllAdmin() {
  const query = 'SELECT * FROM plano ORDER BY Ativo DESC, Nome ASC';
  const [rows] = await db.execute(query);
  return rows;
}
}

export default new PlanoRepository();