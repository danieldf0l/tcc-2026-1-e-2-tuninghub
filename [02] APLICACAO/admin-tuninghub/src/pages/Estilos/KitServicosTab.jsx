import { useEffect, useState } from 'react';
import { listarEstilosAtivos } from '../../api/estiloService';
import { listarServicosAdmin } from '../../api/servicoService';
import {
  listarKitDoEstilo,
  vincularServicoAoEstilo,
  desvincularServicoDoEstilo,
} from '../../api/estiloServicoSugeridoService';

const KitServicosTab = () => {
  const [estilosAtivos, setEstilosAtivos] = useState([]);
  const [servicosAtivos, setServicosAtivos] = useState([]);
  const [carregandoBase, setCarregandoBase] = useState(true);

  const [estiloSelecionado, setEstiloSelecionado] = useState('');
  const [kitAtual, setKitAtual] = useState([]);
  const [carregandoKit, setCarregandoKit] = useState(false);
  const [processando, setProcessando] = useState(null); // IdServico em ação, para desabilitar o checkbox durante a chamada

  useEffect(() => {
    const carregarBase = async () => {
      setCarregandoBase(true);
      const [dadosEstilos, dadosServicos] = await Promise.all([
        listarEstilosAtivos(),
        listarServicosAdmin(),
      ]);
      setEstilosAtivos(dadosEstilos);
      setServicosAtivos(dadosServicos.filter((s) => s.Ativo));
      if (dadosEstilos.length > 0) {
        setEstiloSelecionado(dadosEstilos[0].Codigo);
      }
      setCarregandoBase(false);
    };
    carregarBase();
  }, []);

  const carregarKit = async (codigoEstilo) => {
    setCarregandoKit(true);
    const dados = await listarKitDoEstilo(codigoEstilo);
    setKitAtual(dados);
    setCarregandoKit(false);
  };

  useEffect(() => {
    if (estiloSelecionado) {
      carregarKit(estiloSelecionado);
    }
  }, [estiloSelecionado]);

  const estaNoKit = (idServico) => kitAtual.some((s) => s.IdServico === idServico);

  const handleToggleServico = async (idServico) => {
    setProcessando(idServico);
    try {
      if (estaNoKit(idServico)) {
        await desvincularServicoDoEstilo(estiloSelecionado, idServico);
      } else {
        await vincularServicoAoEstilo(estiloSelecionado, idServico);
      }
      await carregarKit(estiloSelecionado);
    } finally {
      setProcessando(null);
    }
  };

  if (carregandoBase) return <p className="empty-state">Carregando...</p>;

  if (estilosAtivos.length === 0) {
    return <p className="empty-state">Cadastre um estilo ativo antes de montar um kit de serviços.</p>;
  }

  return (
    <div>
      <div className="form-field" style={{ maxWidth: 320, marginBottom: 20 }}>
        <label htmlFor="estiloKit">Estilo</label>
        <select
          id="estiloKit"
          value={estiloSelecionado}
          onChange={(e) => setEstiloSelecionado(e.target.value)}
        >
          {estilosAtivos.map((e) => (
            <option key={e.Codigo} value={e.Codigo}>{e.Nome}</option>
          ))}
        </select>
      </div>

      <p className="modal-texto">
        Marque os serviços que devem entrar automaticamente na To-do List quando um usuário escolher este estilo.
      </p>

      {carregandoKit ? (
        <p className="empty-state">Carregando kit...</p>
      ) : servicosAtivos.length === 0 ? (
        <p className="empty-state">Nenhum serviço ativo cadastrado.</p>
      ) : (
        <div className="lista-selecao" style={{ maxHeight: 420 }}>
          {servicosAtivos.map((s) => (
            <label key={s.IdServico} className="lista-selecao-item">
              <input
                type="checkbox"
                checked={estaNoKit(s.IdServico)}
                disabled={processando === s.IdServico}
                onChange={() => handleToggleServico(s.IdServico)}
              />
              {s.Nome}
              <span className="categoria-tag" style={{ marginLeft: 'auto' }}>{s.Categoria}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitServicosTab;