import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from './ProtectedRoute';

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
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;