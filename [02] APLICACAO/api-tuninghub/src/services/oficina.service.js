import bcrypt from 'bcrypt';
import OficinaRepository from '../repositories/oficina.repository.js';
import CnpjExternoService from './cnpjExterno.service.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG, sanitizarCnpj, validarCnpjFormato } from '../utils/validators.js';
import { calcularDistanciaKm } from '../utils/geolocalizacao.js';
import { SENAC_LATITUDE, SENAC_LONGITUDE } from '../constants/localizacaoSenac.js';

class OficinaService {
  async listarOficinas() {
    return await OficinaRepository.findAll();
  }

  async criarOficina(dados) {
    const { nomeOficina, nomeProprietario, telefone, email, senha, termosAceitos } = dados;
    const cnpj = sanitizarCnpj(dados.cnpj);

    if (!nomeOficina || !cnpj || !email || !senha) {
      throw new ValidationError('Os campos NomeOficina, CNPJ, Email e Senha são obrigatórios.');
    }
    if (termosAceitos !== true) {
      throw new ValidationError('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
    }
    if (!validarEmail(email)) {
      throw new ValidationError('E-mail inválido.');
    }
    if (!validarSenha(senha)) {
      throw new ValidationError(SENHA_REQUISITOS_MSG);
    }
    if (!validarCnpjFormato(cnpj)) {
      throw new ValidationError('CNPJ inválido.');
    }

    const emailExistente = await OficinaRepository.existsByEmail(email);
    if (emailExistente) {
      throw new ConflictError('Já existe uma oficina cadastrada com este e-mail.');
    }
    const cnpjExistente = await OficinaRepository.findByCnpj(cnpj);
    if (cnpjExistente) {
      throw new ConflictError('Já existe uma oficina cadastrada com este CNPJ.');
    }

    const dadosCnpj = await CnpjExternoService.consultar(cnpj);
    const cnaePrincipal = CnpjExternoService.validarSituacaoECnae(dadosCnpj);

    const saltRounds = 10;
    const senhaHasheada = await bcrypt.hash(senha, saltRounds);

    const novoId = await OficinaRepository.create({
      nomeOficina, cnpj, nomeProprietario, telefone, email, senhaHasheada,
      cnae: cnaePrincipal, dataAceiteTermos: new Date(),
    });

    return { id: novoId, nomeOficina, cnpj, email, cnae: cnaePrincipal };
  }

  async buscarOficinas({ idServico, lat, lng }) {
    if (idServico !== undefined && Number.isNaN(Number(idServico))) {
      throw new ValidationError('idServico deve ser numérico.');
    }
    const latRef = lat !== undefined ? Number(lat) : SENAC_LATITUDE;
    const lngRef = lng !== undefined ? Number(lng) : SENAC_LONGITUDE;
    if (Number.isNaN(latRef) || Number.isNaN(lngRef)) {
      throw new ValidationError('lat e lng devem ser números válidos.');
    }

    const oficinas = await OficinaRepository.buscarComEndereco(idServico);
    return oficinas
      .map((oficina) => ({
        ...oficina,
        distanciaKm: Number(calcularDistanciaKm(latRef, lngRef, oficina.Latitude, oficina.Longitude).toFixed(2)),
      }))
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }

  async aceitarTermos(idOficina) {
    const linhasAfetadas = await OficinaRepository.aceitarTermos(idOficina);
    if (linhasAfetadas === 0) throw new NotFoundError('Oficina não encontrada.');
    return { message: 'Termos aceitos com sucesso.' };
  }
}

export default new OficinaService();