import db from '../config/db.js';

class ProjetoRepository {
  async findAll() {
    const query = 'SELECT * FROM projeto WHERE Ativo = 1';
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByUsuario(idUsuario) {
    const query = 'SELECT * FROM projeto WHERE IdUsuario = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idUsuario]);
    return rows;
  }

  async findInativosByUsuario(idUsuario) {
    const query = 'SELECT * FROM projeto WHERE IdUsuario = ? AND Ativo = 0';
    const [rows] = await db.execute(query, [idUsuario]);
    return rows;
  }

  async countAtivosPorUsuario(idUsuario) {
    const query = 'SELECT COUNT(*) AS total FROM projeto WHERE IdUsuario = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idUsuario]);
    return rows[0].total;
  }

  async create({ idUsuario, idModelo, descricao, tipoCustomizacao, estilo }) {
    const query = `
      INSERT INTO projeto (IdUsuario, IdModelo, Descricao, TipoCustomizacao, Estilo)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [idUsuario, idModelo, descricao || null, tipoCustomizacao, estilo || null]);
    return result.insertId;
  }

  // Só projetos ativos (usado por projetoServico e pela edição)
  async findById(idProjeto) {
    const query = 'SELECT * FROM projeto WHERE IdProjeto = ? AND Ativo = 1';
    const [rows] = await db.execute(query, [idProjeto]);
    return rows[0];
  }

  // Ativos e inativos (usado em desativar/reativar)
  async findByIdQualquerStatus(idProjeto) {
    const query = 'SELECT * FROM projeto WHERE IdProjeto = ?';
    const [rows] = await db.execute(query, [idProjeto]);
    return rows[0];
  }

  async atualizarDescricao(idProjeto, descricao) {
    const query = 'UPDATE projeto SET Descricao = ? WHERE IdProjeto = ?';
    const [result] = await db.execute(query, [descricao, idProjeto]);
    return result.affectedRows;
  }

  async atualizarStatus(idProjeto, ativo) {
    const query = 'UPDATE projeto SET Ativo = ? WHERE IdProjeto = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idProjeto]);
    return result.affectedRows;
  }

    // Exclusão física: remove a To-do List do projeto e o projeto, numa única transação.
  async excluirDefinitivamente(idProjeto) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute('DELETE FROM projetoservico WHERE IdProjeto = ?', [idProjeto]);
      const [result] = await connection.execute('DELETE FROM projeto WHERE IdProjeto = ?', [idProjeto]);

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new ProjetoRepository();