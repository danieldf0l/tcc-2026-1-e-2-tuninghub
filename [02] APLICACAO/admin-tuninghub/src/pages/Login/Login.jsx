import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo, LogoIcone } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Input, InputSenha } from '../../components/ui/Campo';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { mensagemErro } from '../../utils/erroApi';
import './Login.css';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [errosCampo, setErrosCampo] = useState({});
  const [carregando, setCarregando] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Volta para a tela que a pessoa tentou abrir antes do login (ProtectedRoute manda em state.from)
  const origem = location.state?.from;
  const destino = origem?.pathname && origem.pathname !== '/login'
    ? `${origem.pathname}${origem.search || ''}`
    : '/dashboard';

  useEffect(() => {
    document.title = 'Entrar · TuningHub Admin';
  }, []);

  if (loading) return null;
  if (isAuthenticated) return <Navigate to={destino} replace />;

  const validar = () => {
    const novos = {};
    if (!email.trim()) novos.email = 'Informe o e-mail.';
    else if (!EMAIL_VALIDO.test(email.trim())) novos.email = 'E-mail inválido.';
    if (!senha) novos.senha = 'Informe a senha.';
    setErrosCampo(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!validar()) return;

    setCarregando(true);
    try {
      await login(email.trim(), senha);
      navigate(destino, { replace: true });
    } catch (error) {
      setErro(mensagemErro(error, 'Erro ao fazer login. Tente novamente.'));
      setCarregando(false);
    }
  };

  return (
    <div className="login">
      <aside className="login__marca" aria-hidden="true">
        <LogoIcone tamanho={56} />
        <div className="login__marca-textos">
          <p className="login__marca-titulo">Gerencie oficinas, catálogo e assinaturas em um só lugar.</p>
          <p className="login__marca-subtitulo">Painel administrativo do TuningHub.</p>
        </div>
        <p className="login__marca-rodape">TuningHub · TCC SENAC</p>
      </aside>

      <main className="login__area">
        <div className="login__topo">
          <ThemeToggle />
        </div>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <Logo tamanho={28} className="login__logo" />

          <h1 className="login__titulo">Entrar no painel</h1>
          <p className="login__subtitulo">Acesso restrito à equipe administrativa.</p>

          {erro && (
            <div className="login__erro" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{erro}</span>
            </div>
          )}

          <Input
            label="E-mail"
            type="email"
            icone={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errosCampo.email) setErrosCampo((atual) => ({ ...atual, email: undefined }));
            }}
            erro={errosCampo.email}
            autoComplete="username"
            autoFocus
          />

          <InputSenha
            label="Senha"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              if (errosCampo.senha) setErrosCampo((atual) => ({ ...atual, senha: undefined }));
            }}
            erro={errosCampo.senha}
            autoComplete="current-password"
          />

          <Button type="submit" larguraTotal carregando={carregando} className="login__entrar">
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Login;