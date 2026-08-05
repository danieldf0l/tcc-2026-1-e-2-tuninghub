import AuthService from '../services/auth.service.js';

class AuthController {
  #validarCredenciais(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
      res.status(400).json({ status: 'error', message: 'E-mail e senha são obrigatórios.' });
      return null;
    }
    return { email, senha };
  }

  loginUsuario = async (req, res, next) => {
    try {
      const credenciais = this.#validarCredenciais(req, res);
      if (!credenciais) return;
      const resultado = await AuthService.loginUsuario(credenciais.email, credenciais.senha);
      res.status(200).json({ message: 'Login realizado com sucesso!', data: resultado });
    } catch (error) {
      next(error);
    }
  };

  loginOficina = async (req, res, next) => {
    try {
      const credenciais = this.#validarCredenciais(req, res);
      if (!credenciais) return;
      const resultado = await AuthService.loginOficina(credenciais.email, credenciais.senha);
      res.status(200).json({ message: 'Login realizado com sucesso!', data: resultado });
    } catch (error) {
      next(error);
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
}

export default new AuthController();