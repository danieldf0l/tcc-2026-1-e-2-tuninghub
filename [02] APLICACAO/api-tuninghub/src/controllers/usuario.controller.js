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

  aceitarTermos = async (req, res, next) => {
  try {
    const resultado = await UsuarioService.aceitarTermos(req.usuarioLogado.id);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

  listarAdmin = async (req, res, next) => {
    try {
      const usuarios = await UsuarioService.listarUsuariosAdmin();
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  };

  desativar = async (req, res, next) => {
    try {
      const resultado = await UsuarioService.atualizarStatus(req.params.id, false);
      res.status(200).json({ message: 'Usuário desativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };

  reativar = async (req, res, next) => {
    try {
      const resultado = await UsuarioService.atualizarStatus(req.params.id, true);
      res.status(200).json({ message: 'Usuário reativado com sucesso!', ...resultado });
    } catch (error) {
      next(error);
    }
  };
}

export default new UsuarioController();