import db from '../config/db.js';

// Cada código pertence a um usuário OU a uma oficina (garantido por CHECK no banco) e tem uma
// finalidade: RECUPERACAO_SENHA, VERIFICACAO_EMAIL ou TROCA_EMAIL. Toda busca filtra pela
// finalidade, assim um código gerado para uma coisa nunca serve para outra.
const COLUNA_POR_TIPO = {
  usuario: 'IdUsuario',
  oficina: 'IdOficina',
};

class TokenRecuperacaoRepository {
  // Datas calculadas no próprio MySQL (NOW()) para não depender do fuso do Node.

  async invalidarAnteriores(tipo, idDono, finalidade) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `
      UPDATE token_recuperacao_senha SET Usado = 1
      WHERE ${coluna} = ? AND Finalidade = ? AND Usado = 0
    `;
    await db.execute(query, [idDono, finalidade]);
  }

  async create({ tipo, idDono, finalidade, tokenHash, validadeMinutos, novoEmail = null }) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `
      INSERT INTO token_recuperacao_senha (${coluna}, Finalidade, Token, NovoEmail, DataExpiracao)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
    `;
    const [result] = await db.execute(query, [idDono, finalidade, tokenHash, novoEmail, validadeMinutos]);
    return result.insertId;
  }

  // Último código ainda não usado e não expirado
  async findAtivo(tipo, idDono, finalidade) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `
      SELECT * FROM token_recuperacao_senha
      WHERE ${coluna} = ? AND Finalidade = ? AND Usado = 0 AND DataExpiracao > NOW()
      ORDER BY IdToken DESC LIMIT 1
    `;
    const [rows] = await db.execute(query, [idDono, finalidade]);
    return rows[0];
  }

  // Evita spam de e-mails: já existe pedido desta finalidade nos últimos 60 segundos?
  async criadoRecentemente(tipo, idDono, finalidade) {
    const coluna = COLUNA_POR_TIPO[tipo];
    const query = `
      SELECT IdToken FROM token_recuperacao_senha
      WHERE ${coluna} = ? AND Finalidade = ? AND DataCriacao > DATE_SUB(NOW(), INTERVAL 60 SECOND)
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idDono, finalidade]);
    return rows.length > 0;
  }

  async incrementarTentativas(idToken) {
    await db.execute('UPDATE token_recuperacao_senha SET Tentativas = Tentativas + 1 WHERE IdToken = ?', [idToken]);
  }

  // Devolve true só se este chamador foi quem consumiu o código (uso único, sem corrida)
  async marcarUsado(idToken) {
    const [result] = await db.execute(
      'UPDATE token_recuperacao_senha SET Usado = 1 WHERE IdToken = ? AND Usado = 0',
      [idToken]
    );
    return result.affectedRows === 1;
  }
}

export default new TokenRecuperacaoRepository();