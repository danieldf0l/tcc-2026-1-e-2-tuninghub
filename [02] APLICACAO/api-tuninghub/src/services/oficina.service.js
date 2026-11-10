import db from '../config/db.js';
import bcrypt from 'bcrypt';
import OficinaRepository from '../repositories/oficina.repository.js';
import EnderecoRepository from '../repositories/endereco.repository.js';
import CnpjExternoService from './cnpjExterno.service.js';
import GeocodificacaoService from './geocodificacao.service.js';
import AssinaturaRepository from '../repositories/assinatura.repository.js';
import ProjetoRepository from '../repositories/projeto.repository.js';
import ImagemService from './imagem.service.js';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { validarEmail, validarSenha, SENHA_REQUISITOS_MSG, sanitizarCnpj, validarCnpjFormato } from '../utils/validators.js';
import { calcularDistanciaKm } from '../utils/geolocalizacao.js';
import { SENAC_LATITUDE, SENAC_LONGITUDE, RAIO_MAXIMO_KM } from '../constants/localizacaoSenac.js';
import VerificacaoEmailService, { FINALIDADE } from './verificacaoEmail.service.js';

const FAIXAS_PRECO_VALIDAS = ['$', '$$', '$$$'];
const LIMITE_PADRAO_PAGINA = 10;
const LIMITE_MAXIMO_PAGINA = 30;
const CAMPOS_EDITAVEIS = ['nomeOficina', 'nomeProprietario', 'telefone', 'email'];

// Contato direto (Telefone e Email) só aparece para oficina com plano Pro ativo.
// Sem plano pago, as chaves são REMOVIDAS do JSON (não vão como null), para o app checar pela ausência.
// O plano de todas as oficinas da lista é resolvido em UMA consulta (sem N+1).
const aplicarRegraDeContato = async (oficinas, idsComPlanoPagoJaConsultados) => {
  const idsComPlanoPago = idsComPlanoPagoJaConsultados
    || await AssinaturaRepository.findIdsComPlanoPago(oficinas.map((oficina) => oficina.IdOficina));

  return oficinas.map((oficina) => {
    if (idsComPlanoPago.has(oficina.IdOficina)) return oficina;
    const { Telefone: _telefone, Email: _email, ...semContato } = oficina;
    return semContato;
  });
};

class OficinaService {
  async listarOficinas() {
    const oficinas = await OficinaRepository.findAll();
    return await aplicarRegraDeContato(oficinas);
  }

