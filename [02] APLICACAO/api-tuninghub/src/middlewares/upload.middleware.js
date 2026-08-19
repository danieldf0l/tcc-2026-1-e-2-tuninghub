import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { ValidationError } from '../errors/AppError.js';

const UPLOAD_DIR = path.resolve('uploads/imagens');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extensao}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
    return cb(new ValidationError('Formato de imagem inválido. Envie apenas JPEG ou PNG.'));
  }
  cb(null, true);
};

const uploadImagem = multer({ storage, fileFilter, limits: { fileSize: TAMANHO_MAXIMO_BYTES } }).single('imagem');

// Traduz erros do multer (ex: arquivo grande demais) para o padrão de erro do projeto
export const uploadImagemMiddleware = (req, res, next) => {
  uploadImagem(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ValidationError('Imagem muito grande. Tamanho máximo permitido: 5MB.'));
      }
      return next(new ValidationError(err.message));
    }
    if (err) return next(err);
    next();
  });
};