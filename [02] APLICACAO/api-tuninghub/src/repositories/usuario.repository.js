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

  async create(nome, email, senhaHasheada, dataAceiteTermos) {
    const query = `
      INSERT INTO usuario (Nome, Email, Senha, TermosAceitos, DataAceiteTermos) 
      VALUES (?, ?, ?, 1, ?)
    `;
    const [result] = await db.execute(query, [nome, email, senhaHasheada, dataAceiteTermos]);
    return result.insertId;
  }

  async aceitarTermos(idUsuario) {
    const query = 'UPDATE usuario SET TermosAceitos = 1, DataAceiteTermos = ? WHERE IdUsuario = ?';
    const [result] = await db.execute(query, [new Date(), idUsuario]);
    return result.affectedRows;
  }
}

export default new UsuarioRepository();