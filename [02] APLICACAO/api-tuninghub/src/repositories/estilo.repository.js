import db from '../config/db.js';

class EstiloRepository {
  async findAll() {
    const query = 'SELECT * FROM estilo WHERE Ativo = 1 ORDER BY Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findAllAdmin() {
    const query = 'SELECT * FROM estilo ORDER BY Ativo DESC, Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findById(idEstilo) {
    const query = 'SELECT * FROM estilo WHERE IdEstilo = ?';
    const [rows] = await db.execute(query, [idEstilo]);
    return rows[0];
  }

  async findByCodigo(codigo) {
    const query = 'SELECT * FROM estilo WHERE Codigo = ?';
    const [rows] = await db.execute(query, [codigo]);
    return rows[0];
  }

  async findByCodigoAtivo(codigo) {
    const query = 'SELECT * FROM estilo WHERE Codigo = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [codigo]);
    return rows[0];
  }

  async findByNome(nome) {
    const query = 'SELECT * FROM estilo WHERE LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [nome]);
    return rows[0];
  }

  async create(codigo, nome) {
    const query = 'INSERT INTO estilo (Codigo, Nome) VALUES (?, ?)';
    const [result] = await db.execute(query, [codigo, nome]);
    return result.insertId;
  }

  async update(idEstilo, nome) {
    const query = 'UPDATE estilo SET Nome = ? WHERE IdEstilo = ?';
    const [result] = await db.execute(query, [nome, idEstilo]);
    return result.affectedRows;
  }

  async atualizarStatus(idEstilo, ativo) {
    const query = 'UPDATE estilo SET Ativo = ? WHERE IdEstilo = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idEstilo]);
    return result.affectedRows;
  }
}

export default new EstiloRepository();