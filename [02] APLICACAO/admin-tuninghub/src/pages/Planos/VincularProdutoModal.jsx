import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
import { mensagemErro } from '../../utils/erroApi';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Campo';
import { vincularProdutoExterno } from '../../api/planoService';

const VincularProdutoModal = ({ plano, onClose, onSalvo }) => {
  const toast = useToast();
  const podeDescartar = useConfirmarDescarte();
  const original = plano.IdProdutoExterno || '';
  const [idProdutoExterno, setIdProdutoExterno] = useState(original);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const alterado = idProdutoExterno.trim() !== original;

  const fechar = async () => {
    if (await podeDescartar(alterado)) onClose();
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const id = idProdutoExterno.trim();
    if (!id) {
      setErro('Cole o Id do produto.');
      return;
    }

    setSalvando(true);
    try {
      await vincularProdutoExterno(plano.IdPlano, id);
      toast.sucesso(`Plano "${plano.Nome}" vinculado ao AbacatePay.`);
      onSalvo();
    } catch (error) {
      setErro(mensagemErro(error, 'Erro ao vincular produto externo.'));
      setSalvando(false);
    }
  };

  return (
    <Modal title={original ? 'Alterar produto do AbacatePay' : 'Vincular ao AbacatePay'} onClose={fechar}>
      <form onSubmit={handleSalvar} noValidate>
        <p className="modal-texto">
          Plano <strong style={{ color: 'var(--text)' }}>{plano.Nome}</strong>. Cole o Id do produto já criado no
          painel do AbacatePay. É ele que define o preço cobrado no checkout.
        </p>

        <Input
          label="Id do produto"
          value={idProdutoExterno}
          onChange={(e) => {
            setIdProdutoExterno(e.target.value);
            setErro('');
          }}
          erro={erro}
          placeholder="Ex.: prod_..."
          dica={original ? 'Novas assinaturas passam a usar o produto novo.' : undefined}
          required
          autoFocus
        />

        <div className="form-actions">
          <Button variante="secundario" onClick={fechar}>
            Cancelar
          </Button>
          <Button type="submit" carregando={salvando} disabled={!alterado || !idProdutoExterno.trim()}>
            {original ? 'Salvar' : 'Vincular'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VincularProdutoModal;