import db from "../config/db.js";

class OficinaRepository {
  async findAll() {
    const query = `
      SELECT IdOficina, NomeOficina, CNPJ, NomeProprietario, Telefone, Email, Ativo, DataCriacao 
      FROM oficina 
      WHERE Ativo = 1
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async findByEmail(email) {
    const query = "SELECT * FROM oficina WHERE Email = ? AND Ativo = 1";
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  async findByCnpj(cnpj) {
    const query = "SELECT * FROM oficina WHERE CNPJ = ?";
    const [rows] = await db.execute(query, [cnpj]);
    return rows[0];
  }

  async create(dados) {
    const { nomeOficina, cnpj, nomeProprietario, telefone, email, senhaHasheada, cnae, dataAceiteTermos } = dados;

    const query = `
      INSERT INTO oficina (NomeOficina, CNPJ, NomeProprietario, Telefone, Email, Senha, CNAE, TermosAceitos, DataAceiteTermos) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `;

    const [result] = await db.execute(query, [
      nomeOficina, cnpj, nomeProprietario || null, telefone || null, email, senhaHasheada, cnae || null, dataAceiteTermos,
    ]);

    return result.insertId;
  }

  async aceitarTermos(idOficina) {
    const query = 'UPDATE oficina SET TermosAceitos = 1, DataAceiteTermos = ? WHERE IdOficina = ?';
    const [result] = await db.execute(query, [new Date(), idOficina]);
    return result.affectedRows;
  }

  async existsByEmail(email) {
    const query = "SELECT IdOficina FROM oficina WHERE Email = ?";
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0;
  }

  async findById(idOficina) {
  const query = 'SELECT * FROM oficina WHERE IdOficina = ? AND Ativo = 1';
  const [rows] = await db.execute(query, [idOficina]);
  return rows[0];
}

async buscarComEndereco(idServico) {
  let query = `
    SELECT o.IdOficina, o.NomeOficina, o.Telefone, o.Email, o.FaixaPreco,
           e.Latitude, e.Longitude, e.Cidade, e.Bairro
    FROM oficina o
    INNER JOIN endereco e ON e.IdOficina = o.IdOficina
  `;
  const params = [];

  if (idServico) {
    query += ' INNER JOIN oficinaservico os ON os.IdOficina = o.IdOficina AND os.IdServico = ? ';
    params.push(idServico);
  }

  query += ' WHERE o.Ativo = 1 AND e.Latitude IS NOT NULL AND e.Longitude IS NOT NULL';

  const [rows] = await db.execute(query, params);
  return rows;
}
}

export default new OficinaRepository();
