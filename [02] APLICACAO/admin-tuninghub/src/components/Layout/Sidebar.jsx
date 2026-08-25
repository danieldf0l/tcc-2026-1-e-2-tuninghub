import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/oficinas', label: 'Oficinas' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/montadoras', label: 'Montadoras e Modelos' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/planos', label: 'Planos e Assinaturas' },
];

const Sidebar = () => {
  const { admin } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">TuningHub</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
        {admin?.role === 'ADMIN_MASTER' && (
          <NavLink
            to="/admins"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            Administradores
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;