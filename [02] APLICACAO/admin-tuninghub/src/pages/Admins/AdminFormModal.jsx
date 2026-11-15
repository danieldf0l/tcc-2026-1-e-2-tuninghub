import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
import { mensagemErro } from '../../utils/erroApi';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, InputSenha } from '../../components/ui/Campo';
import Aviso from '../../components/ui/Aviso';
import { criarAdmin, atualizarAdmin } from '../../api/adminService';

const NIVEIS = [
  { valor: 'PADRAO', titulo: 'Admin', descricao: 'Cria itens nos catálogos e gerencia oficinas e usuários.' },
  { valor: 'SUPER', titulo: 'Admin Master', descricao: 'Tudo do Admin, mais editar e desativar catálogos e gerenciar administradores.' },
];

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mesma regra de senha do cadastro: 8+ caracteres, com maiúscula, número e caractere especial
const SENHA_FORTE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/*
  Criar (editando = null) ou editar um administrador.
  Na edição não há troca de senha (o backend não tem essa rota para admin)
  e o próprio admin não pode mudar o nível dele.
*/
const AdminFormModal = ({ editando, ehVoce, onFechar, onSalvo }) => {
  const toast = useToast();
  const podeDescartar = useConfirmarDescarte();

  const [inicial] = useState(() => ({
    nome: editando?.Nome || '',
    email: editando?.Email || '',
    nivelAcesso: editando?.NivelAcesso || 'PADRAO',
  }));
  const [form, setForm] = useState({ ...inicial, senha: '', confirmarSenha: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);

  const alterado =
    form.nome.trim() !== inicial.nome ||
    form.email.trim() !== inicial.email ||
    form.nivelAcesso !== inicial.nivelAcesso ||
    form.senha !== '' ||
    form.confirmarSenha !== '';

  const mudarCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    setErroGeral('');
  };

  const fechar = async () => {
    if (await podeDescartar(alterado)) onFechar();
  };

  const validar = () => {
    const novos = {};
    if (!form.nome.trim()) novos.nome = 'Informe o nome.';
    if (!EMAIL_VALIDO.test(form.email.trim())) novos.email = 'Informe um e-mail válido.';
    if (!editando) {
      if (!SENHA_FORTE.test(form.senha)) {
        novos.senha = 'Use 8 ou mais caracteres, com letra maiúscula, número e caractere especial.';
      }
      if (form.confirmarSenha !== form.senha) novos.confirmarSenha = 'As senhas não conferem.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    const dados = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
    };
    // Na edição, o nível só vai quando muda (o backend recusa mudar o próprio nível)
    if (!editando || form.nivelAcesso !== inicial.nivelAcesso) dados.nivelAcesso = form.nivelAcesso;

    setSalvando(true);
    setErroGeral('');
    try {
      if (editando) {
        await atualizarAdmin(editando.IdAdmin, dados);
        toast.sucesso(`Administrador "${dados.nome}" atualizado.`);
      } else {
        await criarAdmin({ ...dados, senha: form.senha });
        toast.sucesso(`Administrador "${dados.nome}" criado. Passe a senha para ele por um canal seguro.`);
      }
      await onSalvo();
      onFechar();
    } catch (error) {
      setErroGeral(mensagemErro(error, 'Não foi possível salvar o administrador.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal title={editando ? 'Editar administrador' : 'Novo administrador'} onClose={fechar} wide>
      <form onSubmit={handleSalvar} noValidate>
        {erroGeral && (
          <div className="admin-form__aviso">
            <Aviso tom="perigo" titulo="Não foi possível salvar">
              {erroGeral}
            </Aviso>
          </div>
        )}

        <Input
          label="Nome"
          value={form.nome}
          onChange={(e) => mudarCampo('nome', e.target.value)}
          erro={erros.nome}
          required
          autoFocus
        />
        <Input
          label="E-mail"
          type="email"
          autoComplete="off"
          value={form.email}
          onChange={(e) => mudarCampo('email', e.target.value)}
          erro={erros.email}
          dica={editando ? undefined : 'É o login dele no painel.'}
          required
        />

        {!editando && (
          <div className="admin-form__senhas">
            <InputSenha
              label="Senha inicial"
              autoComplete="new-password"
              value={form.senha}
              onChange={(e) => mudarCampo('senha', e.target.value)}
              erro={erros.senha}
              dica={erros.senha ? undefined : '8+ caracteres, com maiúscula, número e caractere especial.'}
              required
            />
            <InputSenha
              label="Confirmar senha"
              autoComplete="new-password"
              value={form.confirmarSenha}
              onChange={(e) => mudarCampo('confirmarSenha', e.target.value)}
              erro={erros.confirmarSenha}
              required
            />
          </div>
        )}

        <fieldset className="admin-form__nivel" disabled={ehVoce}>
          <legend className="admin-form__legenda">Nível de acesso</legend>
          <div className="opcoes-nivel" role="radiogroup" aria-label="Nível de acesso">
            {NIVEIS.map((n) => (
              <label key={n.valor} className={`opcao-nivel${form.nivelAcesso === n.valor ? ' opcao-nivel--ativa' : ''}`}>
                <input
                  type="radio"
                  name="nivelAcesso"
                  value={n.valor}
                  checked={form.nivelAcesso === n.valor}
                  onChange={() => mudarCampo('nivelAcesso', n.valor)}
                />
                <span className="opcao-nivel__titulo">{n.titulo}</span>
                <span className="opcao-nivel__descricao">{n.descricao}</span>
              </label>
            ))}
          </div>
          {ehVoce && <p className="admin-form__dica">Você não pode mudar o seu próprio nível de acesso.</p>}
        </fieldset>

        <div className="form-actions">
          <Button variante="secundario" onClick={fechar}>
            Cancelar
          </Button>
          <Button type="submit" carregando={salvando} disabled={!!editando && !alterado}>
            {editando ? 'Salvar' : 'Criar administrador'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminFormModal;