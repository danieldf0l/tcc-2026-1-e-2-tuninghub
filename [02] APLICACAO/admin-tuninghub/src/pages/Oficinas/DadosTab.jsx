import { useEffect, useState } from 'react';
import { Copy, Mail, Phone, Power, RotateCcw } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAlteracoesNaoSalvas } from '../../hooks/useAlteracoesNaoSalvas';
import { mensagemErro } from '../../utils/erroApi';
import { formatarCnpj, formatarData, formatarTelefone, somenteDigitos } from '../../utils/formatadores';
import { Button, IconButton } from '../../components/ui/Button';
import { atualizarFaixaPreco } from '../../api/oficinaService';

const FAIXAS_PRECO = [
  { valor: '$', titulo: '$', descricao: 'Econômico' },
  { valor: '$$', titulo: '$$', descricao: 'Intermediário' },
  { valor: '$$$', titulo: '$$$', descricao: 'Premium' },
];

const DadosTab = ({ oficina, onAtualizado, onAlternarStatus, onSujoChange }) => {
  const toast = useToast();
  const original = oficina.FaixaPreco || '';
  const [faixa, setFaixa] = useState(original);
  const [salvando, setSalvando] = useState(false);
  const [erroFaixa, setErroFaixa] = useState('');
  const [alterandoStatus, setAlterandoStatus] = useState(false);

  const alterado = faixa !== original;
  useAlteracoesNaoSalvas(alterado);

  useEffect(() => {
    onSujoChange?.(alterado);
  }, [alterado, onSujoChange]);
  useEffect(() => () => onSujoChange?.(false), [onSujoChange]);

  const copiar = async (texto, rotulo) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.info(`${rotulo} copiado.`);
    } catch {
      toast.erro('Não foi possível copiar.');
    }
  };

  const salvarFaixa = async (e) => {
    e.preventDefault();
    if (!faixa) return;
    setErroFaixa('');
    setSalvando(true);
    try {
      await atualizarFaixaPreco(oficina.IdOficina, faixa);
      await onAtualizado();
      toast.sucesso(`Faixa de preço de "${oficina.NomeOficina}" atualizada para ${faixa}.`);
    } catch (error) {
      setErroFaixa(mensagemErro(error, 'Erro ao atualizar a faixa de preço.'));
    } finally {
      setSalvando(false);
    }
  };

  const alternarStatus = async () => {
    setAlterandoStatus(true);
    await onAlternarStatus(oficina);
    setAlterandoStatus(false);
  };

  const telefone = somenteDigitos(oficina.Telefone);

  return (
    <div className="drawer-oficina__secoes">
      {/* ---------- Informações ---------- */}
      <section className="secao">
        <h3 className="secao__titulo">Informações</h3>
        <dl className="lista-dados">
          <div className="lista-dados__item">
            <dt>Proprietário</dt>
            <dd>{oficina.NomeProprietario || '—'}</dd>
          </div>
          <div className="lista-dados__item">
            <dt>E-mail</dt>
            <dd className="lista-dados__com-acao">
              <a href={`mailto:${oficina.Email}`}>{oficina.Email}</a>
              <IconButton icone={Copy} rotulo="Copiar e-mail" tamanho="sm" onClick={() => copiar(oficina.Email, 'E-mail')} />
            </dd>
          </div>
          <div className="lista-dados__item">
            <dt>Telefone</dt>
            <dd className="lista-dados__com-acao">
              {telefone ? (
                <>
                  <a href={`tel:${telefone}`}>{formatarTelefone(telefone)}</a>
                  <IconButton icone={Copy} rotulo="Copiar telefone" tamanho="sm" onClick={() => copiar(telefone, 'Telefone')} />
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="lista-dados__item">
            <dt>CNPJ</dt>
            <dd className="lista-dados__com-acao">
              {formatarCnpj(oficina.CNPJ)}
              <IconButton
                icone={Copy}
                rotulo="Copiar CNPJ"
                tamanho="sm"
                onClick={() => copiar(somenteDigitos(oficina.CNPJ), 'CNPJ')}
              />
            </dd>
          </div>
          {oficina.DataCriacao && (
            <div className="lista-dados__item">
              <dt>Cadastro</dt>
              <dd>{formatarData(oficina.DataCriacao)}</dd>
            </div>
          )}
        </dl>
        <div className="secao__atalhos">
          <Button variante="secundario" tamanho="sm" icone={Mail} onClick={() => (window.location.href = `mailto:${oficina.Email}`)}>
            Enviar e-mail
          </Button>
          {telefone && (
            <Button
              variante="secundario"
              tamanho="sm"
              icone={Phone}
              onClick={() => window.open(`https://wa.me/55${telefone}`, '_blank', 'noopener')}
            >
              WhatsApp
            </Button>
          )}
        </div>
      </section>

      {/* ---------- Faixa de preço ---------- */}
      <section className="secao">
        <h3 className="secao__titulo">Faixa de preço</h3>
        <p className="secao__descricao">Aparece no perfil da oficina e nos filtros de busca do app.</p>
        <form onSubmit={salvarFaixa}>
          <div className="opcoes-faixa" role="radiogroup" aria-label="Faixa de preço">
            {FAIXAS_PRECO.map((f) => (
              <label key={f.valor} className={`opcao-faixa${faixa === f.valor ? ' opcao-faixa--ativa' : ''}`}>
                <input
                  type="radio"
                  name="faixaPreco"
                  value={f.valor}
                  checked={faixa === f.valor}
                  onChange={() => {
                    setFaixa(f.valor);
                    setErroFaixa('');
                  }}
                />
                <span className="opcao-faixa__titulo">{f.titulo}</span>
                <span className="opcao-faixa__descricao">{f.descricao}</span>
              </label>
            ))}
          </div>
          {erroFaixa && <p className="campo__erro" style={{ marginTop: 'var(--space-2)' }}>{erroFaixa}</p>}
          {alterado && (
            <div className="secao__acoes">
              <Button variante="secundario" onClick={() => setFaixa(original)} disabled={salvando}>
                Cancelar
              </Button>
              <Button type="submit" carregando={salvando}>
                Salvar faixa
              </Button>
            </div>
          )}
        </form>
      </section>

      {/* ---------- Conta ---------- */}
      <section className={`secao${oficina.Ativo ? ' secao--perigo' : ''}`}>
        <h3 className="secao__titulo">Conta</h3>
        {oficina.Ativo ? (
          <>
            <p className="secao__descricao">
              Desativar bloqueia o login da oficina na hora e tira ela das buscas do app. Dá para reativar depois.
            </p>
            <Button variante="perigo" icone={Power} carregando={alterandoStatus} onClick={alternarStatus}>
              Desativar conta
            </Button>
          </>
        ) : (
          <>
            <p className="secao__descricao">Esta conta está desativada: a oficina não consegue entrar no app.</p>
            <Button variante="secundario" icone={RotateCcw} carregando={alterandoStatus} onClick={alternarStatus}>
              Reativar conta
            </Button>
          </>
        )}
      </section>
    </div>
  );
};

export default DadosTab;