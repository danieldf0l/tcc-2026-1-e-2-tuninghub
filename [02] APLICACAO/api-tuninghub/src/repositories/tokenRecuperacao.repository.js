import db from '../config/db.js';

// Cada token pertence a um usuário OU a uma oficina (garantido por CHECK no banco).
const COLUNA_POR_TIPO = {
  usuario: 'IdUsuario',
  oficina: 'IdOficina',
};

class TokenRecuperacaoRepository {
  // Datas calculadas no próprio MySQL (NOW()) para não depender do fuso do Node.

  async invalidarAnteriores(tipo, idDono) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `UPDATE token_recuperacao_senha SET Usado = 1 WHERE ${coluna} = ? AND Usado = 0`;
    await db.execute(query, [idDono]);
  }

  async create({ tipo, idDono, tokenHash, validadeMinutos }) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `
      INSERT INTO token_recuperacao_senha (${coluna}, Token, DataExpiracao)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
    `;
    const [result] = await db.execute(query, [idDono, tokenHash, validadeMinutos]);
    return result.insertId;
  }

  // Último token ainda não usado e não expirado
  async findAtivo(tipo, idDono) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `
      SELECT * FROM token_recuperacao_senha
      WHERE ${coluna} = ? AND Usado = 0 AND DataExpiracao > NOW()
      ORDER BY IdToken DESC LIMIT 1
    `;
    const [rows] = await db.execute(query, [idDono]);
    return rows[0];
  }

  // Evita spam de e-mails: já existe pedido nos últimos 60 segundos?
  async criadoRecentemente(tipo, idDono) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `
      SELECT IdToken FROM token_recuperacao_senha
      WHERE ${coluna} = ? AND DataCriacao > DATE_SUB(NOW(), INTERVAL 60 SECOND)
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idDono]);
    return rows.length > 0;
  }

  async incrementarTentativas(idToken) {
    await db.execute('UPDATE token_recuperacao_senha SET Tentativas = Tentativas + 1 WHERE IdToken = ?', [idToken]);
  }

  // Devolve true só se este chamador foi quem consumiu o token (uso único, sem corrida)
  async marcarUsado(idToken) {
    const [result] = await db.execute(
      'UPDATE token_recuperacao_senha SET Usado = 1 WHERE IdToken = ? AND Usado = 0',
      [idToken]
    );
    return result.affectedRows === 1;
  }
}

export default new TokenRecuperacaoRepository();