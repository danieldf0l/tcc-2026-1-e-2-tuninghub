import { useEffect, useMemo, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import { mensagemErro } from '../../utils/erroApi';
import { contem, normalizar } from '../../utils/texto';
import { Input } from '../../components/ui/Campo';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { listarServicosDaOficina } from '../../api/oficinaServicoService';

// Serviços que a oficina oferece (somente leitura: quem escolhe é a própria oficina, pelo app)
const ServicosTab = ({ idOficina }) => {
  const [servicos, setServicos] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    listarServicosDaOficina(idOficina)
      .then((dados) => {
        setServicos(dados);
        setErro('');
      })
      .catch((error) => setErro(mensagemErro(error, 'Não foi possível carregar os serviços.')));
  }, [idOficina, tentativa]);

  const grupos = useMemo(() => {
    const termo = normalizar(busca);
    const mapa = new Map();
    (servicos || [])
      .filter((s) => contem(s.Nome, termo) || contem(s.Categoria, termo))
      .sort((a, b) => a.Nome.localeCompare(b.Nome, 'pt-BR'))
      .forEach((s) => {
        const categoria = s.Categoria || 'Sem categoria';
        if (!mapa.has(categoria)) mapa.set(categoria, []);
        mapa.get(categoria).push(s);
      });
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [servicos, busca]);

  if (erro && !servicos) {
    return <ErrorState compacto descricao={erro} onTentarNovamente={() => setTentativa((t) => t + 1)} />;
  }

  if (!servicos) {
    return (
      <div className="drawer-oficina__secoes">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} altura={56} raio="var(--radius-md)" />
        ))}
      </div>
    );
  }

  if (servicos.length === 0) {
    return (
      <EmptyState
        compacto
        icone={Wrench}
        titulo="Nenhum serviço vinculado"
        descricao="A oficina escolhe os serviços que oferece pelo app."
      />
    );
  }

  return (
    <div className="drawer-oficina__secoes">
      <p className="secao__descricao">
        {servicos.length} {servicos.length === 1 ? 'serviço oferecido' : 'serviços oferecidos'}. Quem escolhe é a própria
        oficina, pelo app.
      </p>

      {servicos.length > 8 && (
        <Input
          type="search"
          icone={Search}
          placeholder="Buscar serviço..."
          aria-label="Buscar serviço"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          semMargem
        />
      )}

      {grupos.length === 0 ? (
        <EmptyState compacto icone={Search} titulo="Nenhum serviço encontrado" />
      ) : (
        grupos.map(([categoria, itens]) => (
          <section key={categoria} className="secao">
            <h3 className="secao__titulo">
              {categoria} <span className="secao__contador">{itens.length}</span>
            </h3>
            <ul className="lista-chips">
              {itens.map((s) => (
                <li key={s.IdServico} className="chip-simples">
                  {s.Nome}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};

export default ServicosTab;