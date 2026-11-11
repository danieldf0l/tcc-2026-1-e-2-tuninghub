import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  // Guarda a tela de origem (com filtros da URL) para voltar a ela depois do login
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

export default ProtectedRoute;