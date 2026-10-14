import db from '../config/db.js';
import bcrypt from 'bcrypt';
import OficinaRepository from '../repositories/oficina.repository.js';
import EnderecoRepository from '../repositories/endereco.repository.js';
import CnpjExternoService from './cnpjExterno.service.js';
import GeocodificacaoService from './geocodificacao.service.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG, sanitizarCnpj, validarCnpjFormato } from '../utils/validators.js';
import { calcularDistanciaKm } from '../utils/geolocalizacao.js';
import { SENAC_LATITUDE, SENAC_LONGITUDE, RAIO_MAXIMO_KM } from '../constants/localizacaoSenac.js';

const FAIXAS_PRECO_VALIDAS = ['$', '$$', '$$$'];
const CAMPOS_EDITAVEIS = ['nomeOficina', 'nomeProprietario', 'telefone', 'email'];

class OficinaService {
  async listarOficinas() {
    return await OficinaRepository.findAll();
  }

  async listarOficinasAdmin() {
    return await OficinaRepository.findAllAdmin();
  }

  async criarOficina(dados) {
    const { nomeOficina, nomeProprietario, telefone, email, senha, termosAceitos, endereco } = dados;
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
    if (!endereco || !endereco.rua || !endereco.cidade || !endereco.estado || !endereco.cep) {
      throw new ValidationError('Endereço (rua, cidade, estado, cep) é obrigatório para o cadastro da oficina.');
    }

    const emailExistente = await OficinaRepository.existsByEmail(email);
    if (emailExistente) throw new ConflictError('Já existe uma oficina cadastrada com este e-mail.');

    const cnpjExistente = await OficinaRepository.findByCnpj(cnpj);
    if (cnpjExistente) throw new ConflictError('Já existe uma oficina cadastrada com este CNPJ.');

    // Validações externas -- fora da transação (chamadas de rede não devem travar conexão de banco)
    const dadosCnpj = await CnpjExternoService.consultar(cnpj);
    const cnaePrincipal = CnpjExternoService.validarSituacaoECnae(dadosCnpj);

    const { latitude, longitude } = await GeocodificacaoService.geocodificar(endereco);
    const distanciaKm = calcularDistanciaKm(SENAC_LATITUDE, SENAC_LONGITUDE, latitude, longitude);
    if (distanciaKm > RAIO_MAXIMO_KM) {
      throw new ValidationError(
        `Endereço fora da área de atuação da plataforma (${distanciaKm.toFixed(1)}km do SENAC Nações Unidas, limite de ${RAIO_MAXIMO_KM}km).`
      );
    }

    const senhaHasheada = await bcrypt.hash(senha, 10);

    // Transação curta: só os dois INSERTs, já com tudo validado antes
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const novoIdOficina = await OficinaRepository.create({
        nomeOficina, cnpj, nomeProprietario, telefone, email, senhaHasheada,
        cnae: cnaePrincipal, dataAceiteTermos: new Date(),
      }, connection);

      const idEndereco = await EnderecoRepository.create({
        idOficina: novoIdOficina, ...endereco, latitude, longitude,
      }, connection);

      await connection.commit();

      return {
        id: novoIdOficina,
        nomeOficina, cnpj, email, cnae: cnaePrincipal,
        endereco: { idEndereco, ...endereco, latitude, longitude, distanciaKm: Number(distanciaKm.toFixed(2)) },
      };
    } catch (error) {
      await connection.rollback();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('E-mail ou CNPJ já cadastrado.');
      }
      throw error;
    } finally {
      connection.release();
    }
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

  async atualizarFaixaPreco(idOficina, faixaPreco) {
    if (!FAIXAS_PRECO_VALIDAS.includes(faixaPreco)) {
      throw new ValidationError(`faixaPreco deve ser um dos: ${FAIXAS_PRECO_VALIDAS.join(', ')}.`);
    }
    const oficina = await OficinaRepository.findByIdAdmin(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    await OficinaRepository.atualizarFaixaPreco(idOficina, faixaPreco);
    return { idOficina: Number(idOficina), faixaPreco };
  }

  async atualizarStatus(idOficina, ativo) {
    if (typeof ativo !== 'boolean') throw new ValidationError('O campo ativo deve ser true ou false.');

    const oficina = await OficinaRepository.findByIdAdmin(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    await OficinaRepository.atualizarStatus(idOficina, ativo);
    return { idOficina: Number(idOficina), ativo };
  }

  // ---------- Meus Dados ----------
  // CNPJ e CNAE NÃO são editáveis: foram validados na Receita no cadastro (RN13/16/23/24).
  // Endereço é editado em POST /api/endereco/:idOficina (revalida o raio de 4 km).

  async buscarMeusDados(idOficina) {
    const perfil = await OficinaRepository.findPerfil(idOficina);
    if (!perfil) throw new NotFoundError('Oficina não encontrada.');
    return perfil;
  }

  async atualizarMeusDados(idOficina, dados) {
    if (!CAMPOS_EDITAVEIS.some((campo) => dados[campo] !== undefined)) {
      throw new ValidationError('Informe ao menos um campo para atualizar (nomeOficina, nomeProprietario, telefone ou email).');
    }

    const perfilAtual = await this.buscarMeusDados(idOficina);

    const texto = (valor, atual) => (valor !== undefined ? String(valor).trim() : atual);

    const nomeOficina = texto(dados.nomeOficina, perfilAtual.NomeOficina);
    const email = texto(dados.email, perfilAtual.Email);
    // proprietário e telefone são opcionais: string vazia limpa o campo
    const nomeProprietario = texto(dados.nomeProprietario, perfilAtual.NomeProprietario) || null;
    const telefone = texto(dados.telefone, perfilAtual.Telefone) || null;

    if (!nomeOficina) throw new ValidationError('O nome da oficina não pode ficar vazio.');
    if (!validarEmail(email)) throw new ValidationError('E-mail inválido.');

    if (email !== perfilAtual.Email) {
      // Trocar e-mail exige confirmar a senha atual (evita sequestro de conta com token roubado)
      if (!dados.senhaAtual) {
        throw new ValidationError('Para alterar o e-mail, informe a senhaAtual.');
      }
      const oficina = await OficinaRepository.findByIdAdmin(idOficina);
      const senhaCorreta = await bcrypt.compare(dados.senhaAtual, oficina.Senha);
      if (!senhaCorreta) throw new ValidationError('Senha atual incorreta.');

      const emUso = await OficinaRepository.existsByEmailExcetoId(email, idOficina);
      if (emUso) throw new ConflictError('Já existe uma oficina cadastrada com este e-mail.');
    }

    await OficinaRepository.atualizarPerfil(idOficina, { nomeOficina, nomeProprietario, telefone, email });
    return await this.buscarMeusDados(idOficina);
  }

  async alterarSenha(idOficina, dados) {
    const { senhaAtual, novaSenha, confirmarNovaSenha } = dados;

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      throw new ValidationError('Os campos senhaAtual, novaSenha e confirmarNovaSenha são obrigatórios.');
    }

    const oficina = await OficinaRepository.findByIdAdmin(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    const senhaCorreta = await bcrypt.compare(senhaAtual, oficina.Senha);
    if (!senhaCorreta) throw new ValidationError('Senha atual incorreta.');

    if (novaSenha !== confirmarNovaSenha) throw new ValidationError('As senhas não coincidem.');
    if (!validarSenha(novaSenha)) throw new ValidationError(SENHA_REQUISITOS_MSG);

    const igualAAtual = await bcrypt.compare(novaSenha, oficina.Senha);
    if (igualAAtual) throw new ValidationError('A nova senha deve ser diferente da senha atual.');

    const senhaHasheada = await bcrypt.hash(novaSenha, 10);
    await OficinaRepository.atualizarSenha(idOficina, senhaHasheada);

    return { message: 'Senha alterada com sucesso.' };
  }
}

export default new OficinaService();