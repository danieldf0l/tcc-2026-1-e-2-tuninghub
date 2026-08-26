import db from '../config/db.js';

class ServicoRepository {
  async findAll() {
    const query = 'SELECT IdServico, Nome, Descricao, Categoria FROM servico WHERE Ativo = 1';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findAllAdmin() {
    const query = 'SELECT * FROM servico ORDER BY Ativo DESC, Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByNome(nome) {
    const query = 'SELECT * FROM servico WHERE LOWER(Nome) = LOWER(?)';
    const [rows] = await db.execute(query, [nome]);
    return rows[0];
  }

  // Usado nos vínculos (oficinaServico, estiloServicoSugerido, projetoServico) --
  // só encontra serviço ativo, para impedir novos vínculos com item desativado.
  async findById(idServico) {
    const query = 'SELECT * FROM servico WHERE IdServico = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idServico]);
    return rows[0];
  }

  // Usado pelo admin (editar/desativar/reativar) -- não filtra por Ativo,
  // senão seria impossível reativar um serviço já desativado.
  async findByIdAdmin(idServico) {
    const query = 'SELECT * FROM servico WHERE IdServico = ?';
    const [rows] = await db.execute(query, [idServico]);
    return rows[0];
  }

  async create(nome, descricao, categoria) {
    const query = 'INSERT INTO servico (Nome, Descricao, Categoria) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [nome, descricao || null, categoria]);
    return result.insertId;
  }

  async update(idServico, nome, descricao, categoria) {
    const query = 'UPDATE servico SET Nome = ?, Descricao = ?, Categoria = ? WHERE IdServico = ?';
    const [result] = await db.execute(query, [nome, descricao || null, categoria, idServico]);
    return result.affectedRows;
  }

  async atualizarStatus(idServico, ativo) {
    const query = 'UPDATE servico SET Ativo = ? WHERE IdServico = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idServico]);
    return result.affectedRows;
  }
}

export default new ServicoRepository();