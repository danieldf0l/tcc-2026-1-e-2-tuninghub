import db from '../config/db.js';

class ServicoRepository {
  async findAll() {
    const query = `
      SELECT s.IdServico, s.Nome, s.Descricao, s.IdCategoria, c.Nome AS Categoria
      FROM servico s
      INNER JOIN categoriaservico c ON c.IdCategoria = s.IdCategoria
      WHERE s.Ativo = 1
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findAllAdmin() {
    const query = `
      SELECT s.*, c.Nome AS Categoria
      FROM servico s
      INNER JOIN categoriaservico c ON c.IdCategoria = s.IdCategoria
      ORDER BY s.Ativo DESC, s.Nome ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByNome(nome) {
    const query = 'SELECT * FROM servico WHERE LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [nome]);
    return rows[0];
  }

  async findById(idServico) {
    const query = 'SELECT * FROM servico WHERE IdServico = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idServico]);
    return rows[0];
  }

  async findByIdAdmin(idServico) {
    const query = 'SELECT * FROM servico WHERE IdServico = ?';
    const [rows] = await db.execute(query, [idServico]);
    return rows[0];
  }

  async create(nome, descricao, idCategoria) {
    const query = 'INSERT INTO servico (Nome, Descricao, IdCategoria) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [nome, descricao || null, idCategoria]);
    return result.insertId;
  }

  async update(idServico, nome, descricao, idCategoria) {
    const query = 'UPDATE servico SET Nome = ?, Descricao = ?, IdCategoria = ? WHERE IdServico = ?';
    const [result] = await db.execute(query, [nome, descricao || null, idCategoria, idServico]);
    return result.affectedRows;
  }

  async atualizarStatus(idServico, ativo) {
    const query = 'UPDATE servico SET Ativo = ? WHERE IdServico = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idServico]);
    return result.affectedRows;
  }
}

export default new ServicoRepository();