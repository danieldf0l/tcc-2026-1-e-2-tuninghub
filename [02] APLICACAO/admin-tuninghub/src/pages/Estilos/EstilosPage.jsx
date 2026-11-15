import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListChecks, Palette } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';
import EstiloTab from './EstiloTab';
import KitServicosTab from './KitServicosTab';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';

/*
  A aba fica na URL (?aba=kit), junto com os filtros dela.
  "Montar kit" na aba Estilos abre o Kit já com o estilo escolhido (?aba=kit&estilo=STANCE).
  Sair da aba Kit com alterações não salvas pergunta antes.
*/
const EstilosPage = () => {
  const [params, setParams] = useSearchParams();
  const aba = params.get('aba') === 'kit' ? 'kit' : 'estilos';
  const [kitSujo, setKitSujo] = useState(false);
  const podeDescartar = useConfirmarDescarte();

  const trocarAba = async (novaAba, filtrosIniciais = {}) => {
    if (novaAba === aba) return;
    if (aba === 'kit' && !(await podeDescartar(kitSujo))) return;
    setParams(novaAba === 'kit' ? { aba: 'kit', ...filtrosIniciais } : { ...filtrosIniciais });
  };

  return (
    <div>
      <PageHeader
        titulo="Estilos de customização"
        subtitulo="Estilos que o entusiasta escolhe ao criar um projeto, e os serviços que cada um sugere."
      >
        <Tabs
          rotulo="Estilos e kit de serviços"
          abas={[
            { id: 'estilos', rotulo: 'Estilos', icone: Palette },
            { id: 'kit', rotulo: 'Kit de serviços', icone: ListChecks },
          ]}
          ativa={aba}
          onChange={(id) => trocarAba(id)}
        />
      </PageHeader>

      {aba === 'estilos' ? (
        <EstiloTab onMontarKit={(codigo) => trocarAba('kit', { estilo: codigo })} />
      ) : (
        <KitServicosTab onSujoChange={setKitSujo} />
      )}
    </div>
  );
};

export default EstilosPage;