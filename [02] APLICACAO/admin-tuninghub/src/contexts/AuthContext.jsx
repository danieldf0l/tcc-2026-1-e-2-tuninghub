import { createContext, useContext, useState } from 'react';
import { loginAdmin } from '../api/authService';

const TOKEN_KEY = 'tuninghub_admin_token';
const USER_KEY = 'tuninghub_admin_user';

const mapNivelAcessoToRole = (nivelAcesso) => (nivelAcesso === 'SUPER' ? 'ADMIN_MASTER' : 'ADMIN');

const AuthContext = createContext(null);

// Sessão salva no navegador (só vale se tiver usuário e token)
const lerAdminSalvo = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (!storedUser || !storedToken) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Lê a sessão salva já na criação do estado (sem esperar um efeito)
  const [admin, setAdmin] = useState(lerAdminSalvo);
  const loading = false; // mantido para quem já usa (Login e ProtectedRoute)

  const login = async (email, senha) => {
    const { usuario, token } = await loginAdmin(email, senha);
    const adminData = {
      id: usuario.IdAdmin,
      nome: usuario.Nome,
      email: usuario.Email,
      role: mapNivelAcessoToRole(usuario.NivelAcesso),
    };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);