import { useEffect, useState } from 'react';
import { listarAssinaturasAdmin } from '../../api/assinaturaService';

const STATUS_LABEL = { ATIVA: 'ativo', PENDENTE: 'pendente', EXPIRADA: 'inativo', CANCELADA: 'inativo' };

const AssinaturaTab = ({ idOficina }) => {
  const [assinaturas, setAssinaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const todas = await listarAssinaturasAdmin();
      setAssinaturas(
        todas
          .filter((a) => a.IdOficina === idOficina)
          .sort((a, b) => new Date(b.DataCriacao) - new Date(a.DataCriacao))
      );
      setCarregando(false);
    };
    carregar();
  }, [idOficina]);

  if (carregando) return <p className="empty-state">Carregando...</p>;

  if (assinaturas.length === 0) {
    return <p className="empty-state">Esta oficina nunca teve uma assinatura.</p>;
  }

  return (
    <table className="crud-table">
      <thead>
        <tr>
          <th>Plano</th>
          <th>Início</th>
          <th>Fim</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {assinaturas.map((a) => (
          <tr key={a.IdAssinatura}>
            <td>{a.NomePlano}</td>
            <td>{a.DataInicio ? new Date(a.DataInicio).toLocaleDateString('pt-BR') : '—'}</td>
            <td>{a.DataFim ? new Date(a.DataFim).toLocaleDateString('pt-BR') : '—'}</td>
            <td>
              <span className={`status-badge ${STATUS_LABEL[a.Status] || 'inativo'}`}>{a.Status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AssinaturaTab;