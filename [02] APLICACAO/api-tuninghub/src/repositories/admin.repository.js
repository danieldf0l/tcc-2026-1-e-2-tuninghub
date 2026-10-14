import db from '../config/db.js';

class AdminRepository {
  // Lista TODOS (ativos e inativos) para o painel poder reativar. Nunca devolve a senha.
  async findAll() {
    const query = `
      SELECT IdAdmin, Nome, Email, NivelAcesso, Ativo, DataCriacao
      FROM admin
      ORDER BY Ativo DESC, Nome ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM admin WHERE Email = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  // Usado no login: permite responder "Conta desativada" em vez de "credenciais inválidas"
  async findByEmailQualquerStatus(email) {
    const query = 'SELECT * FROM admin WHERE Email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  async existsByEmail(email) {
    const query = 'SELECT IdAdmin FROM admin WHERE Email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0;
  }

  async existsByEmailExcetoId(email, idAdmin) {
    const query = 'SELECT IdAdmin FROM admin WHERE Email = ? AND IdAdmin <> ?';
    const [rows] = await db.execute(query, [email, idAdmin]);
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

  async atualizar(idAdmin, { nome, email, nivelAcesso }) {
    const query = 'UPDATE admin SET Nome = ?, Email = ?, NivelAcesso = ? WHERE IdAdmin = ?';
    const [result] = await db.execute(query, [nome, email, nivelAcesso, idAdmin]);
    return result.affectedRows;
  }

  async atualizarStatus(idAdmin, ativo) {
    const query = 'UPDATE admin SET Ativo = ? WHERE IdAdmin = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idAdmin]);
    return result.affectedRows;
  }
}

export default new AdminRepository();