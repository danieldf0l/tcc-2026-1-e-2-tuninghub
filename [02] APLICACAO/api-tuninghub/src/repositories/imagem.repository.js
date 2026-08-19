import db from '../config/db.js';

class ImagemRepository {
  async findAllByOficina(idOficina) {
    const query = "SELECT * FROM imagem WHERE IdOficina = ? AND Status = 'ATIVO'";
    const [rows] = await db.execute(query, [idOficina]);
    return rows;
  }

  async findById(idImagem) {
    const query = "SELECT * FROM imagem WHERE IdImagem = ? AND Status = 'ATIVO'";
    const [rows] = await db.execute(query, [idImagem]);
    return rows[0];
  }

  async findLogoAtivo(idOficina) {
    const query = "SELECT * FROM imagem WHERE IdOficina = ? AND TipoImagem = 'LOGO' AND Status = 'ATIVO'";
    const [rows] = await db.execute(query, [idOficina]);
    return rows[0];
  }

  async countByType(idOficina, tipo) {
    const query = "SELECT COUNT(*) as total FROM imagem WHERE IdOficina = ? AND TipoImagem = ? AND Status = 'ATIVO'";
    const [rows] = await db.execute(query, [idOficina, tipo]);
    return rows[0].total;
  }

  async create(idOficina, urlImagem, tipoImagem) {
    const query = 'INSERT INTO imagem (IdOficina, UrlImagem, TipoImagem) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [idOficina, urlImagem, tipoImagem]);
    return result.insertId;
  }

  async delete(idImagem) {
    const query = "UPDATE imagem SET Status = 'INATIVO' WHERE IdImagem = ?";
    const [result] = await db.execute(query, [idImagem]);
    return result.affectedRows;
  }
}

export default new ImagemRepository();