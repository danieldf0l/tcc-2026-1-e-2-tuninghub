import AuthService from '../services/auth.service.js';
import { EmailNaoVerificadoError } from '../errors/EmailNaoVerificadoError.js';

class AuthController {
  #validarCredenciais(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
      res.status(400).json({ status: 'error', message: 'E-mail e senha são obrigatórios.' });
      return null;
    }
    return { email, senha };
  }

  // 403 com "code" para o app abrir a tela "Confirmar e-mail". Devolve true se respondeu.
  #responderSeEmailNaoVerificado(error, res) {
    if (!(error instanceof EmailNaoVerificadoError)) return false;
    res.status(403).json({ status: 'error', code: error.code, message: error.message });
    return true;
  }

  loginUsuario = async (req, res, next) => {
    try {
      const credenciais = this.#validarCredenciais(req, res);
      if (!credenciais) return;
      const resultado = await AuthService.loginUsuario(credenciais.email, credenciais.senha);
      res.status(200).json({ message: 'Login realizado com sucesso!', data: resultado });
    } catch (error) {
      if (!this.#responderSeEmailNaoVerificado(error, res)) next(error);
    }
  };

  loginOficina = async (req, res, next) => {
    try {
      const credenciais = this.#validarCredenciais(req, res);
      if (!credenciais) return;
      const resultado = await AuthService.loginOficina(credenciais.email, credenciais.senha);
      res.status(200).json({ message: 'Login realizado com sucesso!', data: resultado });
    } catch (error) {
      if (!this.#responderSeEmailNaoVerificado(error, res)) next(error);
    }
  };

  loginAdmin = async (req, res, next) => {
    try {
      const credenciais = this.#validarCredenciais(req, res);
      if (!credenciais) return;
      const resultado = await AuthService.loginAdmin(credenciais.email, credenciais.senha);
      res.status(200).json({ message: 'Login realizado com sucesso!', data: resultado });
    } catch (error) {
      next(error);
    }
  };

  verificarEmail = async (req, res, next) => {
    try {
      const resultado = await AuthService.verificarEmail(req.body || {});
      res.status(200).json({ message: 'E-mail confirmado com sucesso!', data: resultado });
    } catch (error) {
      next(error);
    }
  };

  reenviarCodigo = async (req, res, next) => {
    try {
      const { email, tipo } = req.body || {};
      const resultado = await AuthService.reenviarCodigoVerificacao(email, tipo);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  esqueciSenha = async (req, res, next) => {
    try {
      const { email, tipo } = req.body || {};
      const resultado = await AuthService.solicitarRecuperacaoSenha(email, tipo);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  redefinirSenha = async (req, res, next) => {
    try {
      const resultado = await AuthService.redefinirSenha(req.body || {});
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();