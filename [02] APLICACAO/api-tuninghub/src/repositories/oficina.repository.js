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
  const { nomeOficina, cnpj, nomeProprietario, telefone, email, senhaHasheada, cnae } = dados;

  const query = `
    INSERT INTO oficina (NomeOficina, CNPJ, NomeProprietario, Telefone, Email, Senha, CNAE) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    nomeOficina, cnpj, nomeProprietario || null, telefone || null, email, senhaHasheada, cnae || null,
  ]);

  return result.insertId;
}

  async existsByEmail(email) {
    const query = "SELECT IdOficina FROM oficina WHERE Email = ?";
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0;
  }
}

export default new OficinaRepository();
