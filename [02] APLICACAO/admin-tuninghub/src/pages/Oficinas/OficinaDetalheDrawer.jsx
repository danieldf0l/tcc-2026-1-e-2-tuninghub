import { useState } from 'react';
import { MapPin, Receipt, Store, Wrench } from 'lucide-react';
import { useConfirmarDescarte } from '../../hooks/useConfirmarDescarte';
import { formatarCnpj } from '../../utils/formatadores';
import Drawer from '../../components/ui/Drawer';
import Tabs from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/Badge';
import DadosTab from './DadosTab';
import EnderecoTab from './EnderecoTab';
import ServicosTab from './ServicosTab';
import AssinaturaTab from './AssinaturaTab';

/*
  Detalhe da oficina num painel lateral com abas.
  As abas com formulário (Dados e Endereço) avisam quando há alteração não salva:
  trocar de aba ou fechar o painel pergunta antes de descartar.
*/
const ABAS = [
  { id: 'dados', rotulo: 'Dados', icone: Store },
  { id: 'endereco', rotulo: 'Endereço', icone: MapPin },
  { id: 'servicos', rotulo: 'Serviços', icone: Wrench },
  { id: 'assinatura', rotulo: 'Assinaturas', icone: Receipt },
];

const ConteudoDrawer = ({ oficina, onFechar, onAtualizado, onAlternarStatus }) => {
  const podeDescartar = useConfirmarDescarte();
  const [aba, setAba] = useState('dados');
  const [sujo, setSujo] = useState(false);

  const trocarAba = async (novaAba) => {
    if (novaAba === aba) return;
    if (!(await podeDescartar(sujo))) return;
    setSujo(false);
    setAba(novaAba);
  };

  const fechar = async () => {
    if (await podeDescartar(sujo)) onFechar();
  };

  return (
    <Drawer
      aberto
      largura="lg"
      onFechar={fechar}
      titulo={oficina.NomeOficina}
      subtitulo={`CNPJ ${formatarCnpj(oficina.CNPJ)}`}
      acoesCabecalho={<StatusBadge status={oficina.Ativo ? 'ativa' : 'inativa'} />}
    >
      <div className="drawer-oficina__abas">
        <Tabs rotulo="Detalhes da oficina" abas={ABAS} ativa={aba} onChange={trocarAba} />
      </div>

      {aba === 'dados' && (
        <DadosTab
          oficina={oficina}
          onAtualizado={onAtualizado}
          onAlternarStatus={onAlternarStatus}
          onSujoChange={setSujo}
        />
      )}
      {aba === 'endereco' && <EnderecoTab idOficina={oficina.IdOficina} onSujoChange={setSujo} />}
      {aba === 'servicos' && <ServicosTab idOficina={oficina.IdOficina} />}
      {aba === 'assinatura' && <AssinaturaTab oficina={oficina} />}
    </Drawer>
  );
};

// O "key" recria o conteúdo ao trocar de oficina (volta para a aba Dados, sem rascunho antigo)
const OficinaDetalheDrawer = ({ oficina, ...props }) =>
  oficina ? <ConteudoDrawer key={oficina.IdOficina} oficina={oficina} {...props} /> : null;

export default OficinaDetalheDrawer;