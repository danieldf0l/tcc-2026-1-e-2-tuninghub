import { useState } from 'react';
import ServicoTab from './ServicoTab';
import CategoriaTab from './CategoriaTab';

const ServicosPage = () => {
  const [tab, setTab] = useState('servicos');

  return (
    <div>
      <div className="crud-header">
        <h1>Serviços</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab-button${tab === 'servicos' ? ' active' : ''}`}
          onClick={() => setTab('servicos')}
        >
          Serviços
        </button>
        <button
          className={`tab-button${tab === 'categorias' ? ' active' : ''}`}
          onClick={() => setTab('categorias')}
        >
          Categorias
        </button>
      </div>

      {tab === 'servicos' ? <ServicoTab /> : <CategoriaTab />}
    </div>
  );
};

export default ServicosPage;