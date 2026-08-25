import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { admin } = useAuth();

  return (
    <div>
      <h1>Olá, {admin?.nome}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
        Use o menu à esquerda para gerenciar oficinas, usuários e o catálogo do TuningHub.
      </p>
    </div>
  );
};

export default Dashboard;