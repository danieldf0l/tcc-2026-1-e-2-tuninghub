import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { useCamadaModal } from '../../hooks/useCamadaModal';
import './Drawer.css';

/*
  Painel que desliza da direita, para detalhe e edição longa.

  <Drawer
    aberto={!!oficinaSelecionada}
    onFechar={fecharDrawer}               // Esc, X e clique fora chamam isso
    titulo="Garagem Tunning Pro"
    subtitulo="CNPJ 12.345.678/0001-90"
    acoesCabecalho={<StatusBadge status="ativa" />}
    rodape={<><Button variante="secundario" onClick={fecharDrawer}>Cancelar</Button><Button type="submit" form="form-oficina">Salvar</Button></>}
    largura="lg"                          // 'md' (520px) | 'lg' (720px)
  >
    ...conteúdo (pode ter <Tabs />)...
  </Drawer>

  Para avisar de alterações não salvas, faça o onFechar perguntar com useConfirm()
  antes de fechar de fato.
*/
const PainelDrawer = ({ onFechar, titulo, subtitulo, acoesCabecalho, rodape, largura, children }) => {
  const painelRef = useRef(null);
  const aoTeclar = useCamadaModal(painelRef, onFechar);
  const idTitulo = useId();

  return createPortal(
    <div className="drawer-camada">
      <div className="drawer-fundo" onClick={onFechar} aria-hidden="true" />
      <aside
        ref={painelRef}
        className={`drawer drawer--${largura}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onKeyDown={aoTeclar}
      >
        <header className="drawer__cabecalho">
          <div className="drawer__textos">
            <h2 id={idTitulo} className="drawer__titulo">{titulo}</h2>
            {subtitulo && <p className="drawer__subtitulo">{subtitulo}</p>}
          </div>
          {acoesCabecalho && <div className="drawer__acoes-cabecalho">{acoesCabecalho}</div>}
          <IconButton icone={X} rotulo="Fechar" onClick={onFechar} />
        </header>

        <div className="drawer__corpo">{children}</div>

        {rodape && <footer className="drawer__rodape">{rodape}</footer>}
      </aside>
    </div>,
    document.body
  );
};

const Drawer = ({ aberto, largura = 'md', ...props }) =>
  aberto ? <PainelDrawer largura={largura} {...props} /> : null;

export default Drawer;