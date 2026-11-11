import { Link, NavLink } from 'react-router-dom';
import {
  BadgeDollarSign,
  Car,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Receipt,
  ShieldCheck,
  Store,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo, LogoIcone } from '../ui/Logo';
import { IconButton } from '../ui/Button';
import './Sidebar.css';

// Mesmas rotas de antes, agora agrupadas e com ícone
const SECOES = [
  {
    titulo: null,
    links: [{ to: '/dashboard', rotulo: 'Dashboard', icone: LayoutDashboard }],
  },
  {
    titulo: 'Gestão',
    links: [
      { to: '/oficinas', rotulo: 'Oficinas', icone: Store },
      { to: '/usuarios', rotulo: 'Usuários', icone: Users },
      { to: '/assinaturas', rotulo: 'Assinaturas', icone: Receipt },
    ],
  },
  {
    titulo: 'Catálogo',
    links: [
      { to: '/montadoras', rotulo: 'Montadoras e modelos', icone: Car },
      { to: '/servicos', rotulo: 'Serviços', icone: Wrench },
      { to: '/estilos', rotulo: 'Estilos de customização', icone: Palette },
      { to: '/planos', rotulo: 'Planos', icone: BadgeDollarSign },
    ],
  },
  {
    titulo: 'Sistema',
    somenteMaster: true,
    links: [{ to: '/admins', rotulo: 'Administradores', icone: ShieldCheck }],
  },
];

const Sidebar = ({ recolhida, onAlternarRecolhida, onFecharMenuMovel }) => {
  const { admin } = useAuth();
  const ehMaster = admin?.role === 'ADMIN_MASTER';

  return (
    <aside className="sidebar" aria-label="Menu principal">
      <div className="sidebar__topo">
        <Link to="/dashboard" className="sidebar__marca" onClick={onFecharMenuMovel} aria-label="TuningHub Admin, ir para o Dashboard">
          <span className="sidebar__logo-completa">
            <Logo tamanho={22} />
            <span className="sidebar__selo">Admin</span>
          </span>
          <span className="sidebar__logo-icone">
            <LogoIcone tamanho={32} />
          </span>
        </Link>
        <IconButton
          icone={X}
          rotulo="Fechar menu"
          className="sidebar__fechar-movel"
          onClick={onFecharMenuMovel}
        />
      </div>

      <nav className="sidebar__nav">
        {SECOES.filter((secao) => !secao.somenteMaster || ehMaster).map((secao, i) => (
          <div key={secao.titulo || i} className="sidebar__secao">
            {secao.titulo && <p className="sidebar__secao-titulo">{secao.titulo}</p>}
            {secao.links.map(({ to, rotulo, icone: Icone }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--ativo' : ''}`}
                title={recolhida ? rotulo : undefined}
                onClick={onFecharMenuMovel}
              >
                <Icone className="sidebar__link-icone" size={18} aria-hidden="true" />
                <span className="sidebar__link-rotulo">{rotulo}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__rodape">
        <button
          type="button"
          className="sidebar__link sidebar__recolher"
          onClick={onAlternarRecolhida}
          aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}
          title={recolhida ? 'Expandir menu' : undefined}
        >
          {recolhida ? (
            <PanelLeftOpen className="sidebar__link-icone" size={18} aria-hidden="true" />
          ) : (
            <PanelLeftClose className="sidebar__link-icone" size={18} aria-hidden="true" />
          )}
          <span className="sidebar__link-rotulo">Recolher menu</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;