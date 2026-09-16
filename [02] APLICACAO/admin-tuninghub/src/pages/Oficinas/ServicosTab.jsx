import { useEffect, useState } from 'react';
import { listarServicosDaOficina } from '../../api/oficinaServicoService';

const ServicosTab = ({ idOficina }) => {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const dados = await listarServicosDaOficina(idOficina);
      setServicos(dados);
      setCarregando(false);
    };
    carregar();
  }, [idOficina]);

  if (carregando) return <p className="empty-state">Carregando...</p>;

  if (servicos.length === 0) {
    return <p className="empty-state">Esta oficina ainda não vinculou nenhum serviço.</p>;
  }

  return (
    <table className="crud-table">
      <thead>
        <tr>
          <th>Serviço</th>
          <th>Categoria</th>
        </tr>
      </thead>
      <tbody>
        {servicos.map((s) => (
          <tr key={s.IdServico}>
            <td>{s.Nome}</td>
            <td><span className="categoria-tag">{s.Categoria}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ServicosTab;