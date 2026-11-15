import { useSearchParams } from 'react-router-dom';
import { Tags, Wrench } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import ServicoTab from './ServicoTab';
import CategoriaTab from './CategoriaTab';

/*
  A aba fica na URL (?aba=categorias), junto com os filtros dela.
  Trocar de aba limpa os filtros da aba anterior.
*/
const ServicosPage = () => {
  const [params, setParams] = useSearchParams();
  const aba = params.get('aba') === 'categorias' ? 'categorias' : 'servicos';

  const trocarAba = (novaAba, filtrosIniciais = {}) => {
    setParams(novaAba === 'categorias' ? { aba: 'categorias', ...filtrosIniciais } : { ...filtrosIniciais });
  };

  return (
    <div>
      <PageHeader
        titulo="Serviços"
        subtitulo="Serviços que as oficinas oferecem e que entram na To-do List dos projetos."
      >
        <Tabs
          rotulo="Serviços e categorias"
          abas={[
            { id: 'servicos', rotulo: 'Serviços', icone: Wrench },
            { id: 'categorias', rotulo: 'Categorias', icone: Tags },
          ]}
          ativa={aba}
          onChange={(id) => trocarAba(id)}
        />
      </PageHeader>

      {aba === 'servicos' ? (
        <ServicoTab />
      ) : (
        <CategoriaTab onVerServicos={(idCategoria) => trocarAba('servicos', { categoria: String(idCategoria) })} />
      )}
    </div>
  );
};

export default ServicosPage;