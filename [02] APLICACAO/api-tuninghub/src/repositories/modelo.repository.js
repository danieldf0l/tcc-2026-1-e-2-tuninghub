import db from '../config/db.js';

class ModeloRepository {
  async findAll() {
    const query = `
      SELECT m.IdModelo, m.IdMontadora, m.Nome as Modelo, mo.Nome as Montadora
      FROM modelo m
      INNER JOIN montadora mo ON m.IdMontadora = mo.IdMontadora
      WHERE m.Ativo = 1
      ORDER BY mo.Nome ASC, m.Nome ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findAllAdmin() {
    const query = `
      SELECT m.IdModelo, m.IdMontadora, m.Nome as Modelo, m.Ativo, mo.Nome as Montadora
      FROM modelo m
      INNER JOIN montadora mo ON m.IdMontadora = mo.IdMontadora
      ORDER BY m.Ativo DESC, mo.Nome ASC, m.Nome ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByMontadora(idMontadora) {
    const query = 'SELECT * FROM modelo WHERE IdMontadora = ? AND Ativo = 1 ORDER BY Nome ASC';
    const [rows] = await db.execute(query, [idMontadora]);
    return rows;
  }

  async findById(idModelo) {
    const query = 'SELECT * FROM modelo WHERE IdModelo = ?';
    const [rows] = await db.execute(query, [idModelo]);
    return rows[0];
  }

  async findByIdAtivo(idModelo) {
    const query = 'SELECT * FROM modelo WHERE IdModelo = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idModelo]);
    return rows[0];
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

  async update(idModelo, nome) {
    const query = 'UPDATE modelo SET Nome = ? WHERE IdModelo = ?';
    const [result] = await db.execute(query, [nome, idModelo]);
    return result.affectedRows;
  }

  async atualizarStatus(idModelo, ativo) {
    const query = 'UPDATE modelo SET Ativo = ? WHERE IdModelo = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idModelo]);
    return result.affectedRows;
  }

  async desativarTodosDaMontadora(idMontadora) {
    const query = 'UPDATE modelo SET Ativo = 0 WHERE IdMontadora = ?';
    await db.execute(query, [idMontadora]);
  }
}

export default new ModeloRepository();