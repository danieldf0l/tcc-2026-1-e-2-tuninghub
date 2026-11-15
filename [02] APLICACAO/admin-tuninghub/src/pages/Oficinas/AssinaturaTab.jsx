import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Receipt } from 'lucide-react';
import { mensagemErro } from '../../utils/erroApi';
import { formatarData } from '../../utils/formatadores';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { listarAssinaturasAdmin } from '../../api/assinaturaService';

// Assinatura que vale hoje: ATIVA dentro da validade, ou PENDENTE (checkout aberto)
const vigente = (lista) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return (
    lista.find((a) => a.Status === 'ATIVA' && (!a.DataFim || new Date(a.DataFim) >= hoje)) ||
    lista.find((a) => a.Status === 'PENDENTE') ||
    null
  );
};

const diasAte = (data) => {
  const fim = new Date(data);
  const hoje = new Date();
  fim.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  return Math.round((fim - hoje) / 86400000);
};

// Histórico de assinaturas da oficina (somente leitura: o ciclo de pagamento é da oficina/checkout)
const AssinaturaTab = ({ oficina }) => {
  const navigate = useNavigate();
  const [assinaturas, setAssinaturas] = useState(null);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    listarAssinaturasAdmin()
      .then((todas) => {
        setAssinaturas(
          todas
            .filter((a) => a.IdOficina === oficina.IdOficina)
            .sort((a, b) => new Date(b.DataCriacao || b.DataInicio) - new Date(a.DataCriacao || a.DataInicio))
        );
        setErro('');
      })
      .catch((error) => setErro(mensagemErro(error, 'Não foi possível carregar as assinaturas.')));
  }, [oficina.IdOficina, tentativa]);

  if (erro && !assinaturas) {
    return <ErrorState compacto descricao={erro} onTentarNovamente={() => setTentativa((t) => t + 1)} />;
  }

  if (!assinaturas) {
    return (
      <div className="drawer-oficina__secoes">
        <Skeleton altura={88} raio="var(--radius-md)" />
        <Skeleton altura={140} raio="var(--radius-md)" />
      </div>
    );
  }

  if (assinaturas.length === 0) {
    return (
      <EmptyState
        compacto
        icone={Receipt}
        titulo="Sem assinaturas"
        descricao="Esta oficina ainda não escolheu nenhum plano."
      />
    );
  }

  const atual = vigente(assinaturas);
  const dias = atual?.Status === 'ATIVA' && atual.DataFim ? diasAte(atual.DataFim) : null;

  return (
    <div className="drawer-oficina__secoes">
      <section className="plano-atual">
        <p className="plano-atual__rotulo">Plano atual</p>
        {atual ? (
          <>
            <div className="plano-atual__linha">
              <span className="plano-atual__nome">{atual.NomePlano}</span>
              <StatusBadge status={atual.Status} />
            </div>
            <p className="plano-atual__detalhe">
              {atual.Status === 'PENDENTE'
                ? 'Checkout aberto, aguardando a confirmação do pagamento.'
                : atual.DataFim
                  ? `Vence em ${formatarData(atual.DataFim)}${dias != null ? ` (${dias === 0 ? 'hoje' : `em ${dias} ${dias === 1 ? 'dia' : 'dias'}`})` : ''}.`
                  : 'Sem data de vencimento.'}
            </p>
          </>
        ) : (
          <p className="plano-atual__detalhe">Nenhuma assinatura em vigor. A última venceu ou foi cancelada.</p>
        )}
      </section>

      <section className="secao">
        <h3 className="secao__titulo">
          Histórico <span className="secao__contador">{assinaturas.length}</span>
        </h3>
        <ol className="historico">
          {assinaturas.map((a) => (
            <li key={a.IdAssinatura} className="historico__item">
              <div className="historico__textos">
                <span className="historico__plano">{a.NomePlano}</span>
                <span className="historico__periodo">
                  {formatarData(a.DataInicio)} → {formatarData(a.DataFim)}
                </span>
              </div>
              <StatusBadge status={a.Status} />
            </li>
          ))}
        </ol>
      </section>

      <div>
        <Button
          variante="secundario"
          tamanho="sm"
          iconeDireita={ExternalLink}
          onClick={() => navigate(`/assinaturas?busca=${encodeURIComponent(oficina.NomeOficina)}`)}
        >
          Abrir na tela de Assinaturas
        </Button>
      </div>
    </div>
  );
};

export default AssinaturaTab;