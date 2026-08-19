import fs from 'fs';
import path from 'path';
import ImagemRepository from '../repositories/imagem.repository.js';
import OficinaRepository from '../repositories/oficina.repository.js';
import AssinaturaRepository from '../repositories/assinatura.repository.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';

const TIPOS_VALIDOS = ['LOGO', 'GALERIA'];
const LIMITE_GALERIA = 6;

const resolverIdOficina = (idOficinaInformado, usuarioLogado) => {
  const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
  return ehAdmin ? idOficinaInformado : usuarioLogado.id;
};

const verificarPermissao = (idOficina, usuarioLogado) => {
  const ehAdmin = usuarioLogado.role === ROLES.ADMIN_MASTER || usuarioLogado.role === ROLES.ADMIN;
  const ehDono = String(usuarioLogado.id) === String(idOficina);
  if (!ehAdmin && !ehDono) {
    throw new ForbiddenError('Você não tem permissão para gerenciar as imagens desta oficina.');
  }
};

const removerArquivoFisico = (urlImagem) => {
  const caminhoAbsoluto = path.resolve(`.${urlImagem}`);
  fs.unlink(caminhoAbsoluto, (err) => {
    if (err) console.warn(`[Imagem] Não foi possível remover o arquivo físico: ${caminhoAbsoluto}`);
  });
};

class ImagemService {
  async listarImagensOficina(idOficina) {
    if (!idOficina) throw new ValidationError('O Id da oficina é obrigatório.');
    return await ImagemRepository.findAllByOficina(idOficina);
  }

  async adicionarImagem({ idOficinaInformado, tipoImagem, arquivo, usuarioLogado }) {
    const idOficina = resolverIdOficina(idOficinaInformado, usuarioLogado);

    if (!idOficina || !tipoImagem || !arquivo) {
      throw new ValidationError('idOficina, tipoImagem e o arquivo de imagem são obrigatórios.');
    }
    if (!TIPOS_VALIDOS.includes(tipoImagem)) {
      throw new ValidationError(`tipoImagem deve ser um dos: ${TIPOS_VALIDOS.join(', ')}.`);
    }

    verificarPermissao(idOficina, usuarioLogado);

    const oficina = await OficinaRepository.findById(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    const assinaturaPaga = await AssinaturaRepository.findAtivaPaga(idOficina);
    if (!assinaturaPaga) {
      throw new ForbiddenError('Upload de imagens disponível apenas para oficinas com assinatura Pro ativa.');
    }

    const urlImagem = `/uploads/imagens/${arquivo.filename}`;

    if (tipoImagem === 'LOGO') {
      const logoAtual = await ImagemRepository.findLogoAtivo(idOficina);
      if (logoAtual) {
        await ImagemRepository.delete(logoAtual.IdImagem);
        removerArquivoFisico(logoAtual.UrlImagem);
      }
    } else {
      const totalGaleria = await ImagemRepository.countByType(idOficina, 'GALERIA');
      if (totalGaleria >= LIMITE_GALERIA) {
        throw new ValidationError(`Limite de ${LIMITE_GALERIA} imagens na galeria atingido.`);
      }
    }

    const novoId = await ImagemRepository.create(idOficina, urlImagem, tipoImagem);
    return { id: novoId, idOficina, urlImagem, tipoImagem };
  }

  async removerImagem(idImagem, usuarioLogado) {
    const imagem = await ImagemRepository.findById(idImagem);
    if (!imagem) throw new NotFoundError('Imagem não encontrada.');

    verificarPermissao(imagem.IdOficina, usuarioLogado);

    await ImagemRepository.delete(idImagem);
    removerArquivoFisico(imagem.UrlImagem);

    return { message: 'Imagem removida com sucesso.' };
  }
}

export default new ImagemService();