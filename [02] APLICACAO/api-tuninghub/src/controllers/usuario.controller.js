import UsuarioService from '../services/usuario.service.js';

class UsuarioController {
  listar = async (req, res, next) => {
    try {
      const usuarios = await UsuarioService.listarUsuarios();
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  };

  criar = async (req, res, next) => {
    try {
      const dados = req.body;
      const usuario = await UsuarioService.criarUsuario(dados);
      res.status(201).json({ message: 'Usuário criado com sucesso', usuario });
    } catch (error) {
      next(error);
    }
  };
}

export default new UsuarioController();