import db from '../config/db.js';

class CategoriaServicoRepository {
  async findAll() {
    const query = 'SELECT * FROM categoriaservico WHERE Ativo = 1 ORDER BY Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findAllAdmin() {
    const query = 'SELECT * FROM categoriaservico ORDER BY Ativo DESC, Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findById(idCategoria) {
    const query = 'SELECT * FROM categoriaservico WHERE IdCategoria = ?';
    const [rows] = await db.execute(query, [idCategoria]);
    return rows[0];
  }

  async findByIdAtiva(idCategoria) {
    const query = 'SELECT * FROM categoriaservico WHERE IdCategoria = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idCategoria]);
    return rows[0];
  }

  async findByNome(nome) {
    const query = 'SELECT * FROM categoriaservico WHERE LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [nome]);
    return rows[0];
  }

  async create(nome) {
    const query = 'INSERT INTO categoriaservico (Nome) VALUES (?)';
    const [result] = await db.execute(query, [nome]);
    return result.insertId;
  }

  async update(idCategoria, nome) {
    const query = 'UPDATE categoriaservico SET Nome = ? WHERE IdCategoria = ?';
    const [result] = await db.execute(query, [nome, idCategoria]);
    return result.affectedRows;
  }

  async atualizarStatus(idCategoria, ativo) {
    const query = 'UPDATE categoriaservico SET Ativo = ? WHERE IdCategoria = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idCategoria]);
    return result.affectedRows;
  }
}

export default new CategoriaServicoRepository();