  // Oficinas que atendem os serviços PENDENTES de um projeto do entusiasta, paginadas no banco.
  // Ordem: mais serviços atendidos > mais perto > menor id (oficina paga NÃO ganha prioridade).
  async buscarPorProjeto({ idProjeto, idServicos, lat, lng, pagina, limite }, usuarioLogado) {
    const inteiroPositivo = (valor) => /^\d+$/.test(String(valor)) && Number(valor) > 0;

    if (!inteiroPositivo(idProjeto)) {
      throw new ValidationError('idProjeto é obrigatório e deve ser um número válido.');
    }
    if (pagina !== undefined && !inteiroPositivo(pagina)) {
      throw new ValidationError('pagina deve ser um inteiro maior que zero.');
    }
    if (limite !== undefined && !inteiroPositivo(limite)) {
      throw new ValidationError('limite deve ser um inteiro maior que zero.');
    }
    const paginaAtual = pagina !== undefined ? Number(pagina) : 1;
    const limitePagina = Math.min(limite !== undefined ? Number(limite) : LIMITE_PADRAO_PAGINA, LIMITE_MAXIMO_PAGINA);

    const latRef = lat !== undefined ? Number(lat) : SENAC_LATITUDE;
    const lngRef = lng !== undefined ? Number(lng) : SENAC_LONGITUDE;
    if (!Number.isFinite(latRef) || !Number.isFinite(lngRef) || Math.abs(latRef) > 90 || Math.abs(lngRef) > 180) {
      throw new ValidationError('lat e lng devem ser coordenadas válidas.');
    }

    // Projeto inexistente, inativo ou de outra pessoa: sempre o mesmo 404 (não revela que existe).
    const projeto = await ProjetoRepository.findParaBuscaOficinas(idProjeto);
    if (!projeto || String(projeto.IdUsuario) !== String(usuarioLogado.id)) {
      throw new NotFoundError('Projeto não encontrado.');
    }

    const pendentes = await ProjetoRepository.findServicosPendentes(idProjeto);

    let servicosBuscados = pendentes;
    if (idServicos !== undefined) {
      const ids = String(idServicos).split(',').map((id) => id.trim());
      if (!ids.every(inteiroPositivo)) {
        throw new ValidationError('idServicos deve ser uma lista de ids separados por vírgula. Ex.: 1,2,3');
      }
      const idsPedidos = new Set(ids.map(Number));
      servicosBuscados = pendentes.filter((servico) => idsPedidos.has(servico.IdServico));
      if (servicosBuscados.length !== idsPedidos.size) {
        throw new ValidationError('idServicos deve conter apenas serviços pendentes deste projeto.');
      }
    }

    const projetoResumo = {
      IdProjeto: projeto.IdProjeto,
      Descricao: projeto.Descricao,
      Estilo: projeto.Estilo,
      IdModelo: projeto.IdModelo,
      NomeModelo: projeto.NomeModelo,
      NomeMontadora: projeto.NomeMontadora,
    };
    const resposta = (total, oficinas) => ({
      projeto: projetoResumo,
      servicosBuscados,
      pagina: paginaAtual,
      limite: limitePagina,
      total,
      temMais: paginaAtual * limitePagina < total,
      oficinas,
    });

    // projeto sem serviços pendentes: não é erro
    if (servicosBuscados.length === 0) return resposta(0, []);

    const idsServicos = servicosBuscados.map((servico) => servico.IdServico);
    const total = await OficinaRepository.contarPorServicos(idsServicos);
    if (total === 0) return resposta(0, []);

    const linhas = await OficinaRepository.buscarPorServicos({
      idsServicos, lat: latRef, lng: lngRef, limite: limitePagina, offset: (paginaAtual - 1) * limitePagina,
    });

    // mesma regra de contato do /buscar e do perfil público (plano das oficinas da página em UMA consulta)
    const semIdsAtendidos = linhas.map(({ IdsAtendidos: _descartado, ...resto }) => resto);
    const idsComPlanoPago = await AssinaturaRepository.findIdsComPlanoPago(linhas.map((linha) => linha.IdOficina));
    const comRegraDeContato = await aplicarRegraDeContato(semIdsAtendidos, idsComPlanoPago);
    // logo só das oficinas Pro: as demais ficam com UrlLogo null
    const logos = await OficinaRepository.buscarLogosAtivas([...idsComPlanoPago]);

    const oficinas = comRegraDeContato.map((oficina, indice) => {
      const idsAtendidos = new Set(String(linhas[indice].IdsAtendidos).split(',').map(Number));
      const servicosAtendidos = servicosBuscados.filter((servico) => idsAtendidos.has(servico.IdServico));
      const servicosFaltantes = servicosBuscados.filter((servico) => !idsAtendidos.has(servico.IdServico));

      return {
        ...oficina,
        distanciaKm: Number(oficina.distanciaKm),
        quantidadeAtendida: Number(oficina.quantidadeAtendida),
        totalServicos: servicosBuscados.length,
        servicosAtendidos,
        servicosFaltantes,
        UrlLogo: logos.get(oficina.IdOficina) || null,
      };
    });

    return resposta(total, oficinas);
  }

