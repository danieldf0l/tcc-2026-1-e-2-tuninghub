import { useEffect } from 'react';
import './PageHeader.css';

/*
  Cabeçalho padrão de toda tela.

  <PageHeader
    titulo="Montadoras e modelos"
    subtitulo="Catálogo usado na criação de projetos no app."
    acoes={<Button icone={Plus}>Nova montadora</Button>}
  >
    <Tabs ... />        // opcional, fica logo abaixo do título
  </PageHeader>

  Também atualiza o título da aba do navegador.
*/
const PageHeader = ({ titulo, subtitulo, acoes, children }) => {
  useEffect(() => {
    document.title = titulo ? `${titulo} · TuningHub Admin` : 'TuningHub Admin';
  }, [titulo]);

  return (
    <header className="page-header">
      <div className="page-header__topo">
        <div className="page-header__textos">
          <h1 className="page-header__titulo">{titulo}</h1>
          {subtitulo && <p className="page-header__subtitulo">{subtitulo}</p>}
        </div>
        {acoes && <div className="page-header__acoes">{acoes}</div>}
      </div>
      {children && <div className="page-header__extra">{children}</div>}
    </header>
  );
};

export default PageHeader;