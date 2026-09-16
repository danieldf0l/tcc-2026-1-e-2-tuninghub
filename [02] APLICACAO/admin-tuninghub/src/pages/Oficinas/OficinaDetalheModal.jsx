import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import DadosTab from './DadosTab';
import EnderecoTab from './EnderecoTab';
import ServicosTab from './ServicosTab';
import AssinaturaTab from './AssinaturaTab';

const OficinaDetalheModal = ({ oficina, onClose, onAtualizado }) => {
  const [tab, setTab] = useState('dados');

  return (
    <Modal title={oficina.NomeOficina} onClose={onClose} wide>
      <div className="tabs">
        <button className={`tab-button${tab === 'dados' ? ' active' : ''}`} onClick={() => setTab('dados')}>
          Dados
        </button>
        <button className={`tab-button${tab === 'endereco' ? ' active' : ''}`} onClick={() => setTab('endereco')}>
          Endereço
        </button>
        <button className={`tab-button${tab === 'servicos' ? ' active' : ''}`} onClick={() => setTab('servicos')}>
          Serviços
        </button>
        <button className={`tab-button${tab === 'assinatura' ? ' active' : ''}`} onClick={() => setTab('assinatura')}>
          Assinatura
        </button>
      </div>

      {tab === 'dados' && <DadosTab oficina={oficina} onAtualizado={onAtualizado} />}
      {tab === 'endereco' && <EnderecoTab idOficina={oficina.IdOficina} />}
      {tab === 'servicos' && <ServicosTab idOficina={oficina.IdOficina} />}
      {tab === 'assinatura' && <AssinaturaTab idOficina={oficina.IdOficina} />}
    </Modal>
  );
};

export default OficinaDetalheModal;