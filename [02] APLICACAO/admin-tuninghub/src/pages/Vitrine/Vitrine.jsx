import { useState } from 'react';
import { Car } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { Logo, LogoIcone } from '../../components/ui/Logo';
import { SkeletonCards, SkeletonTabela } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

/*
  Vitrine de componentes. Só existe em "npm run dev" (rota /_ui).
  Não entra no build de produção.
*/
const Secao = ({ titulo, children }) => (
  <section style={{ marginBottom: 'var(--space-10)' }}>
    <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>{titulo}</h2>
    {children}
  </section>
);

const linha = { display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' };

const Vitrine = () => {
  const { tema, modo, definirModo } = useTheme();
  const toast = useToast();
  const confirmar = useConfirm();
  const [resposta, setResposta] = useState('—');

  const testarConfirmar = async (perigo) => {
    const ok = await confirmar(
      perigo
        ? {
            titulo: 'Desativar "Volkswagen"?',
            mensagem: 'Todos os modelos dessa montadora também serão desativados.',
            textoConfirmar: 'Desativar',
            perigo: true,
          }
        : { titulo: 'Reativar "Volkswagen"?', textoConfirmar: 'Reativar' }
    );
    setResposta(ok ? 'confirmou' : 'cancelou');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <Secao titulo={`Tema (modo: ${modo}, aplicado: ${tema})`}>
        <div style={linha}>
          <button className="btn-secondary" onClick={() => definirModo('light')}>Claro</button>
          <button className="btn-secondary" onClick={() => definirModo('dark')}>Escuro</button>
          <button className="btn-secondary" onClick={() => definirModo('system')}>Sistema</button>
        </div>
      </Secao>

      <Secao titulo="Logo">
        <div style={linha}>
          <LogoIcone />
          <LogoIcone variante="auto" />
          <Logo tamanho={32} />
          <Logo variante="marca" tamanho={32} />
        </div>
      </Secao>

      <Secao titulo="Toast">
        <div style={linha}>
          <button className="btn-secondary" onClick={() => toast.sucesso('Modelo salvo.')}>Sucesso</button>
          <button className="btn-secondary" onClick={() => toast.erro('Já existe um modelo com esse nome.')}>Erro</button>
          <button className="btn-secondary" onClick={() => toast.aviso('A montadora está inativa.')}>Aviso</button>
          <button className="btn-secondary" onClick={() => toast.info('Nenhuma alteração para salvar.')}>Info</button>
          <button
            className="btn-secondary"
            onClick={() =>
              toast.sucesso('Modelo "Golf GTI" desativado.', {
                acao: { rotulo: 'Desfazer', onClick: () => toast.info('Desfeito.') },
              })
            }
          >
            Com Desfazer
          </button>
        </div>
      </Secao>

      <Secao titulo={`Diálogo de confirmação (última resposta: ${resposta})`}>
        <div style={linha}>
          <button className="btn-secondary" onClick={() => testarConfirmar(false)}>Normal</button>
          <button className="btn-secondary" onClick={() => testarConfirmar(true)}>Perigo</button>
        </div>
      </Secao>

      <Secao titulo="Skeleton">
        <SkeletonCards quantidade={4} />
        <div style={{ height: 'var(--space-4)' }} />
        <SkeletonTabela linhas={4} colunas={4} />
      </Secao>

      <Secao titulo="Estado vazio e erro">
        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: '1fr 1fr' }}>
          <EmptyState
            icone={Car}
            titulo="Nenhum modelo encontrado"
            descricao="Tente outra busca ou cadastre um modelo novo."
            acao={<button className="btn-primary">Novo modelo</button>}
          />
          <ErrorState onTentarNovamente={() => toast.info('Tentando de novo...')} />
        </div>
      </Secao>
    </div>
  );
};

export default Vitrine;