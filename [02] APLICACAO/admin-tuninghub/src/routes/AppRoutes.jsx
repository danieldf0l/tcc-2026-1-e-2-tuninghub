import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import MontadorasPage from '../pages/Montadoras/MontadorasPage';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import ServicosPage from '../pages/Servicos/ServicosPage';
import PlanosPage from '../pages/Planos/PlanosPage';
import EstilosPage from '../pages/Estilos/EstilosPage';
import OficinasPage from '../pages/Oficinas/OficinasPage';
import AdminsPage from '../pages/Admins/AdminsPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/montadoras" element={<MontadorasPage />} />
      <Route path="/servicos" element={<ServicosPage />} />
      <Route path="/planos" element={<PlanosPage />} />
      <Route path="/estilos" element={<EstilosPage />} />
      <Route path="/oficinas" element={<OficinasPage />} />
      <Route path="/admins" element={<AdminsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes; 