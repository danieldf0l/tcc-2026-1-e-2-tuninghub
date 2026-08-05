import db from '../config/db.js';

class UsuarioRepository {
  async findAll() {
    const [rows] = await db.execute('SELECT IdUsuario, Nome, Email, Ativo, DataCriacao FROM usuario');
    return rows;
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM usuario WHERE Email = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  async existsByEmail(email) {
    const query = 'SELECT IdUsuario FROM usuario WHERE Email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0;
  }

  async create(nome, email, senhaHasheada) {
    const query = 'INSERT INTO usuario (Nome, Email, Senha) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [nome, email, senhaHasheada]);
    return result.insertId;
  }
}

export default new UsuarioRepository();