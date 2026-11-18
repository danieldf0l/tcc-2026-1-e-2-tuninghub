import db from '../config/db.js';

// Regra única de "plano Pro": assinatura ATIVA, de plano pago (Valor > 0) e dentro da validade.
// Usada no gate de imagens (findAtivaPaga) e na liberação do contato público da oficina.
const CONDICAO_PLANO_PAGO = `
  a.Status = 'ATIVA' AND p.Valor > 0
  AND (a.DataFim IS NULL OR a.DataFim >= CURDATE())
`;

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
      WHERE a.IdOficina = ? AND ${CONDICAO_PLANO_PAGO}
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows[0];
  }

  // Versão em lote da mesma regra (uma única consulta, sem N+1).
  // Recebe os ids das oficinas e devolve um Set com os ids que têm plano Pro.
  async findIdsComPlanoPago(idsOficinas) {
    if (idsOficinas.length === 0) return new Set();

    const placeholders = idsOficinas.map(() => '?').join(', ');
    const query = `
      SELECT DISTINCT a.IdOficina
      FROM assinatura a
      INNER JOIN plano p ON a.IdPlano = p.IdPlano
      WHERE a.IdOficina IN (${placeholders}) AND ${CONDICAO_PLANO_PAGO}
    `;
    const [rows] = await db.execute(query, idsOficinas);
    return new Set(rows.map((linha) => linha.IdOficina));
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

  // ---------- Cancelamento e renovação antecipada ----------
  // Todas as contas de DIAS são feitas AQUI, no banco (mesmo CURDATE() da regra do plano Pro).

  async findProVigentesDetalhadas(idOficina, diasRenovacao) {
    const query = `
      SELECT a.*, p.Nome AS NomePlano, p.Valor AS ValorPlano, p.DuracaoDias,
             DATEDIFF(a.DataFim, CURDATE()) AS DiasParaVencer,
             DATEDIFF(CURDATE(), DATE(a.DataPagamento)) AS DiasDesdePagamento,
             DATE_FORMAT(a.DataInicio, '%d/%m') AS InicioBR,
             DATE_FORMAT(DATE_SUB(a.DataFim, INTERVAL ? DAY), '%Y-%m-%d') AS RenovacaoLiberadaEm,
             DATE_FORMAT(DATE_SUB(a.DataFim, INTERVAL ? DAY), '%d/%m') AS RenovacaoLiberadaEmBR
      FROM assinatura a
      INNER JOIN plano p ON p.IdPlano = a.IdPlano
      WHERE a.IdOficina = ? AND a.Status = 'ATIVA' AND p.Valor > 0
        AND (a.DataFim IS NULL OR a.DataFim >= CURDATE())
      ORDER BY a.DataFim ASC, a.IdAssinatura ASC
    `;
    const [rows] = await db.execute(query, [diasRenovacao, diasRenovacao, idOficina]);
    return rows;
  }

  async findPendentesDetalhadas(idOficina) {
    const query = `
      SELECT a.*, p.Nome AS NomePlano, p.Valor AS ValorPlano, p.DuracaoDias
      FROM assinatura a
      INNER JOIN plano p ON p.IdPlano = a.IdPlano
      WHERE a.IdOficina = ? AND a.Status = 'PENDENTE'
      ORDER BY a.IdAssinatura DESC
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows;
  }

  async findGratuitaVigenteDetalhada(idOficina) {
    const query = `
      SELECT a.*, p.Nome AS NomePlano, p.Valor AS ValorPlano, p.DuracaoDias
      FROM assinatura a
      INNER JOIN plano p ON p.IdPlano = a.IdPlano
      WHERE a.IdOficina = ? AND a.Status = 'ATIVA' AND p.Valor = 0
        AND (a.DataFim IS NULL OR a.DataFim >= CURDATE())
      ORDER BY a.IdAssinatura DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows[0];
  }

  async findUltimaExpiradaPagaDetalhada(idOficina) {
    const query = `
      SELECT a.*, p.Nome AS NomePlano, p.Valor AS ValorPlano, p.DuracaoDias
      FROM assinatura a
      INNER JOIN plano p ON p.IdPlano = a.IdPlano
      WHERE a.IdOficina = ? AND a.Status = 'EXPIRADA' AND p.Valor > 0
      ORDER BY a.DataFim DESC, a.IdAssinatura DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idOficina]);
    return rows[0];
  }

  async findPlanoGratuitoAtivo() {
    const [rows] = await db.execute('SELECT * FROM plano WHERE Valor = 0 AND Ativo = 1 ORDER BY IdPlano ASC LIMIT 1');
    return rows[0];
  }

  // Ativa uma assinatura com pagamento confirmado, numa transação.
  // - Com Pro vigente (renovação): o novo período COMEÇA no DataFim dele e soma a duração do plano.
  // - Sem Pro vigente: começa hoje e cancela outras ATIVA (ex.: o gratuito).
  // Aceita PENDENTE e CANCELADA que nunca foi paga (PIX pago depois do cancelamento).
  // Devolve { dataInicio, dataFim, renovacao } ou null se já tinha sido processada.
  async ativarPagamentoConfirmado({ idAssinatura, idOficina, duracaoDias }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE assinatura SET Status = 'EXPIRADA' WHERE IdOficina = ? AND Status = 'ATIVA' AND DataFim IS NOT NULL AND DataFim < CURDATE()",
        [idOficina]
      );

      const [[{ ultimoFim }]] = await connection.execute(
        `SELECT DATE_FORMAT(MAX(a.DataFim), '%Y-%m-%d') AS ultimoFim
         FROM assinatura a INNER JOIN plano p ON p.IdPlano = a.IdPlano
         WHERE a.IdOficina = ? AND a.Status = 'ATIVA' AND p.Valor > 0 AND a.IdAssinatura <> ? AND a.DataFim >= CURDATE()`,
        [idOficina, idAssinatura]
      );

      const [resultado] = await connection.execute(
        `UPDATE assinatura
         SET Status = 'ATIVA',
             DataInicio = COALESCE(CAST(? AS DATE), CURDATE()),
             DataFim = DATE_ADD(COALESCE(CAST(? AS DATE), CURDATE()), INTERVAL ? DAY),
             DataPagamento = NOW(), DataCancelamento = NULL, ValorReembolso = NULL
         WHERE IdAssinatura = ? AND IdOficina = ? AND DataPagamento IS NULL AND Status IN ('PENDENTE', 'CANCELADA')`,
        [ultimoFim, ultimoFim, duracaoDias, idAssinatura, idOficina]
      );
      if (resultado.affectedRows === 0) {
        await connection.rollback();
        return null;
      }

      if (!ultimoFim) {
        await connection.execute(
          "UPDATE assinatura SET Status = 'CANCELADA', DataCancelamento = NOW() WHERE IdOficina = ? AND Status = 'ATIVA' AND IdAssinatura <> ?",
          [idOficina, idAssinatura]
        );
      }

      const [[ativada]] = await connection.execute(
        "SELECT DATE_FORMAT(DataInicio, '%Y-%m-%d') AS dataInicio, DATE_FORMAT(DataFim, '%Y-%m-%d') AS dataFim FROM assinatura WHERE IdAssinatura = ?",
        [idAssinatura]
      );

      await connection.commit();
      return { ...ativada, renovacao: Boolean(ultimoFim) };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Cancela assinaturas e, se pedido, já coloca o plano gratuito, numa transação.
  // Devolve false se alguma assinatura mudou de status no meio do caminho (nada é alterado).
  async cancelarAssinaturas({ idOficina, cancelamentos, gratuito }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      for (const { idAssinatura, valorReembolso } of cancelamentos) {
        const [resultado] = await connection.execute(
          `UPDATE assinatura SET Status = 'CANCELADA', DataCancelamento = NOW(), ValorReembolso = ?
           WHERE IdAssinatura = ? AND IdOficina = ? AND Status IN ('ATIVA', 'PENDENTE')`,
          [valorReembolso, idAssinatura, idOficina]
        );
        if (resultado.affectedRows === 0) {
          await connection.rollback();
          return false;
        }
      }

      if (gratuito) {
        await connection.execute(
          `INSERT INTO assinatura (IdOficina, IdPlano, DataInicio, DataFim, Status)
           VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'ATIVA')`,
          [idOficina, gratuito.idPlano, gratuito.duracaoDias]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

}

export default new AssinaturaRepository();