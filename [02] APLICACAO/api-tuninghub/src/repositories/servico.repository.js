import db from '../config/db.js';

class ServicoRepository {
  async findAll() {
    const query = 'SELECT IdServico, Nome, Descricao, Categoria FROM servico WHERE Ativo = 1';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByNome(nome) {
    const query = 'SELECT * FROM servico WHERE LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [nome]);
    return rows[0];
  }

  async create(nome, descricao, categoria) {
    const query = 'INSERT INTO servico (Nome, Descricao, Categoria) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [nome, descricao || null, categoria]);
    return result.insertId;
  }

  async findById(idServico) {
  const query = 'SELECT * FROM servico WHERE IdServico = ? AND Ativo = 1';
  const [rows] = await db.execute(query, [idServico]);
  return rows[0];
}
}

export default new ServicoRepository();