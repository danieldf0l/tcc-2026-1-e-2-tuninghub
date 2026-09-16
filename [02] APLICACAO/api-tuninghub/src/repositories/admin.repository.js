import db from '../config/db.js';

class AdminRepository {
  async findAll() {
    const query = `
      SELECT IdAdmin, Nome, Email, NivelAcesso, Ativo, DataCriacao 
      FROM admin 
      WHERE Ativo = 1
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM admin WHERE Email = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  async existsByEmail(email) {
    const query = 'SELECT IdAdmin FROM admin WHERE Email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0;
  }

  async create(nome, email, senhaHasheada, nivelAcesso) {
    const query = `
      INSERT INTO admin (Nome, Email, Senha, NivelAcesso) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [nome, email, senhaHasheada, nivelAcesso || 'PADRAO']);
    return result.insertId;
  }

  async findByIdAdmin(idAdmin) {
    const query = 'SELECT * FROM admin WHERE IdAdmin = ?';
    const [rows] = await db.execute(query, [idAdmin]);
    return rows[0];
  }
}

export default new AdminRepository();