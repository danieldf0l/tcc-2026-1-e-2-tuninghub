import db from '../config/db.js';

class AssinaturaRepository {
  async findAll() {
    const query = `
      SELECT a.*, o.NomeOficina, p.Nome AS NomePlano
      FROM assinatura a
      INNER JOIN oficina o ON a.IdOficina = o.IdOficina
      INNER JOIN plano p ON a.IdPlano = p.IdPlano
      ORDER BY a.DataCriacao DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findById(idAssinatura) {
    const query = 'SELECT * FROM assinatura WHERE IdAssinatura = ?';
    const [rows] = await db.execute(query, [idAssinatura]);
    return rows[0];
  }

  async findAtivaOuPendentePorOficina(idOficina) {
    const query = "SELECT * FROM assinatura WHERE IdOficina = ? AND Status IN ('ATIVA', 'PENDENTE')";
    const [rows] = await db.execute(query, [idOficina]);
    return rows;
  }

  // Bloqueia novo checkout: PENDENTE, ou ATIVA de plano pago ainda dentro da validade.
  async findBloqueiaCheckoutPorOficina(idOficina) {
    const query = `
      SELECT a.*
      FROM assinatura a
      INNER JOIN plano p ON a.IdPlano = p.IdPlano
      WHERE a.IdOficina = ?
        AND (
          a.Status = 'PENDENTE'
          OR (a.Status = 'ATIVA' AND p.Valor > 0 AND (a.DataFim IS NULL OR a.DataFim >= CURDATE()))
        )
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows;
  }

  async findAtivaOuPendentePorOficinaDetalhada(idOficina) {
    const query = `
      SELECT a.*, p.Nome AS NomePlano, p.Valor AS ValorPlano, p.DuracaoDias
      FROM assinatura a
      INNER JOIN plano p ON a.IdPlano = p.IdPlano
      WHERE a.IdOficina = ? AND a.Status IN ('ATIVA', 'PENDENTE')
      ORDER BY FIELD(a.Status, 'PENDENTE', 'ATIVA'), a.DataCriacao DESC
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows;
  }

  // Usado em imagem.service (RN18/19): plano pago ativo E dentro da validade.
  async findAtivaPaga(idOficina) {
    const query = `
      SELECT a.*, p.Valor
      FROM assinatura a
      INNER JOIN plano p ON a.IdPlano = p.IdPlano
      WHERE a.IdOficina = ? AND a.Status = 'ATIVA' AND p.Valor > 0
        AND (a.DataFim IS NULL OR a.DataFim >= CURDATE())
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows[0];
  }

  // Marca como EXPIRADA as assinaturas ATIVAS vencidas da oficina.
  async expirarVencidas(idOficina) {
    const query = `
      UPDATE assinatura SET Status = 'EXPIRADA'
      WHERE IdOficina = ? AND Status = 'ATIVA' AND DataFim IS NOT NULL AND DataFim < CURDATE()
    `;
    await db.execute(query, [idOficina]);
  }

  async atualizarStatus(idAssinatura, status) {
    await db.execute('UPDATE assinatura SET Status = ? WHERE IdAssinatura = ?', [status, idAssinatura]);
  }

  async create({ idOficina, idPlano, dataInicio, dataFim, status, idCobrancaExterna }) {
    const query = `
      INSERT INTO assinatura (IdOficina, IdPlano, DataInicio, DataFim, Status, IdCobrancaExterna)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      idOficina, idPlano, dataInicio, dataFim || null, status, idCobrancaExterna || null,
    ]);
    return result.insertId;
  }

  async ativarCancelandoAnteriores(idAssinatura, idOficina, dataFim) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE assinatura SET Status = 'CANCELADA' WHERE IdOficina = ? AND Status = 'ATIVA' AND IdAssinatura <> ?",
        [idOficina, idAssinatura]
      );
      await connection.execute(
        "UPDATE assinatura SET Status = 'ATIVA', DataFim = ? WHERE IdAssinatura = ?",
        [dataFim, idAssinatura]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new AssinaturaRepository();