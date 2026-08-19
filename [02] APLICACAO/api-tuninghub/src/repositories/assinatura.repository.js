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

  async ativar(idAssinatura, dataFim) {
    const query = "UPDATE assinatura SET Status = 'ATIVA', DataFim = ? WHERE IdAssinatura = ?";
    const [result] = await db.execute(query, [dataFim, idAssinatura]);
    return result.affectedRows;
  }

  async findAtivaPaga(idOficina) {
  const query = `
    SELECT a.*, p.Valor
    FROM assinatura a
    INNER JOIN plano p ON a.IdPlano = p.IdPlano
    WHERE a.IdOficina = ? AND a.Status = 'ATIVA' AND p.Valor > 0
  `;
  const [rows] = await db.execute(query, [idOficina]);
  return rows[0];
}
}

export default new AssinaturaRepository();