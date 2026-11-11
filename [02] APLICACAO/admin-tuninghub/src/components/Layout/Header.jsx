import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Monitor, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import './Header.css';

const ROTULO_NIVEL = {
  ADMIN_MASTER: 'Admin master',
  ADMIN: 'Admin',
};

const OPCOES_TEMA = [
  { modo: 'light', rotulo: 'Claro', icone: Sun },
  { modo: 'dark', rotulo: 'Escuro', icone: Moon },
  { modo: 'system', rotulo: 'Sistema', icone: Monitor },
];

const iniciais = (nome = '') =>
  nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('') || 'A';

const MenuAdmin = () => {
  const { admin, logout } = useAuth();
  const { modo, definirModo } = useTheme();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const areaRef = useRef(null);
  const botaoRef = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    areaRef.current?.querySelector('.menu-admin__painel button')?.focus();

    const cliqueFora = (e) => {
      if (!areaRef.current?.contains(e.target)) setAberto(false);
    };
    document.addEventListener('mousedown', cliqueFora);
    return () => document.removeEventListener('mousedown', cliqueFora);
  }, [aberto]);

  const fecharComTeclado = (e) => {
    if (e.key === 'Escape') {
      setAberto(false);
      botaoRef.current?.focus();
    }
  };

  const sair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="menu-admin" ref={areaRef} onKeyDown={fecharComTeclado}>
      <button
        ref={botaoRef}
        type="button"
        className="menu-admin__botao"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        <span className="menu-admin__avatar" aria-hidden="true">{iniciais(admin?.nome)}</span>
        <span className="menu-admin__textos">
          <span className="menu-admin__nome">{admin?.nome}</span>
          <span className="menu-admin__nivel">{ROTULO_NIVEL[admin?.role] || admin?.role}</span>
        </span>
        <ChevronDown className="menu-admin__seta" size={16} aria-hidden="true" />
      </button>

      {aberto && (
        <div className="menu-admin__painel" role="menu">
          <div className="menu-admin__cabecalho">
            <p className="menu-admin__nome">{admin?.nome}</p>
            <p className="menu-admin__email">{admin?.email}</p>
          </div>

          <div className="menu-admin__grupo">
            <p className="menu-admin__rotulo" id="menu-admin-tema">Tema</p>
            <div className="menu-admin__temas" role="group" aria-labelledby="menu-admin-tema">
              {OPCOES_TEMA.map(({ modo: valor, rotulo, icone: Icone }) => (
                <button
                  key={valor}
                  type="button"
                  className={`menu-admin__tema${modo === valor ? ' menu-admin__tema--ativo' : ''}`}
                  aria-pressed={modo === valor}
                  onClick={() => definirModo(valor)}
                >
                  <Icone size={14} aria-hidden="true" />
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="menu-admin__grupo">
            <button type="button" role="menuitem" className="menu-admin__item menu-admin__item--sair" onClick={sair}>
              <LogOut size={16} aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = ({ onAbrirMenu }) => (
  <header className="header">
    <IconButton icone={Menu} rotulo="Abrir menu" className="header__menu" onClick={onAbrirMenu} />

    <div className="header__acoes">
      <ThemeToggle />
      <span className="header__divisor" aria-hidden="true" />
      <MenuAdmin />
    </div>
  </header>
);

export default Header;