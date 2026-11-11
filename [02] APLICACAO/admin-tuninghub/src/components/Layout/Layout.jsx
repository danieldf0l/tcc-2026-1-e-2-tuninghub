import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const CHAVE_SIDEBAR = 'tuninghub-sidebar-recolhida';

const lerRecolhida = () => {
  try {
    return localStorage.getItem(CHAVE_SIDEBAR) === '1';
  } catch {
    return false;
  }
};

/*
  Estrutura de todas as telas logadas:
  - desktop: sidebar fixa à esquerda, que pode ser recolhida (só ícones); a escolha fica salva
  - tablet/celular (até 900px): a sidebar vira um menu que desliza, aberto pelo botão ☰ do header
*/
const Layout = () => {
  const [recolhida, setRecolhida] = useState(lerRecolhida);
  const [menuMovelAberto, setMenuMovelAberto] = useState(false);

  const alternarRecolhida = () => {
    setRecolhida((atual) => {
      const nova = !atual;
      try {
        localStorage.setItem(CHAVE_SIDEBAR, nova ? '1' : '0');
      } catch {
        // sem localStorage: só não lembra a escolha
      }
      return nova;
    });
  };

  // Esc fecha o menu no celular
  useEffect(() => {
    if (!menuMovelAberto) return undefined;
    const aoTeclar = (e) => {
      if (e.key === 'Escape') setMenuMovelAberto(false);
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [menuMovelAberto]);

  const classes = [
    'layout',
    recolhida && 'layout--recolhida',
    menuMovelAberto && 'layout--menu-aberto',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <a href="#conteudo" className="layout__pular">Pular para o conteúdo</a>

      <Sidebar
        recolhida={recolhida}
        onAlternarRecolhida={alternarRecolhida}
        onFecharMenuMovel={() => setMenuMovelAberto(false)}
      />

      {menuMovelAberto && (
        <div className="layout__fundo" onClick={() => setMenuMovelAberto(false)} aria-hidden="true" />
      )}

      <div className="layout__principal">
        <Header onAbrirMenu={() => setMenuMovelAberto(true)} />
        <main id="conteudo" className="layout__conteudo" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;