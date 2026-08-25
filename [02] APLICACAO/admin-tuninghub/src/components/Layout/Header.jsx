import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const roleLabel = {
  ADMIN_MASTER: 'Admin Master',
  ADMIN: 'Admin',
};

const Header = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="header">
      <div className="header-user">
        <span className="header-nome">{admin?.nome}</span>
        <span className="header-role">{roleLabel[admin?.role] || admin?.role}</span>
      </div>
      <button className="header-logout" onClick={handleLogout}>
        Sair
      </button>
    </header>
  );
};

export default Header;