  async buscarPerfilPublico(idOficina) {
    if (!Number.isInteger(Number(idOficina)) || Number(idOficina) <= 0) {
      throw new ValidationError('O id da oficina deve ser um número válido.');
    }
    const oficina = await OficinaRepository.findPublicaPorId(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    const [oficinaComRegra] = await aplicarRegraDeContato([oficina]);
    return oficinaComRegra;
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

      // A conta nasce com e-mail NÃO confirmado: enviamos o código (sem await; nunca lança erro).
      VerificacaoEmailService.enviarCodigoCadastro('oficina', { IdOficina: novoIdOficina, NomeOficina: nomeOficina, Email: email });

      return {
        id: novoIdOficina,
        nomeOficina, cnpj, email, cnae: cnaePrincipal, emailVerificado: false,
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

    const oficinasBrutas = await OficinaRepository.buscarComEndereco(idServico);
    const oficinas = await aplicarRegraDeContato(oficinasBrutas);
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

  // Nome, proprietário e telefone são salvos na hora. E-mail novo NÃO é trocado direto: o código vai
  // para o endereço novo e a troca só vale em POST /me/confirmar-email.
  // Devolve { perfil, emailPendente } (emailPendente = e-mail aguardando confirmação, ou null).
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

    let emailPendente = null;

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

      // envia o código ANTES de salvar o resto: se o e-mail falhar (503), nada é alterado
      await VerificacaoEmailService.solicitarTrocaEmail({
        tipo: 'oficina',
        conta: { IdOficina: idOficina, NomeOficina: nomeOficina },
        novoEmail: email,
      });
      emailPendente = email;
    }

    // o e-mail continua o ATUAL até a confirmação
    await OficinaRepository.atualizarPerfil(idOficina, { nomeOficina, nomeProprietario, telefone, email: perfilAtual.Email });
    return { perfil: await this.buscarMeusDados(idOficina), emailPendente };
  }

  // Segunda etapa da troca de e-mail: confere o código enviado ao e-mail NOVO e efetiva a troca.
  async confirmarTrocaEmail(idOficina, dados) {
    const { codigo } = dados;
    if (!codigo) throw new ValidationError('Informe o código recebido no novo e-mail.');

    const token = await VerificacaoEmailService.consumirCodigo({
      tipo: 'oficina', idDono: idOficina, finalidade: FINALIDADE.TROCA_EMAIL, codigo,
    });
    const novoEmail = token.NovoEmail;

    // alguém pode ter ocupado o e-mail nesse meio tempo
    if (await OficinaRepository.existsByEmailExcetoId(novoEmail, idOficina)) {
      throw new ConflictError('Já existe uma oficina cadastrada com este e-mail.');
    }

    try {
      await OficinaRepository.trocarEmail(idOficina, novoEmail);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ConflictError('Já existe uma oficina cadastrada com este e-mail.');
      throw error;
    }
    return await this.buscarMeusDados(idOficina);
  }

  // Exclusão física da própria conta (LGPD). Irreversível — diferente do soft delete (Ativo).
  // Registros financeiros dos pagamentos permanecem no processador (AbacatePay).
  async excluirMinhaConta(idOficina, dados) {
    const { senha, confirmacao } = dados;

    if (!senha || confirmacao !== 'EXCLUIR') {
      throw new ValidationError('Informe a senha e confirmacao: "EXCLUIR" para excluir a conta definitivamente.');
    }

    const oficina = await OficinaRepository.findByIdAdmin(idOficina);
    if (!oficina) throw new NotFoundError('Oficina não encontrada.');

    const senhaCorreta = await bcrypt.compare(senha, oficina.Senha);
    if (!senhaCorreta) throw new ValidationError('Senha incorreta.');

    const urlsImagens = await OficinaRepository.excluirDefinitivamente(idOficina);
    // só depois do commit: se o banco falhar, as fotos continuam no disco
    ImagemService.removerArquivosFisicos(urlsImagens);

    return { message: 'Conta excluída definitivamente. Todos os seus dados foram removidos.' };
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

    return { message: 'Senha alterada com sucesso. Faça login novamente.' };
  }
}

export default new OficinaService();