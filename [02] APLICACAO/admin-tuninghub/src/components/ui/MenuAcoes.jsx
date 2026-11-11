import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { IconButton } from './Button';
import './MenuAcoes.css';

/*
  Botão ⋯ com menu de ações (usado no fim de cada linha da DataTable).

  <MenuAcoes itens={[
    { rotulo: 'Editar', icone: Pencil, onClick: () => abrirEditar(m) },
    { rotulo: 'Desativar', icone: Power, onClick: () => desativar(m), perigo: true, oculto: !m.Ativo },
  ]} />

  O menu é desenhado direto no <body> com posição fixa, então não é cortado
  pela rolagem da tabela nem por um Drawer.
*/
const ALTURA_ESTIMADA = 220;

const MenuAcoes = ({ itens, rotulo = 'Mais ações' }) => {
  const [posicao, setPosicao] = useState(null);
  const botaoRef = useRef(null);
  const menuRef = useRef(null);
  const visiveis = itens.filter((item) => !item.oculto);
  const aberto = posicao !== null;

  const abrir = () => {
    const r = botaoRef.current.getBoundingClientRect();
    const abrirParaCima = window.innerHeight - r.bottom < ALTURA_ESTIMADA;
    setPosicao({
      right: window.innerWidth - r.right,
      ...(abrirParaCima ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
    });
  };

  const fechar = (devolverFoco = true) => {
    setPosicao(null);
    if (devolverFoco) botaoRef.current?.querySelector('button')?.focus();
  };

  useEffect(() => {
    if (!aberto) return undefined;

    menuRef.current?.querySelector('button:not(:disabled)')?.focus();

    const cliqueFora = (e) => {
      if (!menuRef.current?.contains(e.target) && !botaoRef.current?.contains(e.target)) {
        setPosicao(null);
      }
    };
    const fecharSemFoco = () => setPosicao(null);

    document.addEventListener('mousedown', cliqueFora);
    window.addEventListener('resize', fecharSemFoco);
    window.addEventListener('scroll', fecharSemFoco, true);
    return () => {
      document.removeEventListener('mousedown', cliqueFora);
      window.removeEventListener('resize', fecharSemFoco);
      window.removeEventListener('scroll', fecharSemFoco, true);
    };
  }, [aberto]);

  const aoTeclar = (e) => {
    const botoes = [...menuRef.current.querySelectorAll('button:not(:disabled)')];
    const indice = botoes.indexOf(document.activeElement);

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // não fecha o Drawer junto
      fechar();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      botoes[(indice + 1) % botoes.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      botoes[(indice - 1 + botoes.length) % botoes.length]?.focus();
    } else if (e.key === 'Tab') {
      fechar(false);
    }
  };

  if (visiveis.length === 0) return null;

  return (
    <>
      <span ref={botaoRef} style={{ display: 'inline-flex' }}>
        <IconButton
          icone={MoreHorizontal}
          rotulo={rotulo}
          tamanho="sm"
          aria-haspopup="menu"
          aria-expanded={aberto}
          onClick={() => (aberto ? fechar() : abrir())}
        />
      </span>

      {aberto &&
        createPortal(
          <div ref={menuRef} className="menu-acoes" role="menu" style={posicao} onKeyDown={aoTeclar}>
            {visiveis.map((item) => {
              const Icone = item.icone;
              return (
                <button
                  key={item.rotulo}
                  type="button"
                  role="menuitem"
                  className={`menu-acoes__item${item.perigo ? ' menu-acoes__item--perigo' : ''}`}
                  disabled={item.desabilitado}
                  onClick={() => {
                    fechar(false);
                    item.onClick();
                  }}
                >
                  {Icone && <Icone size={16} aria-hidden="true" />}
                  {item.rotulo}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

export default MenuAcoes;