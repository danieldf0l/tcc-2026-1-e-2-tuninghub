import db from '../config/db.js';

class EnderecoRepository {
  async findByOficina(idOficina) {
    const query = 'SELECT * FROM endereco WHERE IdOficina = ?';
    const [rows] = await db.execute(query, [idOficina]);
    return rows[0];
  }

  async create(dados) {
    const { idOficina, rua, numero, bairro, cidade, estado, cep, latitude, longitude } = dados;
    const query = `
      INSERT INTO endereco 
      (IdOficina, Rua, Numero, Bairro, Cidade, Estado, CEP, Latitude, Longitude) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      idOficina, rua, numero || null, bairro || null, cidade, estado, cep,
      latitude || null, longitude || null,
    ]);
    return result.insertId;
  }

  async update(idOficina, dados) {
    const { rua, numero, bairro, cidade, estado, cep, latitude, longitude } = dados;
    const query = `
      UPDATE endereco 
      SET Rua = ?, Numero = ?, Bairro = ?, Cidade = ?, Estado = ?, CEP = ?, Latitude = ?, Longitude = ?
      WHERE IdOficina = ?
    `;
    const [result] = await db.execute(query, [
      rua, numero || null, bairro || null, cidade, estado, cep,
      latitude || null, longitude || null, idOficina,
    ]);
    return result.affectedRows;
  }
}

export default new EnderecoRepository();