import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../api/authService';

const TOKEN_KEY = 'tuninghub_admin_token';
const USER_KEY = 'tuninghub_admin_user';

// Mesmo mapeamento que o backend já faz (README): SUPER → ADMIN_MASTER, PADRAO → ADMIN
const mapNivelAcessoToRole = (nivelAcesso) =>
  nivelAcesso === 'SUPER' ? 'ADMIN_MASTER' : 'ADMIN';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera sessão salva ao recarregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      setAdmin(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

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

  // IMPORTANTE: isAuthenticated/role aqui é só UX (mostrar/esconder botão, redirecionar).
  // A segurança real é sempre validada de novo no backend (verificarToken/checkRole).
  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};