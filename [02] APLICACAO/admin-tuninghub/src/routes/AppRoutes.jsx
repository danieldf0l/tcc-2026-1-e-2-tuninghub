import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login';
import ProtectedRoute from './ProtectedRoute';

const Dashboard = () => <div style={{ padding: 24 }}>Dashboard (em construção)</div>;

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;