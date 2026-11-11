import { useSearchParams } from 'react-router-dom';
import { Car, CarFront } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import MontadoraTab from './MontadoraTab';
import ModeloTab from './ModeloTab';

/*
  A aba fica na URL (?aba=modelos), junto com os filtros dela.
  Trocar de aba limpa os filtros da aba anterior.
*/
const MontadorasPage = () => {
  const [params, setParams] = useSearchParams();
  const aba = params.get('aba') === 'modelos' ? 'modelos' : 'montadoras';

  const trocarAba = (novaAba, filtrosIniciais = {}) => {
    setParams(novaAba === 'modelos' ? { aba: 'modelos', ...filtrosIniciais } : { ...filtrosIniciais });
  };

  return (
    <div>
      <PageHeader
        titulo="Montadoras e modelos"
        subtitulo="Catálogo de carros usado pelo app na criação de projetos."
      >
        <Tabs
          rotulo="Catálogo de carros"
          abas={[
            { id: 'montadoras', rotulo: 'Montadoras', icone: Car },
            { id: 'modelos', rotulo: 'Modelos', icone: CarFront },
          ]}
          ativa={aba}
          onChange={(id) => trocarAba(id)}
        />
      </PageHeader>

      {aba === 'montadoras' ? (
        <MontadoraTab onVerModelos={(idMontadora) => trocarAba('modelos', { montadora: String(idMontadora) })} />
      ) : (
        <ModeloTab />
      )}
    </div>
  );
};

export default MontadorasPage;