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

  async existsByEmailExcetoId(email, idUsuario) {
    const query = 'SELECT IdUsuario FROM usuario WHERE Email = ? AND IdUsuario <> ?';
    const [rows] = await db.execute(query, [email, idUsuario]);
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

  async findByEmailQualquerStatus(email) {
    const query = 'SELECT * FROM usuario WHERE Email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  async findAllAdmin() {
    const query = 'SELECT IdUsuario, Nome, Email, Ativo, DataCriacao FROM usuario ORDER BY Ativo DESC, Nome ASC';
    const [rows] = await db.execute(query);
    return rows;
  }

  // SenhaAlteradaEmTs = momento da última troca de senha em segundos (epoch), usado pelo
  // verificarToken para derrubar sessões antigas. Calculado no SQL para não depender de fuso horário.
  async findByIdAdmin(idUsuario) {
    const query = 'SELECT *, UNIX_TIMESTAMP(SenhaAlteradaEm) AS SenhaAlteradaEmTs FROM usuario WHERE IdUsuario = ?';
    const [rows] = await db.execute(query, [idUsuario]);
    return rows[0];
  }

  // Perfil público do próprio usuário (nunca devolve a senha)
  async findPerfil(idUsuario) {
    const query = `
      SELECT IdUsuario, Nome, Email, DataCriacao, TermosAceitos, DataAceiteTermos
      FROM usuario WHERE IdUsuario = ?
    `;
    const [rows] = await db.execute(query, [idUsuario]);
    return rows[0];
  }

  async atualizarPerfil(idUsuario, nome, email) {
    const query = 'UPDATE usuario SET Nome = ?, Email = ? WHERE IdUsuario = ?';
    const [result] = await db.execute(query, [nome, email, idUsuario]);
    return result.affectedRows;
  }

  async atualizarSenha(idUsuario, senhaHasheada) {
    // Marca a troca com o relógio do Node (mesmo relógio que assina o "iat" do JWT),
    // assim não há diferença de relógio entre o servidor da API e o servidor do banco.
    const query = 'UPDATE usuario SET Senha = ?, SenhaAlteradaEm = FROM_UNIXTIME(?) WHERE IdUsuario = ?';
    const agoraEmSegundos = Math.floor(Date.now() / 1000);
    const [result] = await db.execute(query, [senhaHasheada, agoraEmSegundos, idUsuario]);
    return result.affectedRows;
  }

  // Exclusão física (LGPD): remove a conta e tudo que depende dela, numa única transação.
  async excluirDefinitivamente(idUsuario) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        `DELETE ps FROM projetoservico ps
         INNER JOIN projeto p ON p.IdProjeto = ps.IdProjeto
         WHERE p.IdUsuario = ?`,
        [idUsuario]
      );
      await connection.execute('DELETE FROM projeto WHERE IdUsuario = ?', [idUsuario]);
      await connection.execute('DELETE FROM token_recuperacao_senha WHERE IdUsuario = ?', [idUsuario]);
      const [result] = await connection.execute('DELETE FROM usuario WHERE IdUsuario = ?', [idUsuario]);

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async atualizarStatus(idUsuario, ativo) {
    const query = 'UPDATE usuario SET Ativo = ? WHERE IdUsuario = ?';
    const [result] = await db.execute(query, [ativo ? 1 : 0, idUsuario]);
    return result.affectedRows;
  }
}

export default new UsuarioRepository();