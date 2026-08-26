import { useState } from 'react';
import MontadoraTab from './MontadoraTab';
import ModeloTab from './ModeloTab';

const MontadorasPage = () => {
  const [tab, setTab] = useState('montadoras');

  return (
    <div>
      <div className="crud-header">
        <h1>Montadoras e Modelos</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab-button${tab === 'montadoras' ? ' active' : ''}`}
          onClick={() => setTab('montadoras')}
        >
          Montadoras
        </button>
        <button
          className={`tab-button${tab === 'modelos' ? ' active' : ''}`}
          onClick={() => setTab('modelos')}
        >
          Modelos
        </button>
      </div>

      {tab === 'montadoras' ? <MontadoraTab /> : <ModeloTab />}
    </div>
  );
};

export default MontadorasPage;