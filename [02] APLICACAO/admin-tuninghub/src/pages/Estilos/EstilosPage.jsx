import { useState } from 'react';
import EstiloTab from './EstiloTab';
import KitServicosTab from './KitServicosTab';

const EstilosPage = () => {
  const [tab, setTab] = useState('estilos');

  return (
    <div>
      <div className="crud-header">
        <h1>Estilos de Customização</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab-button${tab === 'estilos' ? ' active' : ''}`}
          onClick={() => setTab('estilos')}
        >
          Estilos
        </button>
        <button
          className={`tab-button${tab === 'kit' ? ' active' : ''}`}
          onClick={() => setTab('kit')}
        >
          Kit de Serviços
        </button>
      </div>

      {tab === 'estilos' ? <EstiloTab /> : <KitServicosTab />}
    </div>
  );
};

export default EstilosPage;