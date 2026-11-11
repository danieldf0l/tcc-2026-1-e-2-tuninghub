import { Loader2 } from 'lucide-react';
import './Button.css';

/*
  <Button onClick={salvar}>Salvar</Button>
  <Button variante="secundario" icone={Plus}>Novo modelo</Button>
  <Button variante="perigo" carregando={salvando}>Desativar</Button>
  <Button type="submit" disabled={!alterado}>Salvar</Button>

  variante: 'primario' | 'secundario' | 'fantasma' | 'perigo'
  tamanho:  'md' | 'sm'

  <IconButton icone={Pencil} rotulo="Editar" onClick={...} />
  (rotulo é obrigatório: vira aria-label e dica ao passar o mouse)
*/

const TAMANHO_ICONE = { sm: 14, md: 16 };

export const Button = ({
  variante = 'primario',
  tamanho = 'md',
  icone: Icone,
  iconeDireita: IconeDireita,
  carregando = false,
  larguraTotal = false,
  type = 'button',
  disabled,
  className = '',
  children,
  ...props
}) => {
  const classes = [
    'botao',
    `botao--${variante}`,
    `botao--${tamanho}`,
    larguraTotal && 'botao--largura-total',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {carregando ? (
        <Loader2 className="botao__spinner" size={TAMANHO_ICONE[tamanho]} aria-hidden="true" />
      ) : (
        Icone && <Icone size={TAMANHO_ICONE[tamanho]} aria-hidden="true" />
      )}
      {children}
      {IconeDireita && !carregando && <IconeDireita size={TAMANHO_ICONE[tamanho]} aria-hidden="true" />}
    </button>
  );
};

export const IconButton = ({
  icone: Icone,
  rotulo,
  variante = 'fantasma',
  tamanho = 'md',
  className = '',
  ...props
}) => (
  <button
    type="button"
    className={`botao-icone botao--${variante} botao-icone--${tamanho} ${className}`}
    aria-label={rotulo}
    title={rotulo}
    {...props}
  >
    <Icone size={tamanho === 'sm' ? 16 : 18} aria-hidden="true" />
  </button>
);

export default Button;