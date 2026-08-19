import ImagemService from '../services/imagem.service.js';
import { ValidationError } from '../errors/AppError.js';
import fs from 'fs';

class ImagemController {
  listar = async (req, res, next) => {
    try {
      const { idOficina } = req.params;
      const imagens = await ImagemService.listarImagensOficina(idOficina);
      res.status(200).json(imagens);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
  try {
    if (!req.file) throw new ValidationError('Nenhum arquivo de imagem foi enviado.');

    const imagem = await ImagemService.adicionarImagem({
      idOficinaInformado: req.body.idOficina,
      tipoImagem: req.body.tipoImagem,
      arquivo: req.file,
      usuarioLogado: req.usuarioLogado,
    });
    res.status(201).json({ message: 'Imagem enviada com sucesso!', imagem });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn(`[Imagem] Falha ao limpar arquivo órfão: ${req.file.path}`);
      });
    }
    next(error);
  }
};

  remover = async (req, res, next) => {
    try {
      const resultado = await ImagemService.removerImagem(req.params.id, req.usuarioLogado);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new ImagemController();