import { useEffect, useState } from 'react';
import { listarAdmins } from '../../api/adminService';

const NIVEL_LABEL = {
  SUPER: 'Admin Master',
  PADRAO: 'Admin',
};

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const dados = await listarAdmins();
      setAdmins(dados);
      setCarregando(false);
    };
    carregar();
  }, []);

  if (carregando) return <p className="empty-state">Carregando...</p>;

  return (
    <div>
      <div className="crud-header">
        <h1>Administradores</h1>
      </div>

      {admins.length === 0 ? (
        <p className="empty-state">Nenhum administrador cadastrado.</p>
      ) : (
        <table className="crud-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Nível de Acesso</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.IdAdmin}>
                <td>{a.Nome}</td>
                <td>{a.Email}</td>
                <td>
                  <span className="categoria-tag">{NIVEL_LABEL[a.NivelAcesso] || a.NivelAcesso}</span>
                </td>
                <td>{new Date(a.DataCriacao).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminsPage;